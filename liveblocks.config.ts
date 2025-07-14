import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";


import { colors } from "./src/lib/colors";


const client = createClient({
    // publicApiKey: "",
    authEndpoint: "/api/lib-auth",
});

type Presence = {};
type Storage = {};
type UserMeta = {
    id: string;
    info: {
        name: string;
        email: string;
        color: keyof typeof colors;
    };
};
type RoomEvent = {};
type ThreadMetadata = {};

export type UserAwareness = {
    user?: UserMeta["info"];
};

export type AwarenessList = [number, UserAwareness][];

export const {
    RoomProvider,
    useRoom,
    useSelf,
    useOthers,
    useMyPresence,

} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(
    client
);



export type TypedLiveblocksProvider = LiveblocksYjsProvider;