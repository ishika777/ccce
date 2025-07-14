import React, { useRef, useEffect } from "react";
import { toast } from "sonner";
import { Socket } from "socket.io-client";
import { Link, RotateCw, UnfoldVertical, Loader } from "lucide-react"; // Assuming Loader is your loading animation component

export default function PreviewWindow({
    collapsed,
    open,
    socket,
    loading,
    setLoading,
    iframeKey,
    setIframeKey,
    previewUrl,
    setPreviewUrl
}: {
    collapsed: boolean;
    open: () => void;
    socket: Socket;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    iframeKey: number;
    setIframeKey: React.Dispatch<React.SetStateAction<number>>
    previewUrl: string
    setPreviewUrl: React.Dispatch<React.SetStateAction<string>>
}) {
    const ref = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const handlePreviewUrl = (url: string) => {
            console.log(url)
            setPreviewUrl(url);
            setLoading(false);
        };

        socket.on("preview-url", handlePreviewUrl);

        return () => {
            socket.off("preview-url", handlePreviewUrl);
        };
    }, [socket]);

    const handleRefresh = () => {
        toast.info("does nothing")
        setIframeKey((prev: number) => prev + 1);
        // setLoading(true);
    };

    return (
        <>
            <div className={`${collapsed ? "h-full" : "h-10"} select-none w-full flex gap-2`}>
                <div className="flex items-center w-full justify-between h-8 rounded-md px-3 bg-secondary">
                    <div className="text-xs">Preview</div>

                    <div className="flex space-x-1 translate-x-1">
                        {collapsed ? (
                            <PreviewButton onClick={open}>
                                <UnfoldVertical className="w-4 h-4" />
                            </PreviewButton>
                        ) : (
                            <>
                                <PreviewButton
                                    onClick={() => {
                                        if (previewUrl) {
                                            navigator.clipboard.writeText(previewUrl);
                                            toast.success("Copied preview link to clipboard");
                                        } else {
                                            toast.error("Preview not available yet.");
                                        }
                                    }}
                                >
                                    <Link className="w-4 h-4" />
                                </PreviewButton>

                                <PreviewButton onClick={handleRefresh}>
                                    <RotateCw className="w-4 h-4" />
                                </PreviewButton>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {collapsed ? null : (
                <div className="w-full grow rounded-md bg-foreground">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        previewUrl && (
                            <iframe
                                key={iframeKey}
                                ref={ref}
                                width="100%"
                                height="100%"
                                src={previewUrl}
                                className="rounded-md border-none"
                                sandbox="allow-scripts allow-same-origin"
                            />
                        )
                    )}
                </div>
            )}
        </>
    );
}

function PreviewButton({
    children,
    onClick,
}: {
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <div
            className="p-0.5 h-5 w-5 ml-0.5 flex items-center justify-center transition-colors bg-transparent hover:bg-muted-foreground/25 cursor-pointer rounded-sm"
            onClick={onClick}
        >
            {children}
        </div>
    );
}
