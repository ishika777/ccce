"use clent"
import React, { useEffect, useRef, useState } from 'react'
import { getIconForFile } from 'vscode-icons-js'
import Image from 'next/image'
import { TFile, TTab } from '@/frontend/src/lib/types'
import { toast, Toaster } from 'sonner'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/frontend/src/components/ui/context-menu"
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { validateName } from '@/frontend/src/lib/utils'


const SideBarFile = ({ data, selectFile, handleRename, deleteFileOrFolder }: {
    data: TFile
    selectFile: (tab: TTab) => void
    handleRename: (id: string, fullPath: string, newName: string, type: "file" | "folder") => void
    deleteFileOrFolder: (path: string) => void

}) => {

    const [imgSrc, setImgSrc] = useState(`/icons/${getIconForFile(data.name)}`)
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
        if (validateName(value, data.name, "file")) {
            setPendingEdit(true)
            handleRename(data.id, data.fullPath, value, "file");
            setEditing(false);
        }
    }


    return (
        <ContextMenu>
            <ContextMenuTrigger
                disabled={pendingDelete || pendingEdit}
                onClick={() => {
                    if (!editing && !pendingDelete && !pendingEdit) {
                        selectFile({ ...data, saved: true })
                    }
                }}
                className='w-full flex items-center h-6 px-1 hover:bg-secondary rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer'
            >
                <Image
                    src={imgSrc}
                    alt='file-icon'
                    width={16}
                    height={16}
                    className='mr-2'
                    onError={() => {
                        setImgSrc("/icons/default_file.svg")
                    }}
                />
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
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem disabled={pendingEdit} onClick={() => {
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
    )
}

export default SideBarFile