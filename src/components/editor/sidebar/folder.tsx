"use client"
import React, { useEffect, useRef, useState } from 'react'
import { getIconForFolder, getIconForOpenFolder } from 'vscode-icons-js';
import Image from 'next/image';
import SideBarFile from './file';
import {TFolder, TTab } from '@/frontend/src/lib/types';
import { toast } from 'sonner';
import New from './new';
import { Socket } from 'socket.io-client';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/frontend/src/components/ui/context-menu"
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { validateName } from '@/frontend/src/lib/utils';


const SidebarFolder = ({
    data,
    selectFile,
    handleRename,
    setSelectedFolder,
    selectedFolder,
    creatingNew,
    socket,
    createNew,
    setCreatingNew,
    toggleFolder,
    deleteFileOrFolder,
    pendingCreate,
    setPendingCreate
}: {
    data: TFolder
    selectFile: (tab: TTab) => void
    handleRename: (id: string, fullPath: string, newName: string, type: "file" | "folder") => void
    setSelectedFolder: (path: string) => void
    selectedFolder: string
    creatingNew: "file" | "folder" | null
    socket: Socket
    createNew: (name: string, type: "file" | "folder") => boolean
    setCreatingNew: (data: "file" | "folder" | null) => void
    toggleFolder: (folderId: string) => void
    deleteFileOrFolder: (path: string) => void
    pendingCreate: boolean
    setPendingCreate: (create: boolean) => void
}) => {




    const [open, setOpen] = useState(false);
    const folder = open ? getIconForOpenFolder(data.name) : getIconForFolder(data.name);

    const [editing, setEditing] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null)
    const [pendingDelete, setPendingDelete] = useState<boolean>(false);
    const [pendingEdit, setPendingEdit] = useState<boolean>(false);


    useEffect(() => {
        if (editing) {
            if (inputRef.current) {
                inputRef.current.focus();
            } else {
                toast.error("Input ref is missing after entering edit mode");
            }
        }
    }, [editing]);

    const renameHandler = () => {
        const value = inputRef.current?.value ?? data.name;
        if (validateName(value, data.name, "folder")) {
            setPendingEdit(true)
            handleRename(data.id, data.fullPath, value, "folder");
            setEditing(false);
        }
    }


    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger
                    disabled={pendingDelete || pendingEdit}
                >
                    <div
                        className={` ${data.fullPath === selectedFolder ? "bg-secondary" : ""}   w-full flex items-center h-6 transition-colors hover:text-muted-foreground hover:bg-secondary cursor-pointer rounded-sm`}
                        onClick={() => {
                            if (!editing && !pendingDelete && !pendingEdit) {
                                setOpen((prev) => !prev)
                                toggleFolder(data.fullPath)
                                setSelectedFolder(data.fullPath)
                            }
                        }}
                    >
                        <Image src={`/icons/${folder}`} alt='folder-icon' width={18} height={18} className='mr-2' />
                        {
                            pendingDelete || pendingEdit ? (
                                <>
                                    <Loader2 className='text-muted-foreground w-4 h-4 mr-2 animate-spin' />
                                    <div className='text-muted-foreground'>
                                        {
                                            pendingEdit ? "Editing..." : "Deleting..."
                                        }
                                    </div>
                                </>
                            ) : (
                                editing ? (
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        renameHandler()
                                    }}>
                                        <input
                                            className={`bg-transparent w-full outline-foreground ${editing ? "" : "pointer-events-none"}`}
                                            ref={inputRef}
                                            disabled={!editing}
                                            defaultValue={data.name}
                                            onBlur={() => {
                                                if (inputRef.current) {
                                                    inputRef.current.value = data.name;
                                                }
                                                setEditing(false)
                                            }}
                                        />

                                    </form>
                                ) : (
                                    <>{data.name}</>
                                )
                            )
                        }
                    </div>
                    {
                        open ? (
                            <div className='flex w-full items-stretch'>
                                <div className='w-[1px] bg-border mx-2 h-full'></div>
                                <div className='flex flex-col grow'>
                                    {
                                        data.fullPath === selectedFolder && creatingNew !== null && (
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
                                    {
                                        data.children.map((child) => child.type === "file" ? (
                                            <SideBarFile
                                                key={child.id}
                                                data={child}
                                                selectFile={selectFile}
                                                handleRename={handleRename}
                                                deleteFileOrFolder={deleteFileOrFolder}
                                            />
                                        ) : (
                                            <SidebarFolder
                                                key={child.id}
                                                data={child}
                                                selectFile={selectFile}
                                                toggleFolder={toggleFolder}
                                                handleRename={handleRename}
                                                setSelectedFolder={setSelectedFolder}
                                                selectedFolder={selectedFolder}
                                                creatingNew={creatingNew}
                                                socket={socket}
                                                createNew={createNew}
                                                setCreatingNew={setCreatingNew}
                                                deleteFileOrFolder={deleteFileOrFolder}
                                                pendingCreate={pendingCreate}
                                                setPendingCreate={setPendingCreate}
                                            />
                                        ))
                                    }
                                </div>
                            </div>
                        ) : null
                    }


                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={() => {
                        setEditing(true)
                        setTimeout(() => inputRef.current?.focus(), 0);
                    }}>
                        <Pencil className='w-4 h-4 mr-2' />
                        Rename
                    </ContextMenuItem>
                    <ContextMenuItem disabled={pendingDelete} onClick={() => {
                        setPendingDelete(true)
                        deleteFileOrFolder(data.fullPath)
                    }}>
                        <Trash2 className='text-red-500 w-4 h-4' />
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </>
    )
}

export default SidebarFolder