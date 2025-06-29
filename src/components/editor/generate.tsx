"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Check, Loader2, RotateCw, Sparkles } from "lucide-react";
import { Socket } from "socket.io-client";
import { Editor } from "@monaco-editor/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserType } from "../../lib/types";

export default function GenerateInput({
    user,
    socket,
    data,
    editor,
    cancel,
    submit,
    width,
    onExpand,
    onAccept,
}: {
    user: UserType;
    socket: Socket;
    data: {
        filePath: string;
        code: string;
        line: number;
    };
    editor: {
        language: string;
    };
    cancel: () => void;
    submit: (input: string) => void;
    width: number;
    onExpand: () => void;
    onAccept: (code: string) => void;
}) {
    const [code, setCode] = useState(``);

    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState({
        generate: false,
        regenerate: false,
    });
    const [input, setInput] = useState("");
    const router = useRouter();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }, []);

    const handleGenerate = async ({ regenerate = false }: { regenerate?: boolean }) => {
        if (user.generations >= 30) {
            toast.error("You reached the maximum # of generations.");
            return;
        }

        cancel()
        submit("dw")

        setCode("");
        setLoading({ generate: !regenerate, regenerate });

        const fileName = data.filePath.split("/").pop()!;
        socket.emit("generate-code", fileName, data.code, data.line, input);

        const handleChunk = (chunk: string) => {
            setCode((prev) => prev + chunk);
        };

        const handleDone = () => {
            setExpanded(true);
            onExpand();
            setLoading({ generate: false, regenerate: false });
            router.refresh();
            socket.off("generate-code-chunk", handleChunk);
            socket.off("generate-code-done", handleDone);
            socket.off("generate-code-error", handleError);
        };

        const handleError = (err: string) => {
            toast.error(err);
            setLoading({ generate: false, regenerate: false });
            socket.off("generate-code-chunk", handleChunk);
            socket.off("generate-code-done", handleDone);
            socket.off("generate-code-error", handleError);
        };

        socket.on("generate-code-chunk", handleChunk);
        socket.on("generate-code-done", handleDone);
        socket.on("generate-code-error", handleError);
    };


    useEffect(() => {
        if (code) {
            setExpanded(true);
            onExpand();
            setLoading({ generate: false, regenerate: false });
        }
    }, [code, onExpand]);

    return (
        <div className="w-full pr-4 space-y-2">
            <div className="flex items-center font-sans space-x-2">
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ width: width + "px" }}
                    placeholder="Generate code with a prompt"
                    className="
          h-8 w-full rounded-md border-1 border-muted-foreground bg-transparent px-3 py-1 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                    size={"sm"}
                    disabled={loading.generate || loading.regenerate || input === ""}
                    onClick={() => handleGenerate({})}
                    className="text-sm"
                >
                    {loading.generate ? (
                        <>
                            <Loader2 className="animate-spin h-3 w-3 mr-1" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-3 w-3 mr-1" />
                            Generate Code
                        </>
                    )}
                </Button>
            </div>
            {expanded && (
                <>
                    <div className="rounded-md border border-muted-foreground w-full h-28 overflow-y-scroll p-2">
                        <Editor
                            height={"100%"}
                            defaultLanguage={editor.language}
                            theme="vs-dark"
                            options={{
                                minimap: {
                                    enabled: false,
                                },
                                padding: {
                                    bottom: 4,
                                    top: 4,
                                },
                                scrollBeyondLastLine: false,
                                domReadOnly: true,
                                readOnly: true,
                                lineNumbers: "off",
                                glyphMargin: false,
                                folding: false,
                                lineDecorationsWidth: 0,
                                lineNumbersMinChars: 0,
                                fontFamily: "var(--font-geist-mono)",
                                fontSize: 12
                            }}
                            value={code}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            disabled={loading.generate || loading.regenerate}
                            size={"sm"}
                            onClick={() => {
                                onAccept(code)
                            }}
                        >
                            <Check className="w-2 h-2 mr-1" />
                            <span className="text-sm">

                                Accept
                            </span>
                        </Button>
                        <Button
                            onClick={() => handleGenerate({ regenerate: true })}
                            disabled={loading.generate || loading.regenerate}
                            variant={"outline"}
                            size={"sm"}
                            className="bg-transparent border-muted-foreground"
                        >
                            {loading.regenerate ? (
                                <>
                                    <Loader2 className="animate-spin h-2 w-2 mr-1" />
                                    Generating....
                                </>
                            ) : (
                                <>
                                    <RotateCw className="h-2 w-2 mr-1" />
                                    Re-Generate
                                </>
                            )}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}