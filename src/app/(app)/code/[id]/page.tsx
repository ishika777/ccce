import { fetchUserById } from "@/frontend/actions/user-actions";
import EditorHomePage from "@/frontend/src/components/editor/homePage";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { toast } from "sonner";

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
            toast.error(error.message);
        } else {
            toast.error("An unknown error occurred.");
        }
    }

    if (!dbUser) redirect("/");

    return <EditorHomePage userData={dbUser} virtualBoxId={id} />;
};

export default CodePage;
