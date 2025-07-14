"use client"

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "../ui/resizable"
import { ImperativePanelHandle } from "react-resizable-panels";
import { FileJson, Loader2, Plus, SquareTerminal, TerminalSquare } from "lucide-react";


import { Terminal } from "@xterm/xterm";
import { MonacoBinding } from "y-monaco";
import { useClerk } from "@clerk/nextjs";
import monaco from "monaco-editor";
import * as Y from "yjs";
import { BeforeMount, OnMount } from "@monaco-editor/react";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { TypedLiveblocksProvider, useRoom } from "@/frontend/liveblocks.config";

import Sidebar from "./sidebar";
import PreviewWindow from "./preview";
import GenerateInput from "./generate";
import { Cursors } from "./live/cursor";
import CustomTab from "../custom/customTab";
import DisableAccessModal from "./live/disableModel";

import { TTab, UserType, VirtualBoxType } from "../../lib/types";
import { TFile, TFolder } from "../../lib/types";
import { processFileType } from "../../lib/utils";


import { createId } from "@paralleldrive/cuid2";
import { getSocket } from "../../lib/socket";

const EditorTerminal = dynamic(() => import("./terminal"), {
    ssr: false,
});

const Editor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false
})
const CodeEditor = ({ userData, virtualBox }: {
    userData: UserType
    virtualBox: VirtualBoxType
}) => {


    const clerk = useClerk()
    const router = useRouter()
    const room = useRoom();

    const monacoRef = useRef<typeof monaco | null>(null)
    const [editorRef, setEditorRef] = useState<monaco.editor.IStandaloneCodeEditor>();
    const generateRef = useRef<HTMLDivElement>(null)
    const editorContainerRef = useRef<HTMLDivElement>(null)
    const generateWidgetRef = useRef<HTMLDivElement>(null)
    const previewPanelRef = useRef<ImperativePanelHandle>(null);



    const [editorLanguage, setEditorLanguage] = useState<string | undefined>(undefined)
    const [cursorLine, setCursorLine] = useState(0);
    const [generate, setGenerate] = useState<{
        show: boolean,
        id: string,
        width: number,
        line: number
        widget: monaco.editor.IContentWidget | undefined,
        pref: monaco.editor.ContentWidgetPositionPreference[]
    }>({
        show: false,
        id: "",
        width: 0,
        line: 0,
        widget: undefined,
        pref: []

    })


    const [provider, setProvider] = useState<TypedLiveblocksProvider>();
    // const [ai, setAi] = useState<boolean>(true);

    const [tree, setTree] = useState<(TFolder | TFile)[]>([]);
    const [tabs, setTabs] = useState<TTab[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const [activeFile, setActiveFile] = useState<string | null>(null)

    const [terminal, setTerminal] = useState<{ id: string; terminal: Terminal | null; }>({ id: "", terminal: null });
    const [creatingTerminal, setCreatingTerminal] = useState(false);
    const [disableAccess, setDisableAccess] = useState({ isDisabled: false, message: "" });
    const [previewLoading, setPreviewLoading] = useState<boolean>(false);
    const [previewUrl, setPreviewUrl] = useState<string>("");


    const [iframeKey, setIframeKey] = useState<number>(0);

    const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(
        virtualBox.type !== "react"
    );

    const socket = getSocket(userData.id, virtualBox.id);



    useEffect(() => {
        socket.emit("get-file-tree", virtualBox.userId, virtualBox.id)
    }, [])




    useEffect(() => {
        if (typeof window === 'undefined') return;
        socket.connect()

        socket.on('connect_error', (err) => {
            toast.error(`Connection failed: ${err.message}`)
            router.push("/dashboard")
        })


        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width } = entry.contentRect;
                setGenerate((prev) => {
                    return { ...prev, width };
                });
            }
        });

        if (editorContainerRef.current) {
            resizeObserver.observe(editorContainerRef.current)
        }



        return () => {
            socket.disconnect()
            resizeObserver.disconnect()
        }
    }, [])

    useEffect(() => {
        const onLoadedEvent = (tree: (TFolder | TFile)[]) => {
            console.log(tree)
            setTree(tree);
        }

        const onConnect = () => {
        }

        const onDisconnect = () => {
            setTerminal({ id: "", terminal: null })
        }

        const onTerminalResponse = (response: { id: string; data: string }) => {
            if (terminal?.terminal) {
                setIframeKey((prev) => prev + 1);
                terminal.terminal.write(response.data);
            } else {
                console.warn("Terminal not ready yet", response.id);
            }
        };


        const onDisableAccess = (message: string) => {
            setDisableAccess({
                isDisabled: true,
                message: message,
            });
        };

        const onTerminalError = (message: string) => {
            toast.error(message)
        }

        socket.on("connect", onConnect)
        socket.on("disconnect", onDisconnect)

        socket.on("loaded", onLoadedEvent);

        socket.on("terminal-error", onTerminalError);
        socket.on("terminal-response", onTerminalResponse);
        socket.on("disableAccess", onDisableAccess);

        return () => {
            socket.off("loaded", onLoadedEvent)
            socket.off("connect", onConnect)
            socket.off("disconnect", onDisconnect)
            socket.off("terminal-error", onTerminalError);
            socket.off("terminal-response", onTerminalResponse);
            socket.off("disableAccess", onDisableAccess);
        }
    }, [terminal])


    const handleEditorMount: OnMount = (editor, monaco) => {
        setEditorRef(editor);
        monacoRef.current = monaco;

        editor.onDidChangeCursorPosition((e) => {
            const { lineNumber } = e.position
            if (lineNumber === cursorLine) return
            setCursorLine(lineNumber)
        })

    }

    const handleEditorWillMount: BeforeMount = (monaco) => {
        const myCommandId = 'myCustomCommand';

        monaco.editor.registerCommand(myCommandId, () => {
            setGenerate((prev) => {
                return {
                    ...prev,
                    show: !prev.show,
                };
            });
            console.log(generate)

        });
        monaco.editor.addKeybindingRules([{
            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM,
            command: myCommandId,
            when: null
        }])
    }

    useEffect(() => {
        if (!room || !editorRef) return;

        const yDoc = new Y.Doc();
        const yText: Y.Text = yDoc.getText("monaco");
        const yProvider = new LiveblocksYjsProvider(room, yDoc);

        // Set provider globally if needed
        setProvider(yProvider);

        yProvider.on("sync", (isSynced: boolean) => {
            if (isSynced && yText.toString() === "") {
                yText.insert(0, editorRef.getValue() ?? activeFile ?? "");
            }
        });

        // Monaco Binding
        const binding = new MonacoBinding(
            yText,
            editorRef.getModel()!,
            new Set([editorRef]),
            yProvider.awareness as any
        );

        return () => {
            binding.destroy();
            yProvider.destroy();
        };
    }, [room, editorRef]);

    useEffect(() => {
        // if (!ai) {
        //     setGenerate((prev) => {
        //         return {
        //             ...prev,
        //             show: false,
        //         };
        //     });
        //     return;
        // }
        if (generate.show) {
            editorRef?.changeViewZones((changeAccessor: monaco.editor.IViewZoneChangeAccessor) => {
                if (!generateRef.current) return;
                console.log(cursorLine);
                const id = changeAccessor.addZone({
                    afterLineNumber: cursorLine,
                    heightInLines: 3,
                    domNode: generateRef.current
                })

                setGenerate((prev) => {
                    return { ...prev, id, line: cursorLine }
                })
            })

            if (!generateWidgetRef.current) return;

            const widgetElement = generateWidgetRef.current;

            const contentWidget = {
                getDomNode: () => {
                    return widgetElement
                },
                getId: () => {
                    return "generate.widget"
                },
                getPosition: () => {
                    return {
                        position: {
                            lineNumber: cursorLine,
                            column: 1
                        },
                        preference: generate.pref.length ? generate.pref : [monacoRef.current!.editor.ContentWidgetPositionPreference.BELOW]
                    }
                }
            }

            setGenerate((prev) => {
                return { ...prev, widget: contentWidget }
            })

            editorRef?.addContentWidget(contentWidget)


        } else {
            editorRef?.changeViewZones((changeAccessor: monaco.editor.IViewZoneChangeAccessor) => {
                changeAccessor.removeZone(generate.id)
                setGenerate((prev) => {
                    return { ...prev, id: "" }
                })
            })

            if (!generate.widget) return

            editorRef?.removeContentWidget(generate.widget)
            setGenerate((prev) => {
                return { ...prev, widget: undefined }
            })


        }
    }, [generate.show, activeId, tabs, editorRef])

    const selectFile = (tab: TTab) => {
        if (tab.id === activeId) return;
        const includes = tabs.find((t) => t.id === tab.id);
        setTabs((prev) => {
            if (includes) {
                setActiveId(includes.id);
                return prev;
            }
            return [...prev, tab]
        })

        socket.emit("getFile", tab.fullPath, (response: string) => {
            setActiveFile(response);
        })

        setEditorLanguage(processFileType(tab.name))
        setActiveId(tab.id)
    }

    const closeTab = (tab: TFile) => {
        const tabCount = tabs.length;
        const index = tabs.findIndex((t) => t.id == tab.id)

        if (index === -1) return

        const nextId = activeId === tab.id ?
            tabCount === 1 ? null :
                index < tabCount - 1 ? tabs[index + 1].id :
                    tabs[index - 1].id : activeId;


        const nextTab = tabs.find((t) => t.id === nextId)
        if (nextTab) { }  //for build
        if (!nextId) {
            setActiveId("");
        } else {
            const nextTab = tabs.find((t) => t.id === nextId);

            if (nextTab) selectFile(nextTab);
        }
    }

    const saveFile = (e: KeyboardEvent) => {
        if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();

            const activeTab = tabs.find((t) => t.id === activeId);
            if (!activeTab?.saved) {
                socket.emit("save-file", activeTab?.fullPath, editorRef?.getValue(), (success: boolean) => {
                    if (success) {
                        toast.success("file saved");
                        setTabs((prev) =>
                            prev.map((tab) =>
                                tab.id === activeId ? { ...tab, saved: true } : tab
                            )
                        );
                    } else {
                        toast.error("some error occured")
                    }
                })
            }
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", saveFile);
        return () => {
            document.removeEventListener("keydown", saveFile);
        };
    }, [tabs, activeId, editorRef, socket]);



    const createTerminal = () => {

        setCreatingTerminal(true);
        const id = createId();
        setTerminal({ id, terminal: null })
        setPreviewLoading(true)

        setTimeout(() => {
            socket.emit("create-terminal", id, userData.id, virtualBox.id, () => {
                setCreatingTerminal(false);
            });
        }, 1000);
    };

    const closeTerminal = (term: { id: string; terminal: Terminal | null }) => {
        socket.emit("close-terminal", term.id, virtualBox.id, () => {
            setTerminal({ id: "", terminal: null });
            setPreviewUrl("");
        });
    };


    if (disableAccess.isDisabled) {
        return (
            <>
                <DisableAccessModal message={disableAccess.message} open={disableAccess.isDisabled} setOpen={() => { }} />
            </>
        )
    }


    return (
        <>
            <div ref={generateRef} className={`w-[${generate.width - 90}px]`}>
                <div ref={generateWidgetRef} className="z-50">
                    {
                        generate.show && (
                            <GenerateInput
                                user={userData}
                                socket={socket}

                                data={{
                                    filePath: tabs.find((t) => t.id === activeId)?.fullPath ?? "",
                                    code: editorRef?.getValue() ?? "",
                                    line: generate.line
                                }}
                                editor={{
                                    language: editorLanguage!
                                }}


                                width={generate.width - 90}

                                onAccept={(code: string) => {
                                    const line = generate.line;

                                    setGenerate((prev) => ({ ...prev, show: false }));

                                    const currCode = editorRef?.getValue();
                                    const lines = currCode?.split("\n") || [];
                                    lines.splice(line - 1, 0, code);
                                    const updatedCode = lines.join("\n");
                                    editorRef?.setValue(updatedCode);
                                }}




                                onExpand={() => {
                                    editorRef?.changeViewZones((changeAccessor) => {
                                        changeAccessor.removeZone(generate.id)

                                        if (!generateRef.current) return;

                                        const id = changeAccessor.addZone({
                                            afterLineNumber: cursorLine,
                                            heightInLines: 6,
                                            domNode: generateRef.current
                                        })

                                        setGenerate((prev) => {
                                            return { ...prev, id }
                                        })
                                    })
                                }}
                            />
                        )
                    }
                </div>
            </div>
            <Sidebar
                folderTree={tree}
                selectFile={selectFile}
                socket={socket}
                virtualBoxId={virtualBox.id}
                userId={virtualBox.userId}
                tree={tree}
                setTree={setTree}
            />
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={80} maxSize={80} minSize={30} className="flex flex-col p-1">
                    <div className="h-10 w-full flex gap-2 pt-1 px-2 custom-scroll">
                        {
                            tabs.map((tab) => (
                                <CustomTab
                                    saved={tab.saved}
                                    key={tab.id}
                                    selected={activeId === tab.id}
                                    onClick={() => selectFile(tab)}
                                    onClose={() => closeTab(tab)}
                                >
                                    <span className="text-xs font-semibold">{tab.name}</span>
                                </CustomTab>
                            ))
                        }
                    </div>
                    <div ref={editorContainerRef} className="grow w-full overflow-hidden rounded-lg">
                        {
                            !activeId ? (
                                <>
                                    <div className="flex items-center w-full h-full justify-center text-xl font-medium text-secondary select-none">
                                        <FileJson className="w-6 h-6 mr-3" />
                                        No File selected
                                    </div>
                                </>
                            ) : (
                                clerk.loaded && (
                                    <>
                                        {
                                            provider ? <Cursors yProvider={provider} /> : null
                                        }
                                        <Editor
                                            height={"100%"}
                                            theme="vs-dark"
                                            onMount={handleEditorMount}
                                            beforeMount={handleEditorWillMount}
                                            language={editorLanguage}
                                            onChange={(value) => {
                                                if (value === activeFile) {
                                                    setTabs((prev) =>
                                                        prev.map((tab) =>
                                                            tab.id === activeId ? { ...tab, saved: true } : tab
                                                        )
                                                    );
                                                } else {
                                                    setTabs((prev) =>
                                                        prev.map((tab) =>
                                                            tab.id === activeId ? { ...tab, saved: false } : tab
                                                        )
                                                    );
                                                }
                                            }}
                                            options={{
                                                minimap: {
                                                    enabled: false
                                                },
                                                padding: {
                                                    bottom: 4,
                                                    top: 4
                                                },
                                                scrollBeyondLastLine: false,
                                                fixedOverflowWidgets: true,
                                                fontFamily: "var(--font-geist-mono)",
                                                fontSize: 12
                                            }}
                                            value={activeFile ?? ""}
                                        />
                                    </>
                                )
                            )
                        }
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={20}>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel
                            ref={previewPanelRef}
                            collapsedSize={4}
                            collapsible
                            onCollapse={() => setIsPreviewCollapsed(true)}
                            onExpand={() => setIsPreviewCollapsed(false)}
                            className="p-2 flex flex-col"
                            defaultSize={40} minSize={20} maxSize={70}
                        >
                            <PreviewWindow
                                collapsed={isPreviewCollapsed}
                                open={() => {
                                    previewPanelRef.current?.expand();
                                    setIsPreviewCollapsed(false);
                                }}
                                socket={socket}
                                loading={previewLoading}
                                setLoading={setPreviewLoading}
                                iframeKey={iframeKey}
                                setIframeKey={setIframeKey}
                                previewUrl={previewUrl}
                                setPreviewUrl={setPreviewUrl}

                            />
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={50} minSize={20} className="p-1 flex flex-col" >
                            <div className="h-10 w-full flex gap-2 shrink-0">
                                {
                                    terminal.id && (
                                        <CustomTab
                                            key={terminal.id}
                                            onClick={() => { }}
                                            onClose={() => closeTerminal(terminal)}
                                            selected={true}
                                        >
                                            <SquareTerminal className="w-4 h-4" />
                                            <span className="text-xs font-semibold">Shell</span>
                                        </CustomTab>
                                    )
                                }
                                <Button
                                    disabled={creatingTerminal}
                                    onClick={() => {
                                        if (terminal.id) {
                                            toast.error("You can only have 1 terminal open at a time.");
                                            return;
                                        }
                                        createTerminal();
                                    }}
                                    size={"smIcon"}
                                    variant={"secondary"}
                                    className={`${terminal.id ? "opacity-0" : ""} font-normal shrink-0 select-none text-muted-foreground `}
                                >
                                    {creatingTerminal ? (
                                        <Loader2 className="animate-spin w-4 h-4" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                </Button>

                            </div>
                            {socket && terminal.id ? (
                                <div className="w-full relative grow h-full overflow-auto tab-scroll rounded-lg bg-secondary">
                                    <EditorTerminal
                                        socket={socket}
                                        terminal={terminal}
                                        setTerminal={setTerminal}
                                    />

                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg font-medium text-muted-foreground/50 select-none">
                                    <TerminalSquare className="w-4 h-4 mr-2" />
                                    No Terminals Open
                                </div>
                            )}
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    )
}
export default CodeEditor;

