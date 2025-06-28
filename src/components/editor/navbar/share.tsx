"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "../../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "../../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { Loader2, UserPlus, X } from "lucide-react";
import { UserType, VirtualBoxType } from "@/frontend/src/lib/types";
import SharedUser from "./sharedUser";
import { toast } from "sonner";
import { fetchSharedUsers, shareVirtualBox } from "@/frontend/actions/virtualBox-actions";
import { fetchAllUsers } from "@/frontend/actions/user-actions";

const formSchema = z.object({
    email: z.string().email(),
});


const ShareVirtualboxModal = ({
    open,
    setOpen,
    data,
    userId
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    data: VirtualBoxType;
    userId: string;
}) => {

    const [shared, setShared] = useState<UserType[]>([]);
    const [allUsers, setAllUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });


    const fetchData = async () => {
        try {
            const allUsersData = await fetchAllUsers() as UserType[];
            const sharedUsers = await fetchSharedUsers(userId) as UserType[];

            const sharedEmails = sharedUsers.map(user => user.email);
            const filteredUsers = allUsersData.filter(user => !sharedEmails.includes(user.email));

            setAllUsers(filteredUsers);
            setShared(sharedUsers);
           
        } catch (error: any) {
            toast.error(error)
        }
    }

    useEffect(() => {
        fetchData();
    }, [open])



    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true);
            const res = await shareVirtualBox(data.id, userId, values.email);
            toast.success(res.message);
            setOpen(false);
        } catch (error: any) {
            toast.error(error)
        } finally {
            setLoading(false);
            form.reset();
        }


    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[450px] overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle>Share Virtualbox</DialogTitle>
                    {data.visibility === "private" ? (
                        <DialogDescription className="text-sm text-muted-foreground">
                            This virtualbox is private. Making it public will allow shared
                            users to view and collaborate.
                        </DialogDescription>
                    ) : null}
                </DialogHeader>
                {
                    data.visibility === "public" && (
                        <div className={`p-3 ${shared.length > 0 ? "pb-3" : null} space-y-6`}>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)}>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="mr-4 w-full">
                                                <FormLabel>User email</FormLabel>

                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a user" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        {allUsers.map((user) => (
                                                            <SelectItem key={user.id} value={user.email}>
                                                                {user.email}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button disabled={loading} type="submit" className="w-full mt-5">
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="mr-2 w-4 h-4" /> Share
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>

                            {shared.length > 0 && (
                                <>
                                    <div className="w-full h-[1px] bg-border" />
                                    <div className="p-6 pt-3">
                                        <DialogHeader className="mb-3">
                                            <DialogTitle>Manage Access</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-2">
                                            {shared.map((user) => (
                                                <SharedUser
                                                    key={user.id}
                                                    sharedTouser={user}
                                                    virtualboxId={data.id}
                                                    userId={userId}
                                                    setOpen={setOpen}
                                                    fetchData={fetchData}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )
                }
            </DialogContent>
        </Dialog>
    );
}


export default ShareVirtualboxModal