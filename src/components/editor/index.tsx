"use client"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "../ui/resizable"
import { Button } from "../ui/button";
import {FileJson, Loader2, Plus, SquareTerminal, TerminalSquare} from "lucide-react";
import { BeforeMount, OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import monaco from "monaco-editor";

import Sidebar from "./sidebar";
import CustomTab from "../custom/customTab";
import { TTab, UserType, VirtualBoxType } from "../../lib/types";
import { TFile, TFolder } from "../../lib/types";
import { io } from "socket.io-client"
import { processFileType } from "../../lib/utils";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import GenerateInput from "./generate";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { Awareness } from "y-protocols/awareness.js";
import { TypedLiveblocksProvider, useRoom } from "@/frontend/liveblocks.config";
import { Cursors } from "./live/cursor";
import { Terminal } from "@xterm/xterm";
import { createId } from "@paralleldrive/cuid2";
import DisableAccessModal from "./live/disableModel";
import PreviewWindow from "./preview";
import { ImperativePanelHandle } from "react-resizable-panels";

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
    const room = useRoom()

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
    const [decorations, setDecorations] = useState<{
        options: monaco.editor.IModelDeltaDecoration[],
        instance: monaco.editor.IEditorDecorationsCollection | undefined
    }>({ options: [], instance: undefined })


    const [provider, setProvider] = useState<TypedLiveblocksProvider>();
    const [ai, setAi] = useState<boolean>(false);

    const [tree, setTree] = useState<(TFolder | TFile)[]>([]);
    const [tabs, setTabs] = useState<TTab[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const [activeFile, setActiveFile] = useState<string | null>(null)

    const [terminals, setTerminals] = useState<
        {
            id: string;
            terminal: Terminal | null;
        }[]
    >([]);
    const [closingTerminal, setClosingTerminal] = useState("");
    const [activeTerminalId, setActiveTerminalId] = useState("");
    const [creatingTerminal, setCreatingTerminal] = useState(false);
    const [disableAccess, setDisableAccess] = useState({ isDisabled: false, message: "" });

    const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(
        virtualBox.type !== "react"
    );

    const type = userData?.virtualBox?.find(vb => vb.id === virtualBox.id)?.type ?? null;

    const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}?userId=${userData.id}&virtualBoxId=${virtualBox.id}&type=${type}`);

    const activeTerminal = terminals.find((t) => t.id === activeTerminalId);


    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const { width } = entry.contentRect;
            setGenerate((prev) => {
                return { ...prev, width };
            });
        }
    });


    useEffect(() => {
        if (typeof window === 'undefined') return;
        socket.connect()

        socket.on('connect_error', (err) => {
            toast.error(`Connection failed: ${err.message}`)
        })

        if (editorContainerRef.current) {
            resizeObserver.observe(editorContainerRef.current)
        }

        return () => {
            socket.disconnect()
            resizeObserver.disconnect()
        }
    }, [resizeObserver, socket])

    useEffect(() => {
        const onLoadedEvent = (tree: (TFolder | TFile)[]) => {
            setTree(tree);
        }

        const onConnect = () => {
        }

        const onDisconnect = () => {
            setTerminals([])
            if(closingTerminal){}  //for build
        }

        const onRateLimit = (message: string) => {
            toast.error(message);
        };

        const onTerminalResponse = (response: { id: string; data: string }) => {
            const term = terminals.find((t) => t.id === response.id);
            if (term && term.terminal) term.terminal.write(response.data);
        };

        const onDisableAccess = (message: string) => {
            setDisableAccess({
                isDisabled: true,
                message: message,
            });
        };

        socket.on("connect", onConnect)
        socket.on("disconnect", onDisconnect)

        socket.on("loaded", onLoadedEvent);
        socket.on("rateLimit", onRateLimit);

        socket.on("terminalResponse", onTerminalResponse);
        socket.on("disableAccess", onDisableAccess);

        return () => {
            socket.off("loaded", onLoadedEvent)
            socket.off("connect", onConnect)
            socket.off("disconnect", onDisconnect)
            socket.off("rateLimit", onRateLimit);
            socket.off("terminalResponse", onTerminalResponse);
            socket.off("disableAccess", onDisableAccess);
        }
    }, [terminals, socket, closingTerminal])


    const handleEditorMount: OnMount = (editor, monaco) => {
        setEditorRef(editor);
        monacoRef.current = monaco;

        editor.onDidChangeCursorPosition((e) => {
            const { column, lineNumber } = e.position
            if (lineNumber === cursorLine) return
            setCursorLine(lineNumber)

            const model = editor.getModel();
            const endColumn = model?.getLineContent(lineNumber).length || 0

            if(column && endColumn){} //for build

            // setDecorations((prev) => {
            //     return {
            //         ...prev,
            //         options: [
            //             {
            //                 range: new monaco.Range(
            //                     lineNumber,
            //                     column,
            //                     lineNumber,
            //                     endColumn
            //                 ),
            //                 options: {
            //                     afterContentClassName: "inline-decoration",
            //                 }
            //             } as monaco.editor.IModelDeltaDecoration
            //         ]
            //     }
            // })
        })

        // editor.onDidBlurEditorText(() => {
        //     setDecorations((prev) => {
        //         return {
        //             ...prev,
        //             options: [],
        //         };
        //     });
        // });

        // editor.addAction({
        //     id: "generate",
        //     label: "Generate",
        //     keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG],
        //     precondition: "editorTextFocus && !suggestWidgetVisible && !renameInputVisible && !inSnippetMode && !quickFixWidgetVisible",
        //     run: () => {
        //         setGenerate((prev) => {
        //             return { ...prev, show: !prev.show }
        //         })
        //     }
        // })
    }

    const handleEditorWillMount: BeforeMount = (monaco) => {
        monaco.editor.addKeybindingRules([{
            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG,
            command: null
        }])
    }


    useEffect(() => {
        const tab = tabs.find((t) => t.id === activeId);
        if (!editorRef) return;

        if (!room) {
            toast.error("Liveblocks room not found");
            router.push("/dashboard");
            return;
        }
        const model = editorRef?.getModel() as monaco.editor.ITextModel;

        if (!tab || !model) return;

        const yDoc = new Y.Doc();
        const yText: Y.Text = yDoc.getText("monaco");
        const yProvider: LiveblocksYjsProvider = new LiveblocksYjsProvider(room, yDoc);

        const onSync = (isSynced: boolean) => {
            if (isSynced) {
                const text = yText.toString();
                if (text === "") {
                    if (activeFile) {
                        yText.insert(0, activeFile);
                    } else {
                        setTimeout(() => {
                            if (editorRef) {
                                yText.insert(0, editorRef.getValue());
                            }
                        }, 0);
                    }
                }
            }
        };

        yProvider.on("sync", onSync);

        setProvider(yProvider);

        const binding = new MonacoBinding(
            yText,
            model,
            new Set([editorRef]),
            yProvider.awareness as unknown as Awareness
        );

        return () => {
            yDoc?.destroy();
            yProvider?.destroy();
            binding?.destroy();
            yProvider.off("sync", onSync);
        };
    }, [editorRef, room, activeFile]);

    useEffect(() => {
        if (!ai) {
            setGenerate((prev) => {
                return {
                    ...prev,
                    show: false,
                };
            });
            return;
        }
        if (generate.show) {
            editorRef?.changeViewZones((changeAccessor: monaco.editor.IViewZoneChangeAccessor) => {
                if (!generateRef.current) return;
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

            if (generateRef.current && generateWidgetRef.current) {
                editorRef?.applyFontInfo(generateRef.current)
                editorRef?.applyFontInfo(generateWidgetRef.current)

            }


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
    }, [generate.show, activeId, router, tabs, ai, cursorLine, editorRef, generate.id, generate.pref, generate.widget])

    useEffect(() => {
        if (decorations.options.length === 0) {
            decorations.instance?.clear();
        }

        if (!ai) return;

        if (decorations.instance) {
            decorations.instance.set(decorations.options)
        } else {
            const instance = editorRef?.createDecorationsCollection()
            instance?.set(decorations.options);

            setDecorations((prev) => {
                return {
                    ...prev,
                    instance
                }
            })
        }
    }, [decorations.options, ai, cursorLine, editorRef, generate.id, generate.pref, generate.widget, decorations.instance])



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
        if(nextTab){}  //for build
        if (!nextId) {
            setActiveId("");
        } else {
            const nextTab = tabs.find((t) => t.id === nextId);

            if (nextTab) selectFile(nextTab);
        }
    }

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
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

        document.addEventListener("keydown", down);

        return () => {
            document.removeEventListener("keydown", down);
        };
    }, [tabs, activeId, editorRef, socket]);



    const removeZone = () => {
        editorRef?.changeViewZones((changeAccessor) => {
            changeAccessor.removeZone(generate.id);
        });
    }

    const createTerminal = () => {
        setCreatingTerminal(true);
        const id = createId();

        setTerminals((prev) => [...prev, { id, terminal: null }]);
        setActiveTerminalId(id);

        setTimeout(() => {
            socket.emit("createTerminal", id, () => {
                setCreatingTerminal(false);
            });
        }, 1000);
    };

    const closeTerminal = (term: { id: string; terminal: Terminal | null }) => {
        const numTerminals = terminals.length;
        const index = terminals.findIndex((t) => t.id === term.id);

        if (index === -1) return;

        setClosingTerminal(term.id);

        socket.emit("closeTerminal", term.id, () => {
            setClosingTerminal("");
            const nextId =
                activeTerminalId === term.id
                    ? numTerminals === 1
                        ? null
                        : index < numTerminals - 1
                            ? terminals[index + 1].id
                            : terminals[index - 1].id
                    : activeTerminalId;

            // if (activeTerminal && activeTerminal.terminal) {
            //   activeTerminal.terminal.dispose();
            // }

            setTerminals((prev) => prev.filter((t) => t.id !== term.id));

            if (!nextId) {
                setActiveTerminalId("");
            } else {
                const nextTerminal = terminals.find((t) => t.id === nextId);
                if (nextTerminal) {
                    setActiveTerminalId(nextTerminal.id);
                }
            }
        });
    };

    // const closeAllTerminals = () => {
    //     terminals.forEach((term) => {
    //         socket.emit("closeTerminal", term.id, () => { });
    //         setTerminals((prev) => prev.filter((t) => t.id === term.id));
    //     });
    // };




    if (disableAccess.isDisabled) {
        return (
            <>
                <DisableAccessModal message={disableAccess.message} open={disableAccess.isDisabled} setOpen={() => { }} />

            </>
        )
    }




    return (
        <>
            <div ref={generateRef}></div>
            <div ref={generateWidgetRef} className="z-50">
                {
                    generate.show && ai && (
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

                            cancel={() => { }}
                            submit={(str: string) => {console.log(str)}}

                            width={generate.width - 90}

                            onAccept={(code: string) => {
                                const line = generate.line;

                                setGenerate((prev) => ({ ...prev, show: false }));

                                removeZone()

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
            <Sidebar
                folderTree={tree}
                selectFile={selectFile}
                socket={socket}
                virtualBoxId={virtualBox.id}
                userId={userData.id}
                tree={tree}
                setTree={setTree}
                ai={ai}
                setAi={setAi}
            />
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={60} maxSize={80} minSize={30} className="flex flex-col p-1">
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
                <ResizablePanel defaultSize={40}>
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
                            />
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={50} minSize={20} className="p-1 flex flex-col" >
                            <div className="h-10 w-full flex gap-2 shrink-0">
                                {terminals.map((term) => (
                                    <CustomTab
                                        key={term.id}
                                        onClick={() => setActiveTerminalId(term.id)}
                                        onClose={() => closeTerminal(term)}
                                        selected={activeTerminalId === term.id}
                                    >
                                        <SquareTerminal className="w-4 h-4" />
                                        <span className="text-xs font-semibold">Shell</span>
                                    </CustomTab>

                                ))}

                                <Button
                                    disabled={creatingTerminal}
                                    onClick={() => {
                                        if (terminals.length >= 4) {
                                            toast.error("You reached the maximum # of terminals");
                                            return;
                                        }
                                        createTerminal();
                                    }} size={"smIcon"} variant={"secondary"} className="font-normal shrink-0 select-none text-muted-foreground" >
                                    {creatingTerminal ? (
                                        <Loader2 className="animate-spin w-4 h-4" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                </Button>

                            </div>
                            {socket && activeTerminal ? (
                                <div className="w-full relative grow h-full overflow-auto tab-scroll rounded-lg bg-secondary">
                                    {terminals.map((term) => (
                                        <EditorTerminal
                                            key={term.id}
                                            socket={socket}
                                            id={activeTerminal.id}
                                            term={activeTerminal.terminal}
                                            setTerm={(t: Terminal) => {
                                                setTerminals((prev) =>
                                                    prev.map((term) =>
                                                        term.id === activeTerminalId
                                                            ? { ...term, terminal: t }
                                                            : term
                                                    )
                                                );
                                            }}
                                            visible={activeTerminalId === term.id}
                                        />
                                    ))}
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

