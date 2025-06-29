"use client";

import { colorClasses, colors } from "@/frontend/src/lib/colors";
import { useOthers } from "@/frontend/liveblocks.config";

export function Avatars() {
    const users = useOthers();

    const colorNames = Object.keys(colors);

    return (
        <div className="flex space-x-2">
            {users.map(({ connectionId, info }) => {
                const c = colorNames[
                    connectionId % colorNames.length
                ] as keyof typeof colors;
                return (
                    <div
                        className={`w-8 h-8 font-mono rounded-full ring-1 ${colorClasses[c].ring} ring-offset-2 ring-offset-background overflow-hidden bg-gradient-to-tr ${colorClasses[c].bg} flex items-center justify-center text-xs font-medium`}
                        key={connectionId}
                    >
                        {info.name
                            ?.split(" ")
                            .slice(0, 2)
                            .map((letter) => letter[0].toUpperCase())}
                    </div>
                );
            })}
        </div>
    );
}