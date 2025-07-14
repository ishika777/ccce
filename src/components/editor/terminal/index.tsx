"use client";

import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "./xterm.css";
import { Loader2 } from "lucide-react";

export default function EditorTerminal({
    socket,
    terminal,
    setTerminal,
}: {
    socket: Socket;
    terminal: {
        id: string;
        terminal: Terminal | null;
    };
    setTerminal: React.Dispatch<
        React.SetStateAction<{ id: string; terminal: Terminal | null }>
    >;
}) {
    const terminalRef = useRef<HTMLDivElement | null>(null);
    const xtermRef = useRef<Terminal | null>(null);

    useEffect(() => {
        if (!terminalRef.current || xtermRef.current) return;

        const term = new Terminal({
            cursorBlink: true,
            cursorWidth: 1,
            theme: {
                background: "#1e1e1e",
                foreground: "#cccccc",
                cursor: "#00ff00",
            },
            fontSize: 12,
            fontWeight: 10,
            fontFamily: "Consolas",
            lineHeight: 1,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();

        // Send terminal input to backend
        const onData = term.onData((data) => {
            socket.emit("terminal-data", terminal.id, data);
        });

        // Handle resize
        const onResize = term.onResize(() => {
            fitAddon.fit();
            socket.emit("terminal-resize", term.rows, term.cols);
        });

        // Store the terminal reference globally
        xtermRef.current = term;

        // Set the terminal in parent state
        setTerminal({ id: terminal.id, terminal: term });

        return () => {
            onData.dispose();
            onResize.dispose();
            term.dispose(); // Clean up on unmount
            xtermRef.current = null;
        };
    }, [socket, terminal.id, setTerminal]);

    useEffect(() => {
        const handleOutput = (output: string) => {
            xtermRef.current?.write(output);
        };

        socket.on("terminal-response", handleOutput);

        return () => {
            socket.off("terminal-response", handleOutput);
        };
    }, [socket]);

    return (
        <div>
            <div ref={terminalRef} className="w-full h-full text-left">
                {!xtermRef.current && (
                    <div className="flex items-center text-muted-foreground p-2">
                        <Loader2 className="animate-spin mr-2 w-4 h-4" />
                        <span>Connecting to terminal....</span>
                    </div>
                )}
            </div>
        </div>
    );
}
