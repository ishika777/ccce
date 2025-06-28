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
import { SharedUserType } from "../../lib/types";
import { Avatar } from "../ui/avatar";


const DashboardSharedPage = ({ shared }: { shared: SharedUserType[] }) => {
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
                            {shared.map((virtualbox) => (
                                <TableRow key={virtualbox.id}>
                                    <TableCell>
                                        <div className="font-medium flex items-center">
                                            <Image
                                                src={
                                                    virtualbox.type === "react"
                                                        ? "/project-icons/react.svg"
                                                        : "/project-icons/node-svg"
                                                }
                                                width={20}
                                                height={20}
                                                className="mr-2"
                                                alt=""
                                            />
                                            {virtualbox.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <div className="h-4 w-4 bg-red-500 rounded-full mr-2">
                                            </div>
                                            <div className="font-semibold text-lg">
                                                Ishika
                                            </div>
                                            <Avatar className="mr-2">
                                                {virtualbox.author.name}
                                            </Avatar>
                                            {virtualbox.author.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(virtualbox.sharedOn).toLocaleDateString()}
                                        {new Date().toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/code/${virtualbox.id}`}>
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