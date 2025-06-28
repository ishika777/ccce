"use client";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

const DeleteConfirmDialog = ({ onDelete, open, setOpen, isDeleting, setIsDeleting, virtualBoxId }: {
    onDelete: (virtualboxId: string) => void
    open: boolean;
    setOpen: (open: boolean) => void;
    isDeleting: boolean
    setIsDeleting: (isDeleting: boolean) => void
    virtualBoxId: string
}) => {


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the virtualBox.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex w-full justify-end gap-2 pt-4">
                    <Button className="w-full bg-red-500 text-white hover:bg-red-600"
                        disabled={isDeleting}
                        onClick={() => {
                            setIsDeleting(true);
                            onDelete(virtualBoxId)
                        }}
                    >
                        {
                            isDeleting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Deleting...</span>
                                </div>
                            ) : (
                                <span>Delete</span>
                            )
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteConfirmDialog;
