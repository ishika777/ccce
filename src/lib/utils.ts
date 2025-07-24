import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"
import { TFile, TFolder } from "./types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export const processFileType = (file: string) => {
    const ext = file.split(".").pop();

    if (ext === "ts" || ext === "tsx") return "typescript"
    if (ext === "js" || ext === "jsx") return "javascript"
    if (ext) return ext;

    return "plaintext"
}


export function validateName(
    newName: string,
    oldName: string,
    type: "file" | "folder"
) {
    if (
        newName === oldName || newName.length === 0 ||
        newName.includes("/") ||
        newName.includes("\\") ||
        newName.includes(" ") ||
        (type === "file" && !newName.includes(".")) ||
        (type === "folder" && newName.includes("."))
    ) {
        toast.error(`Invalid ${type} name`);
        return false;
    }
    return true;
}

export const getFilesInFolder = (tree: (TFile | TFolder)[], targetPath: string): {
        file: string[],
        folder: string[]
    } => {
    const getParentPath = (path: string) => {
        const parts = path.split('/');
        parts.pop(); 
        return parts.join('/');
    };
    const result: {
        file: string[],
        folder: string[]
    } = {
        file: [],
        folder: []
    }

    for (const node of tree) {
        if (getParentPath(node.fullPath) === targetPath) {
            if(node.type === "file"){
                result["file"].push(node.name)
            }else{
                result["folder"].push(node.name)

            }
        }

        if (node.type === "folder") {
            const nested = getFilesInFolder(node.children, targetPath);
            result.file.push(...nested.file);
            result.folder.push(...nested.folder);
        }
    }

    return result;
};

