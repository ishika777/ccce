"use client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/frontend/src/components/ui/table"
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { UsersToVirtualBoxesType, UserType, VirtualBoxType } from "../../lib/types";
import { useEffect, useState } from "react";
import { getVirtualBoxById } from "@/frontend/actions/virtualBox-actions";
import { fetchUserById } from "@/frontend/actions/user-actions";


const DashboardSharedPage = ({ shared }: { shared: UsersToVirtualBoxesType[] }) => {


    const [data, setData] = useState<{
        virtualBox: VirtualBoxType,
        user: UserType,
        sharedOn: string
    }[]>([]);

    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            shared.map(async (data) => {
                const vb = await getVirtualBoxById(data.virtualboxId);
                const user = await fetchUserById(data.sharedBy);
                setData((prev) => {
                    return [
                        ...prev, {
                            virtualBox: vb,
                            user,
                            sharedOn: data.sharedOn
                        }
                    ]
                })
            })
            setLoading(false);
        }
        fetchData()
    }, [])


    return (
        <div className="grow p-4 flex flex-col">
            <div className="text-xl font-medium mb-8">Shared With Me</div>
            {shared.length > 0 ? (
                <div className="grow w-full px-4">
                    <Table className="">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Virtualbox Name</TableHead>
                                <TableHead>Shared By</TableHead>
                                <TableHead>Sent On</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                loading && (
                                    <div>loading...</div>
                                )
                            }
                            {!loading && data.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <div className="font-medium flex items-center">
                                            <Image
                                                src={
                                                    item.virtualBox.type === "react"
                                                        ? "/project-icons/react.svg"
                                                        : "/project-icons/node.svg"
                                                }
                                                width={20}
                                                height={20}
                                                className="mr-2"
                                                alt=""
                                            />
                                            <span className="text-lg">
                                                {item.virtualBox.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <div className="h-3 w-3 bg-red-500 rounded-full mr-2">
                                            </div>
                                            <div>
                                                <div className="font-semibold text-md">
                                                    {item.user.name}
                                                </div>
                                                <span>{item.user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(item.sharedOn).toLocaleString("en-IN", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/code/${item.virtualBox.id}`}>
                                            <Button>
                                                Open <ChevronRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div>
                    No Virtualboxes here. Get a friend to share one with you, and try out
                    live collaboration!
                </div>
            )}
        </div>
    );
}

export default DashboardSharedPage