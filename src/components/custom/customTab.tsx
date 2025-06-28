"use client"
import { X } from "lucide-react";
import { Button } from "../ui/button";

const CustomTab = ({ children, selected, onClick, onClose, saved }: {
    children: React.ReactNode
    selected?: boolean
    saved?: boolean;
    onClick?: () => void
    onClose?: () => void
}) => {
    return (
        <Button
            onClick={onClick ?? undefined}
            size={"sm"}
            variant={"secondary"}
            className={`font-normal select-none py-0 cursor-pointer ${selected
                ? "bg-neutral-500 hover:bg-neutral-600 text-foreground"
                : "text-muted-foreground"
                }`}
        >
            {children}
            <div onClick={onClose && (
                        (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onClose();
                        }
                    )
                }
                className="h-5 w-5 ml-0.5 group flex items-center justify-center translate-x-1 transition-colors bg-transparent hover:bg-muted-foreground/25 cursor-pointer rounded-sm"
            >
                {saved ? (
                    <X className="w-2 h-2" />
                ) : (
                    <>
                        <X className="w-2 h-2 group-hover:block hidden" />
                        <div className="w-2 h-2 rounded-full bg-foreground group-hover:hidden" />
                    </>
                )}
            </div>
        </Button>
    )
}

export default CustomTab