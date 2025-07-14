"use client";
import { useClerk } from "@clerk/nextjs";
import { UserType, VirtualBoxType } from "@/frontend/src/lib/types";
import EditorNavbar from "../navbar";
import { Room } from "../live/room";
import { useCallback, useState } from "react";
import { fetchAllUsers } from "@/frontend/actions/user-actions";
import { fetchSharedUsers } from "@/frontend/actions/virtualBox-actions";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const CodeEditor = dynamic(() => import(".."), {
  ssr: false,
});

export default function EditorHomePage({ userData, virtualBox }: {
    userData: UserType
    virtualBox: VirtualBoxType
}) {
    const { loaded } = useClerk();  

    const [shared, setShared] = useState<UserType[]>([]);
    const [allUsers, setAllUsers] = useState<UserType[]>([]);


    const fetchData = useCallback(() => {
        (async () => {
            try {
                const allUsersData = await fetchAllUsers() as UserType[];
                const res = await fetchSharedUsers(userData.id);
                const sharedUsers = res.data as UserType[];

                const sharedEmails = sharedUsers.map(user => user.email);
                let filteredUsers = allUsersData.filter(user => !sharedEmails.includes(user.email));
                filteredUsers = filteredUsers.filter(user => user.id !== userData.id);

                setAllUsers(filteredUsers);
                setShared(sharedUsers);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    toast.error(error.message);
                } else {
                    toast.error("An unknown error occurred.");
                }
            }
        })();
    }, [userData.id]);





    return (
        <div className="flex w-screen flex-col h-screen bg-background">
            <Room id={virtualBox.id}>
                <div className="h-12 flex">
                    <EditorNavbar userData={userData}
                        virtualBox={virtualBox}
                        fetchData={fetchData}
                        shared={shared}
                        allUsers={allUsers}
                    />
                </div>
                <div className="w-screen flex flex-1 grow">
                    {loaded && <CodeEditor userData={userData} virtualBox={virtualBox} />}
                </div>
            </Room>
        </div>
    );
}
