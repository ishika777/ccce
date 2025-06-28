"use clint"
import { z } from "zod";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { VirtualBoxType } from "@/frontend/src/lib/types";
import { deleteVirtualBox, updateVirtualBox } from "@/frontend/actions/virtualBox-actions";


const formSchema = z.object({
    name: z.string().min(1).max(16),
    visibility: z.enum(["public", "private"])
})

const EditVirtualBoxModal = ({ open, setOpen, data, userId, virtualboxId }: {
    open: boolean
    setOpen: (open: boolean) => void
    data: VirtualBoxType
    userId: string
    virtualboxId: string
}) => {

    const [loading, setLoading] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: data.name,
            visibility: data.visibility,
        },
    });


    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true);
            const res = await updateVirtualBox(virtualboxId, userId, values.name, values.visibility);
            await router.refresh();
            toast.success(res.message);
        } catch (error: any) {
            toast.error(error)
        } finally {
            setOpen(false);
            setLoading(false);
        }
    }


    async function onDelete() {
        setLoadingDelete(true);
        const data = {
            id: virtualboxId,
            userId,
        }
        try {
            const res = await deleteVirtualBox(data);
            router.push("/dashboard");
            toast.success(res.message);
        } catch (error: any) {
            toast.error(error);
        } finally {
            setLoadingDelete(false);
        }
    }



    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Virtualbox Info</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="mb-4">
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My Project" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="visibility"
                            render={({ field }) => (
                                <FormItem className="mb-8">
                                    <FormLabel>Visibility</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl className="w-1/3">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="public">Public</SelectItem>
                                            <SelectItem value="private">Private</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button disabled={loading} type="submit" className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading...
                                </>
                            ) : (
                                "Update Virtualbox"
                            )}
                        </Button>
                    </form>
                </Form>
                <Button
                    disabled={loadingDelete}
                    onClick={onDelete}
                    // variant={"destructive"}
                    className="w-full !bg-red-600 text-white"
                >
                    {loadingDelete ? (
                        <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading...
                        </>
                    ) : (
                        "Delete Virtualbox"
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    )
}

export default EditVirtualBoxModal