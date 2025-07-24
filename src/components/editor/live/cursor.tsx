import { colors } from "@/frontend/src/lib/colors";
import {
    AwarenessList,
    TypedLiveblocksProvider,
    UserAwareness,
    useSelf,
} from "@/frontend/liveblocks.config";
import { useEffect, useMemo, useState } from "react";

export function Cursors({ yProvider }: { yProvider: TypedLiveblocksProvider }) {

      // Get user info from Liveblocks authentication endpoint
    const userInfo = useSelf((me) => me.info);

    const [awarenessUsers, setAwarenessUsers] = useState<AwarenessList>([]);

    useEffect(() => {
        if (!userInfo || !yProvider) return;

        // Set the local user's info in awareness state
        const localUser: UserAwareness["user"] = {
            name: userInfo.name,
            email: userInfo.email,
            color: userInfo.color,
        };

        yProvider.awareness.setLocalStateField("user", localUser);

        function updateAwarenessUsers() {
            setAwarenessUsers(
                Array.from(yProvider.awareness.getStates()) as AwarenessList
            );
        }

        yProvider.awareness.on("change", updateAwarenessUsers);
        updateAwarenessUsers(); // initial set

        return () => {
            yProvider.awareness.off("change", updateAwarenessUsers);
        };
    }, [userInfo, yProvider]);


  // Get user info from Liveblocks authentication endpoint
    const styleSheet = useMemo(() => {
        let cursorStyles = "";

        for (const [clientId, client] of awarenessUsers) {
            if (client?.user) {
                cursorStyles += `
                .yRemoteSelection-${clientId},
                .yRemoteSelectionHead-${clientId} {
                    --user-color: ${colors[client.user.color]};
                }

                .yRemoteSelectionHead-${clientId}::after {
                    content: "${client.user.name
                            ?.split(" ")
                            .slice(0, 2)
                            .map((letter) => letter[0].toUpperCase())}";
                }
            `;
            }
        }

        return { __html: cursorStyles };
    }, [awarenessUsers]);

    return <style dangerouslySetInnerHTML={styleSheet} />;
}