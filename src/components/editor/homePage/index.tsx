"use client";
import { useClerk } from "@clerk/nextjs";
import { UserType, VirtualBoxType } from "@/frontend/src/lib/types";
import CodeEditor from "..";
import EditorNavbar from "../navbar";
import { Room } from "../live/room";

export default function EditorHomePage({ userData, virtualBoxId }: { 
    userData: UserType 
    virtualBoxId: string
}) {
  const { loaded } = useClerk();

  const vb = userData.virtualBox.find((box) => box.id === virtualBoxId) as VirtualBoxType;
    


  return (
    <div className="flex w-screen flex-col h-screen bg-background">
        <Room id={virtualBoxId}>
        <div className="h-12 flex">
            <EditorNavbar userData={userData} virtualBox={vb} />
        </div>
        <div className="w-screen flex flex-1 grow">
            {loaded && <CodeEditor userData={userData} virtualBoxId={virtualBoxId} />}
        </div>
        </Room>
    </div>
  );
}
