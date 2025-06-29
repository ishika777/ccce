"use client"
import React, {useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavBarUserButton from '../../navbar/userButton'
import { UserType, VirtualBoxType } from '@/frontend/src/lib/types'
import EditVirtualBoxModal from './edit'
import { Pencil, Users } from 'lucide-react'
import { Button } from '../../ui/button'
import ShareVirtualboxModal from './share'
import { Avatars } from '../live/avatars'
import { notFound } from 'next/navigation'

const EditorNavbar = ({ userData, 
    virtualBox,
     fetchData,
    shared,
    allUsers,
 }: {
    userData: UserType
    virtualBox: VirtualBoxType
     fetchData: () => void
        shared: UserType[]
        allUsers: UserType[]
}) => {

    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
    
    const isOwner = virtualBox.userId === userData.id;
    const isSharedUser = shared?.some((utv) => utv.id === userData.id)

    if(!isOwner && !isSharedUser){
        return notFound();
    }

    return (
        <>
            <EditVirtualBoxModal
                virtualboxId={virtualBox.id}
                userId={userData.id}
                open={isEditOpen}
                setOpen={setIsEditOpen}
                data={virtualBox}
            />
            <ShareVirtualboxModal
                open={isShareOpen}
                setOpen={setIsShareOpen}
                data={virtualBox}
                userId={userData.id}
                fetchData={fetchData}
                shared={shared}
                allUsers={allUsers}
            />
            <div className='h-12 px-2 w-full border-b border-border flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                    <Link href={`/dashboard`} className='p-0 ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none rounded-sm'  >
                        <Image src={"/logo.svg"} alt='logo' width={36} height={36} />
                    </Link>
                    <div className="text-sm font-medium flex items-center">
                        {virtualBox.name}
                        <button
                            onClick={() => setIsEditOpen(true)}
                            className="h-7 w-7 ml-2 flex items-center justify-center transition-colors bg-transparent hover:bg-muted-foreground/25 cursor-pointer rounded-md"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>

                </div>
                <div className='flex items-center space-x-4'>
                    <Avatars />
                    {isOwner && (
                        <Button variant={"outline"} className='cursor-pointer' onClick={() => setIsShareOpen(true)}>
                            <Users className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                    )}

                    <NavBarUserButton userData={userData} />
                </div>
            </div>
        </>
    )
}

export default EditorNavbar