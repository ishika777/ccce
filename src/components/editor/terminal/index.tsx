"use client"
import React, { useRef, useState, useEffect } from 'react'
import { Socket } from 'socket.io-client'
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "./xterm.css"
import { Loader2 } from 'lucide-react'

const EditorTerminal = ({ socket }: {
    socket: Socket
}) => {

    const terminalRef = useRef(null);
    const [term, setTerm] = useState<Terminal | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        // const terminal = new Terminal({
        //     cursorBlink: true,
        //     theme: {
        //         background: "#262626"
        //     },
        //     fontSize: 14,
        //     fontFamily: "var(--font-geist-mono)"
        // })

        // setTerm(terminal)
        // return () => {
        //     if (terminal) terminal.dispose()
        // }
    }, [])

    useEffect(() => {

        if (!term) return
        // const onConnect = () => {
        //     setTimeout(() => {
        //         socket.emit("create-terminal", { id: "testId" })
        //     }, 2000);
        // }

        // const onTerminalResponse = (response: {data: string}) => {
        //     const res = response.data
        //     term.write(res)
        // };


        // socket.on("connect", onConnect);
        // if (terminalRef.current) {
        //     socket.on("terminal-response", onTerminalResponse)

        //     const fitAddon = new FitAddon()

        //     // term.loadAddon(fitAddon)
        //     term.open(terminalRef.current)
        //     // fitAddon.fit()
        //     setTerm(term)

        // }

        // const disposable = term.onData((data) => {
        //     socket.emit("terminal-data", "testId", data);
        // })
        // socket.emit("terminal-data", {
        //     data: "\n"
        // })

        // return () => {
        //     socket.off("connect", onConnect)
        //     socket.off("terminal-response", onTerminalResponse)
        //     disposable.dispose()
        // }

    }, [term, terminalRef.current])

    return (
        <div>
            <div ref={terminalRef} className='w-full h-full text-xs text-left'></div>
            {
                term === null && (
                    <div className='flex items-center text-muted-foreground p-2'>
                        <Loader2 className='animate-spin mr-2 e-4 h-4' />
                        <span>Connecting to Terminal...</span>
                    </div>
                )
            }
        </div>
    )
}

export default EditorTerminal