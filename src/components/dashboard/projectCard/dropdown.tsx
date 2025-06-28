"use client"
import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,

} from '../../ui/dropdown-menu'
import { Ellipsis, Globe, Lock, Trash2 } from 'lucide-react'
import { VirtualBoxType } from '@/frontend/src/lib/types'
import DeleteConfirmDialog from '../deleteDialog'

const ProjectCardDropdown = ({openDelete, setOpenDelete, virtualBox, onDelete, onVisibilityChange, isDeleting, setIsDeleting }: {
    openDelete: boolean
    setOpenDelete: (open: boolean) => void
    virtualBox: VirtualBoxType
    onDelete: (virtualboxId: string) => void
    onVisibilityChange: (virtualBox: VirtualBoxType) => void
    isDeleting: boolean
    setIsDeleting: (isDeleting: boolean) => void
}) => {

    
    return (
        <>
            <DeleteConfirmDialog 
            open={openDelete} 
            setOpen={setOpenDelete} 
            onDelete={onDelete} 
            isDeleting={isDeleting}
            setIsDeleting={setIsDeleting}
            virtualBoxId={virtualBox.id}
            />
        
        <DropdownMenu>
            <DropdownMenuTrigger onClick={(e) => {
                e.preventDefault();
                e.stopPropagation()
            }} className='h-6 w-6 items-center justify-center transition-colors bg-transparent hover:bg-muted-foreground/25 rounded-sm' asChild>
                <Ellipsis className='w-4 h-4' />
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-40' align='end'>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation()
                        onVisibilityChange(virtualBox)
                    }}
                >
                    {virtualBox.visibility === "public" ? (
                        <>
                            <Lock className="mr-2 h-4 w-4" />
                            <span>Make Private</span>
                        </>
                    ) : (
                        <>
                            <Globe className="mr-2 h-4 w-4" />
                            <span>Make Public</span>
                        </>
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation()
                        setOpenDelete(true)
                        // onDelete(virtualBox.id)
                    }}
                    className='!text-destructive cursor-pointer'
                >
                    <Trash2 className='mr-2 w-4 h-4 !text-destructive' />
                    <span>Delete Project</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </>
    )
}

export default ProjectCardDropdown