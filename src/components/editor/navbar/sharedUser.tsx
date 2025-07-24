"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { Loader2, X } from "lucide-react";
import CustomAvatar from "../../custom/CustomAvatar";
import { UserType } from "@/frontend/src/lib/types";
import RemoveUserConfirmDialog from "./RemoveUserConfirmDialog";
import {toast} from "sonner"
import { unShareVirtualBox } from "@/frontend/actions/virtualBox-actions";

export default function SharedUser({
    sharedTouser,
    virtualboxId,
    userId,
    setOpen,
    fetchData

}: {
    sharedTouser: UserType;
    virtualboxId: string;
    userId: string;
    setOpen: (open: boolean) => void;
    fetchData: () => void
}) {

    const [openRemove, setOpenRemove] = useState<boolean>(false);
    const [isRemoving, setIsRemoving] = useState<boolean>(false);

    async function handleUnshare() {
        try {
            const res = await unShareVirtualBox(virtualboxId, sharedTouser.id, userId);
            toast.success(res.message);
            setOpen(false);
            fetchData()
        }catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error.message);
        } else {
            toast.error("An unknown error occurred.");
        }
    } finally {
            setIsRemoving(false);
            setOpenRemove(false);
        }
    }

    return (
        <>
            <RemoveUserConfirmDialog
                open={openRemove}
                setOpen={setOpenRemove}
                handleUnshare={handleUnshare}
                isDeleting={isRemoving}
                setIsDeleting={setIsRemoving}
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <CustomAvatar name={sharedTouser.email} className="mr-2" />
                    {sharedTouser.email}
                </div>
                <Button
                    disabled={isRemoving}
                    onClick={() => setOpenRemove(true)}
                    variant={"ghost"}
                    size="smIcon"
                >
                    {isRemoving ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                        <X className="w-4 h-4" />
                    )}
                </Button>
            </div>
        </>
    );
}