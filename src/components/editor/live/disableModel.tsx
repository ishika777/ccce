"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DisableAccessModal({
    open,
    message,
}: {
    open: boolean;
    message: string;
}) {

    const router = useRouter();

    useEffect(() => {
        if (open) {
            const timeout = setTimeout(() => {
                router.push("/dashboard");
            }, 5000);

            return () => clearTimeout(timeout);
        }
    }, [open, router]);


    return (
        <Dialog open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Live Collaboration Disabled</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-muted-foreground space-y-2">
                    <div>{message}</div>
                    <div className="flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Redirecting you to dashboard....
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}