import { fetchUserById } from "@/frontend/actions/user-actions";
import { getVirtualBoxById } from "@/frontend/actions/virtualBox-actions";
import EditorHomePage from "@/frontend/src/components/editor/homePage";
import { UsersToVirtualBoxesType, VirtualBoxType } from "@/frontend/src/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

type ShowPageProps = {
    params: Promise<{ id: string }>
}


const CodePage: React.FC<ShowPageProps> = async ({ params }) => {
    const { id } = await params;

    const user = await currentUser();
    if (!user) redirect("/");

    let dbUser;
    try {
        dbUser = await fetchUserById(user.id);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message)
        } else {
            console.log("An unknown error occurred.");
        }
    }

    if (!dbUser) redirect("/");

    let virtualBox: VirtualBoxType = await getVirtualBoxById(id);

    const isOwner = virtualBox?.userId === dbUser.id;

    if (!virtualBox || !isOwner) {
        const sharedLink = dbUser.usersToVirtualboxes?.find((vb: UsersToVirtualBoxesType) => vb.virtualboxId === id);

        if (sharedLink) {
            virtualBox = await getVirtualBoxById(id);
        } else {
            return notFound();
        }
    }

    return <EditorHomePage userData={dbUser} virtualBox={virtualBox} />;
};

export default CodePage;
