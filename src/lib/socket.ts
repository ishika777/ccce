import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (
    userId: string,
    virtualBoxId: string,
): Socket => {
    if (!socket) {
        socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
            autoConnect: false,
            transports: ["websocket"],
            query: {
                userId,
                virtualBoxId,
            },
        });
    }

    return socket;
};
