"use client"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "../ui/resizable"
import { Button } from "../ui/button";
import { ConstructionIcon, FileJson, Plus, SquareTerminal, X } from "lucide-react";
import { BeforeMount, OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import monaco from "monaco-editor";

import Sidebar from "./sidebar";
import CustomTab from "../custom/customTab";
import { TTab, UserType } from "../../lib/types";
import { TFile, TFolder } from "../../lib/types";
import { io } from "socket.io-client"
import { processFileType } from "../../lib/utils";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import EditorTerminal from "./terminal";
import GenerateInput from "./generate";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { Awareness } from "y-protocols/awareness.js";
import { TypedLiveblocksProvider, useRoom } from "@/frontend/liveblocks.config";
import { Cursors } from "./live/cursor";


const Editor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false
})

const CodeEditor = ({ userData, virtualBoxId }: {
    userData: UserType
    virtualBoxId: string
}) => {


    const clerk = useClerk()
    const router = useRouter()
    const monacoRef = useRef<typeof monaco | null>(null)
    const [editorRef, setEditorRef] = useState<monaco.editor.IStandaloneCodeEditor>();
    const generateRef = useRef<HTMLDivElement>(null)
    const editorContainerRef = useRef<HTMLDivElement>(null)
    const generateWidgetRef = useRef<HTMLDivElement>(null)


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
    const [terminals, setTerminals] = useState<string[]>([]);

    const type = userData?.virtualBox?.find(vb => vb.id === virtualBoxId)?.type ?? null;

    const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}?userId=${userData.id}&virtualBoxId=${virtualBoxId}&type=${type}`);



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
    }, [])


    const handleEditorMount: OnMount = (editor, monaco) => {
        setEditorRef(editor);
        monacoRef.current = monaco;

        editor.onDidChangeCursorPosition((e) => {
            const { column, lineNumber } = e.position
            if (lineNumber === cursorLine) return
            setCursorLine(lineNumber)

            const model = editor.getModel();
            const endColumn = model?.getLineContent(lineNumber).length || 0

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

    const room = useRoom()

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
        const yText = yDoc.getText("monaco");
        const yProvider: any = new LiveblocksYjsProvider(room, yDoc);

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
            yProvider.awareness as Awareness
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
    }, [generate.show])

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
    }, [decorations.options])

    useEffect(() => {
        const onLoadedEvent = (tree: (TFolder | TFile)[]) => {
            setTree(tree);
        }

        const onConnect = () => { }

        const onDisconnect = () => { }

        const onRateLimit = (message: string) => {
            toast.error(message);


        };

        //  const onTerminalResponse = (response: { id: string; data: string }) => {
        //         // const res = response.data;
        //         // console.log("terminal response", res);
        //         const term = terminals.find((t) => t.id === response.id);
        //         if (term && term.terminal) term.terminal.write(response.data);
        //     };

        // const onDisableAccess = (message: string) => {
        //     setDisableAccess({
        //         isDisabled: true,
        //         message: message,
        //     });
        // };

        socket.on("connect", onConnect)
        socket.on("disconnect", onDisconnect)

        socket.on("loaded", onLoadedEvent);
        socket.on("rateLimit", onRateLimit);

        // socket.on("terminalResponse", onTerminalResponse);
        // socket.on("disableAccess", onDisableAccess);

        return () => {
            socket.off("loaded", onLoadedEvent)
            socket.off("connect", onConnect)
            socket.off("disconnect", onDisconnect)
            socket.off("rateLimit", onRateLimit);
            // socket.off("terminalResponse", onTerminalResponse);
            // socket.off("disableAccess", onDisableAccess);
        }
    }, [])

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
    }, [tabs, activeId]);



    const removeZone = () => {
        editorRef?.changeViewZones((changeAccessor) => {
            changeAccessor.removeZone(generate.id);
        });
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
                                filePath: tabs.find((t) => t.id === activeId)?.fullPath!,
                                code: editorRef?.getValue() ?? "",
                                line: generate.line
                            }}
                            editor={{
                                language: editorLanguage!
                            }}

                            cancel={() => { }}
                            submit={(str: string) => { }}

                            width={generate.width}

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
                virtualBoxId={virtualBoxId}
                userId={userData.id}
                tree={tree}
                setTree={setTree}
                ai={ai}
                setAi={setAi}
            />
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={60} maxSize={75} minSize={30} className="flex flex-col p-1">
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
                        <ResizablePanel defaultSize={50} minSize={20} className="p-1 flex flex-col" >
                            <div className="h-10 w-full flex gap-2">
                                <Button variant={"secondary"} size={"sm"} className="min-w-20 justify-between" >
                                    index.html <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={50} minSize={20} className="p-1 flex flex-col" >
                            <div className="h-10 w-full flex gap-2 shrink-0">
                                <CustomTab selected>
                                    <SquareTerminal className="w-4 h-4" />
                                    <span className="text-xs font-semibold">Shell</span>
                                </CustomTab>
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                {/*  */}
                                <Button onClick={() => {
                                    if (terminals.length >= 4) {
                                        toast.error("You reached the maximum # of terminals");
                                        return;
                                    }
                                    // const id = crypto.randomUUID();
                                    // setTerminals((prev) => [...prev, id]);
                                    // socket.emit("create-terminal", id);
                                }} size={"smIcon"} variant={"secondary"} className="font-normal select-none text-muted-foreground" >
                                    <Plus className="h-4 w-4" />
                                </Button>

                            </div>
                            <div className="w-full relative grow rounded-lg bg-secondary">
                                {
                                    socket && <EditorTerminal socket={socket} />
                                }
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    )
}
export default CodeEditor;

