export type UserType = {
    id: string;
    name: string;
    email: string;
    generations: number;
    virtualBox: VirtualBoxType[];
    usersToVirtualboxes: UsersToVirtualBoxesType[];
};

export type SharedUserType = {
    id: string;
    name: string;
    type: "react" | "node";
    author: {
            id: string;
            name: string;
            email: string;
            image: string;
        };
    sharedOn: Date;
}

export type VirtualBoxType = {
    id: string;
    name: string;
    type: "react" | "node";
    visibility: "public" | "private";
    userId: string;
    usersToVirtualboxes: UsersToVirtualBoxesType[];
};

export type UsersToVirtualBoxesType = {
    userId: string;
    virtualboxId: string;
};

export type TFolder = {
    id: string
    type: "folder"
    name: string
    fullPath: string;
    children: (TFolder | TFile)[]
}

export type TFile = {
    id: string
    type: "file"
    name: string
    fullPath: string;
}

export type TTab = TFile & {
    saved: boolean
}