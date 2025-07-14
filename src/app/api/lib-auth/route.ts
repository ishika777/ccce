import { fetchUserById } from "@/frontend/actions/user-actions";
import { colors } from "@/frontend/src/lib/colors";
import { UsersToVirtualBoxesType, VirtualBoxType } from "@/frontend/src/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { toast } from "sonner";

const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        return new Response("Unauthorized", { status: 401 });
    }

    let user;
    try {
        user = await fetchUserById(clerkUser.id);
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error.message);
        } else {
            toast.error("An unknown error occurred.");
        }
    }

    if (!user) {
        return new Response("User not found", { status: 404 });
    }

    const colorNames = Object.keys(colors);
    const randomColor = colorNames[Math.floor(Math.random() * colorNames.length)] as keyof typeof colors;

    const session = liveblocks.prepareSession(user.id, {
        userInfo: {
            id: user.id,
            name: user.name,
            email: user.email,
            color: randomColor,
        },
    });


    user?.virtualBox.map((virtualbox: VirtualBoxType) => {
        console.log("Allowed access vb:", user.email);
        session.allow(`${virtualbox.id}`, session.FULL_ACCESS);
    });

    user?.usersToVirtualboxes?.map((uvb: UsersToVirtualBoxesType) => {
        console.log("Allowed access uvb:",  user.email);
        session.allow(`${uvb.virtualboxId}`, session.FULL_ACCESS);
    });


    const { body, status } = await session.authorize();
    return new Response(body, { status });
}