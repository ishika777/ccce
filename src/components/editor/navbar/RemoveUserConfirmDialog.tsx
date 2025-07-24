"use client";
import { Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../../ui/dialog";



const RemoveUserConfirmDialog = ({handleUnshare, open, setOpen, isDeleting, setIsDeleting}: {
    handleUnshare: () => void
    open: boolean;
    setOpen: (open: boolean) => void;
    isDeleting: boolean
    setIsDeleting: (isDeleting: boolean) => void
}) => {
  return (
   <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        The user will no longer be able to access thi VirtualBox.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex w-full justify-end gap-2 pt-4">
                    <Button className="w-full bg-red-500 text-white hover:bg-red-600"
                        disabled={isDeleting}
                        onClick={() => {
                            setIsDeleting(true);
                            handleUnshare()
                        }}
                    >
                        {
                            isDeleting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Removing...</span>
                                </div>
                            ) : (
                                <span>Remove</span>
                            )
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
  )
}

export default RemoveUserConfirmDialog