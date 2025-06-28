import { Button } from "../components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";



const Home = async() => {
    const user = await currentUser()
    if(user){
        redirect(`/dashboard`)
    }
  return (
    <div className="flex w-screen mx-auto flex-col overflow-x-hidden overscroll-none h-screen bg-background">
        <div className="w-full max-w-screen px-8 flex flex-col items-center">
            <h1 className="text-2xl font-medium text-center mt-32">A Collaborative Cloud Code Editor, AI Powered, Auto-Scaling Copilot</h1>
            <div className="text-muted-foreground mt-4 text-center">
                Collaborative Cloud Code Editor is virtual box code editing environment with custom AI code auto-completion and realt-time collaboration. The infrastructure runs on Docker Containers.
            </div>
            <div className="mt-8 flex space-x-4">
                <Link href={"/sign-in"}>
                    <Button>Go To App</Button>
                </Link>
            </div>
            {/* <div className="w-full rounded-lg bg-neutral-800 mt-12 aspect-video">

            </div> */}
        </div>
    </div>
  );
}

export default Home
