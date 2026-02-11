"use client"
import React, { useState } from 'react'
import { FilePlus, FolderPlus, Loader2, Sparkles } from 'lucide-react'
import SideBarFile from './file'
import SidebarFolder from './folder'
import { TFile, TFolder, TTab } from '@/frontend/src/lib/types'
import New from './new'
import { Socket } from 'socket.io-client'
import { getFilesInFolder, validateName } from '@/frontend/src/lib/utils'
import { toast } from 'sonner'

const Sidebar = ({ folderTree, selectFile, socket, virtualBoxId, userId, setTree, tree, tabs, setTabs, closeTab }: {
    folderTree: (TFile | TFolder)[]
    selectFile: (tab: TTab) => void
    socket: Socket
    virtualBoxId: string
    userId: string
    tree: (TFile | TFolder)[]
    setTree: (folderTree: (TFile | TFolder)[]) => void
    tabs: TTab[]
    setTabs: React.Dispatch<React.SetStateAction<TTab[]>>
    // setActiveFileId: React.Dispatch<React.SetStateAction<string>>
    closeTab: (tab: TFile) => void

}) => {

    const [creatingNew, setCreatingNew] = useState<"file" | "folder" | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<string>("");
    const [pendingCreate, setPendingCreate] = useState<boolean>(false);


    const createNew = (name: string, type: "file" | "folder"): boolean => {

        if (!name) {
            toast.error("Name cannot be empty");
            return false;
        }

        const path = selectedFolder ? selectedFolder : `${userId}/${virtualBoxId}`;

        const files: { file: string[]; folder: string[] } = getFilesInFolder(tree, path);

        const isDuplicate = type === "file"
            ? files.file.includes(name)
            : files.folder.includes(name);

        if (isDuplicate) {
            toast.error(`A ${type} named "${name}" already exists in this folder.`);
            return false;
        }

        if (validateName(name, "", type)) {
            setPendingCreate(true)
            socket.emit("create-new-request", name, type, path, (success: boolean, error: string | null, resTree: (TFile | TFolder)[]) => {
                if (success) {
                    setPendingCreate(false)
                    setTree(resTree);
                    toast.success(`Successfully created new ${type}`);
                } else {
                    toast.error(`${error}`);
                }
            });
            if (pendingCreate) setPendingCreate(false)
            return true
        }
        return false;
    };

    const deleteFileOrFolder = async (data: TFile | TFolder) => {
        const type = data.fullPath.split("/").pop()?.includes(".") ? "file" : "folder";

        socket.emit("delete-request", data.fullPath, (success: boolean, error: string | null, resTree: (TFile | TFolder)[]) => {

            if (success) {
                setTree(resTree)

                if (data.type === "file") {
                    closeTab(data);
                } else if (data.type === "folder") {
                    // If folder, close all tabs inside this folder
                    const folderFullPath = data.fullPath;
                    tabs.filter((tab) => tab.fullPath.startsWith(folderFullPath)).forEach((tab) => closeTab(tab));
                }

                toast.success(`Successfully deleted ${type}`)
            } else {
                toast.error(`${error}`)

            }
        })
    }

    const handleRename = (id: string, fullPath: string, newName: string, type: "file" | "folder") => {

        //name validation handled in SidebarFolder and SidebarFile
        socket.emit("rename", fullPath, newName, (success: boolean, error: string | null, resTree: (TFile | TFolder)[]) => {
            if (success) {
                setTree(resTree);
                setTabs(prevTabs =>
                    prevTabs.map(tab => {
                        // const newPath = pathMap[tab.fullPath];
                        // if (newPath) {
                        //     return {
                        //         ...tab,
                        //         fullPath: newPath,
                        //         name: newPath.split("/").pop() ?? tab.name,
                        //     };
                        // }
                        return {...tab, name: newName};
                    })
                );
                toast.success(`Successfully renamed ${type}`)
            } else {
                toast.error(`${error}`)
            }
        });

    };

    return (

        <div className='h-full w-fit min-w-48 flex flex-col items-start p-2 border-1 border-r-muted-foreground/25'>
            <div className='flex w-full items-center justify-between h-8 mb-1'>
                <div onClick={() => setSelectedFolder("")} className='text-white cursor-pointer'>Files</div>
                <div className='flex space-x-1'>
                    <button
                        disabled={!!creatingNew}
                        onClick={() => setCreatingNew("file")}
                        className="disabled:opacity-50 p-0.8 disabled:hover:bg-background h-6 w-6 text-muted-foreground ml-0.5 flex items-center justify-center translate-x-1 bg-transparent hover:bg-muted-foreground/25 cursor-pointer rounded-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <FilePlus className="h-5 w-5" />
                    </button>
                    <button
                        disabled={!!creatingNew}
                        onClick={() => setCreatingNew("folder")}
                        className="disabled:opacity-50  p-0.8 disabled:hover:bg-background h-6 w-6 text-muted-foreground ml-0.5 flex items-center justify-center translate-x-1 bg-transparent hover:bg-muted-foreground/25 cursor-pointer rounded-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <FolderPlus className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className='w-full mt-1 flex flex-col '>
                {
                    folderTree?.length === 0 ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                        <>
                            {
                                selectedFolder === "" && creatingNew !== null && (
                                    <New
                                        type={creatingNew}
                                        stopEditing={() => setCreatingNew(null)}
                                        createNew={createNew}
                                    />
                                )
                            }
                            {
                                pendingCreate &&
                                <div className="flex items-center">
                                    <Loader2 className='text-muted-foreground w-4 h-4 mr-2 animate-spin' />
                                    <div className='text-muted-foreground'>
                                        Creating...
                                    </div>
                                </div>
                            }
                            {folderTree && folderTree.map((child) => {

                                return child.type === "file"
                                    ? child.name !== ".placeholder" && (
                                        <SideBarFile
                                            key={child.id}
                                            data={child}
                                            selectFile={selectFile}
                                            handleRename={handleRename}
                                            deleteFileOrFolder={deleteFileOrFolder}
                                        />
                                    )
                                    : (
                                        <SidebarFolder
                                            key={child.id}

                                            data={child}
                                            socket={socket}

                                            selectFile={selectFile}

                                            selectedFolder={selectedFolder}
                                            setSelectedFolder={setSelectedFolder}

                                            creatingNew={creatingNew}
                                            setCreatingNew={setCreatingNew}

                                            pendingCreate={pendingCreate}
                                            setPendingCreate={setPendingCreate}

                                            handleRename={handleRename}
                                            createNew={createNew}
                                            deleteFileOrFolder={deleteFileOrFolder}
                                        />
                                    );
                            })}
                        </>
                    )
                }

            </div>
            <div className="w-full space-y-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center mt-4">
                        <Sparkles
                            className={`h-4 w-4 mr-2 text-indigo-500}`}
                        />
                        Copilot
                        <span className="font-mono text-muted-foreground inline-block ml-1.5 text-xs leading-none border border-b-2 border-muted-foreground py-1 px-1.5 rounded-md">
                            ctrl+M
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
