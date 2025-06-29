"use client";
import { useClerk } from "@clerk/nextjs";
import { UserType, VirtualBoxType } from "@/frontend/src/lib/types";
import CodeEditor from "..";
import EditorNavbar from "../navbar";
import { Room } from "../live/room";
import { useState } from "react";
import { fetchAllUsers } from "@/frontend/actions/user-actions";
import { fetchSharedUsers } from "@/frontend/actions/virtualBox-actions";
import { toast } from "sonner";

export default function EditorHomePage({ userData, virtualBoxId }: {
    userData: UserType
    virtualBoxId: string
}) {
    const { loaded } = useClerk();

    const vb = userData.virtualBox.find((box) => box.id === virtualBoxId) as VirtualBoxType;
    const [shared, setShared] = useState<UserType[]>([]);
    const [allUsers, setAllUsers] = useState<UserType[]>([]);


    const fetchData = async () => {
        try {
            const allUsersData = await fetchAllUsers() as UserType[];
            const res = await fetchSharedUsers(userData.id)
            const sharedUsers = res.data as UserType[]

            const sharedEmails = sharedUsers.map(user => user.email);
            let filteredUsers = allUsersData.filter(user => !sharedEmails.includes(user.email));
            filteredUsers = filteredUsers.filter(user => user.id != userData.id)

            setAllUsers(filteredUsers);
            setShared(sharedUsers);

        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred.");
            }
        }
    }

    return (
        <div className="flex w-screen flex-col h-screen bg-background">
            <Room id={virtualBoxId}>
                <div className="h-12 flex">
                    <EditorNavbar userData={userData}
                        virtualBox={vb}
                        fetchData={fetchData}
                        shared={shared}
                        allUsers={allUsers}
                    />
                </div>
                <div className="w-screen flex flex-1 grow">
                    {loaded && <CodeEditor userData={userData} virtualBox={vb} />}
                </div>
            </Room>
        </div>
    );
}
