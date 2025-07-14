import ProjectCard from "./projectCard";
import ProjectCardDropdown from "./projectCard/dropdown";
import { Clock, Globe, Lock, Trash2 } from "lucide-react";
import Image from "next/image";
import { UserType, VirtualBoxType } from "../../lib/types";
import { changeVisibility, deleteAllVirtualBox, deleteVirtualBox } from "@/frontend/actions/virtualBox-actions";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import DeleteAllConfirmDialog from "./deletAllDialog";

const DashboardProjects = ({ userData, virtualboxes, q }: {
    userData: UserType
    virtualboxes: VirtualBoxType[];
    q: string | null;
}) => {

    const router = useRouter()

    const [openDeleteAll, setOpenDeleteAll] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState<boolean>(false);


    const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const ondeleteAll = async () => {
        try {
            const res = await deleteAllVirtualBox(userData.id);
            await router.refresh();
            toast.success(res.message);

        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred.");
            }
        } finally {
            setIsDeletingAll(false);
            setOpenDeleteAll(false);
        }
    }

    const onDelete = async (virtualboxId: string) => {
        try {
            const data = {
                id: virtualboxId,
                userId: userData.id,
            }
            const res = await deleteVirtualBox(data);
            await router.refresh();
            toast.success(res.message);

        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred.");
            }
        } finally {
            setIsDeleting(false);
            setOpenDelete(false);
        }

    };

    const onVisibilityChange = async (virtualbox: VirtualBoxType) => {
        const newVisibility: "public" | "private" = virtualbox.visibility === "public" ? "private" : "public";

        try {
            const res = await changeVisibility(virtualbox.id, userData.id, newVisibility);
            await router.refresh();
            toast.success(res.message);
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred.");
            }
        }
    };

    return (
        <div className="grow p-4 flex flex-col">

            <DeleteAllConfirmDialog
                open={openDeleteAll}
                setOpen={setOpenDeleteAll}
                onDelete={ondeleteAll}
                isDeleting={isDeletingAll}
                setIsDeleting={setIsDeletingAll}
            />

            <div className="flex items-start justify-between mb-4">
                <div className="text-xl font-medium mb-8">
                    {q && q.length > 0 ? `Showing search results for: ${q}` : "My Projects"}
                </div>
                <Button onClick={() => {
                    setOpenDeleteAll(true)
                }} size={"icon"} variant={"link"} className="bg-transparent hover:bg-neutral-700">
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            </div>
            <div>
            </div>
            <div className="grow w-full grid lg:grid-cols-3 2xl:grid-cols-4 md:grid-cols-2 gap-4">
                {virtualboxes?.map((virtualbox) => {
                    if (q && q.length > 0) {
                        if (!virtualbox.name.toLowerCase().includes(q.toLowerCase())) {
                            return null;
                        }
                    }
                    return (
                        <ProjectCard key={virtualbox.id}>
                            <div className="flex space-x-2 items-center justify-between w-full" >
                                <Link href={`/code/${virtualbox.id}`} className="flex items-center justify-start gap-2 hover:underline">
                                    <Image
                                        alt="icon"
                                        src={
                                            virtualbox.type === "react"
                                                ? "/project-icons/react.svg"
                                                : "/project-icons/node.svg"
                                        }
                                        width={20}
                                        height={20}
                                    />
                                    <div className="font-medium flex items-center whitespace-nowrap w-full text-ellipsis overflow-hidden">
                                        {virtualbox.name}
                                    </div>
                                </Link>
                                <ProjectCardDropdown
                                    openDelete={openDelete}
                                    setOpenDelete={setOpenDelete}
                                    virtualBox={virtualbox}
                                    onVisibilityChange={onVisibilityChange}
                                    onDelete={onDelete}
                                    isDeleting={isDeleting}
                                    setIsDeleting={setIsDeleting}

                                />
                            </div>

                            <div className="flex items-start justify-between">
                                <div className="flex flex-col text-muted-foreground space-y-0.5 text-sm">
                                    <div className="flex items-center">
                                        {virtualbox.visibility === "public" ? (
                                            <>
                                                <Globe className="mr-2 h-4 w-4" />
                                                <span>Public</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="mr-2 h-4 w-4" />
                                                <span>Private</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-3 h-3 mr-2" /> 3d ago
                                    </div>
                                </div>
                            </div>

                        </ProjectCard>
                    );
                })}
            </div>
        </div>
    );
}
export default DashboardProjects