import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createUser, fetchUserById } from "@/frontend/actions/user-actions"
import { toast } from "sonner"

const AppAuthLayout = async ({ children }: { children: React.ReactNode }) => {

    const user = await currentUser()

    if (!user) {
        redirect(`/`)
    }

    let dbUser;
    try {
        dbUser = await fetchUserById(user.id);
    } catch (error: any) {
        console.log(error)
        toast.error(error)
    }
    console.log(dbUser);

    if (!dbUser || Object.keys(dbUser).length === 0) {
        const data = {
            id: user.id,
            name: user.firstName + " " + user.lastName,
            email: user.emailAddresses[0].emailAddress,
        };
        try {
            const newUser = await createUser(data);
            console.log(newUser)
        } catch (error: any) {
            toast.error(error)
        }
    }


    return (
        <>
            {children}
        </>
    )
}

export default AppAuthLayout