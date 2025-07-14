import { redirect } from "next/navigation"
import { createUser, fetchUserById } from "@/frontend/actions/user-actions"
import { auth, clerkClient } from "@clerk/nextjs/server";

const AppAuthLayout = async ({ children }: { children: React.ReactNode }) => {

      const { userId } = await auth();
      if (!userId) {
          redirect("/");
      }

      
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

    let dbUser;
    try {
        dbUser = await fetchUserById(userId);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log("An unknown error occurred.");
        }
    }

    if (!dbUser || Object.keys(dbUser).length === 0) {
        const data = {
            id: user.id,
            name: user.firstName + " " + user.lastName,
            email: user.emailAddresses[0].emailAddress,
        };
        try {
            const newUser = await createUser(data);
            console.log(newUser)
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log(error.message);
            } else {
                console.log("An unknown error occurred.");
            }
        }
    }


    return (
        <>
            {children}
        </>
    )
}

export default AppAuthLayout