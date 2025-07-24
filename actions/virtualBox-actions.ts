import axios from "axios";
import { toast } from "sonner";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/virtualbox`;


// export const fetchVirtualBoxesByUser = async (id: string) => {
//     try {
//         const res = await axios.get(`${BASE_URL}/${id}`);
//         return res.data;
//     } catch (error: any) {
//         toast.error(error.response?.data?.message || "Failed to create virtual box");
//     }
// };
export const getVirtualBoxById = async (id: string) => {
    try {
        const res = await axios.get(`${BASE_URL}/id/${id}`);
        return res.data.virtualBox;
    } catch (error: any) {
        throw error.response?.data?.message || error.message || "Failed to fetch shared users";
    }
};

export const createVirtualBox = async (data: {
    userId: string;
    name: string;
    type: "react" | "node";
    visibility: "public" | "private";
}) => {
    try {
        const res = await axios.post(BASE_URL, data);
        toast.success(res.data.message);
        return res.data.virtualbox;
    } catch (error: any) {
        throw error.response?.data?.message || error.message || "Failed to create virtual box";
    }
};

export const deleteAllVirtualBox = async (userId: string) => {
    try {
        const res = await axios.delete(`${BASE_URL}/all`, { data: { userId } });
        return res.data;
    } catch (error: any) {
        throw error.response?.data?.message || error.message || "Failed to delete all Virtual Boxes";


    }
}

export const deleteVirtualBox = async (data: {
    id: string;
    userId: string;
}) => {
    try {
        const res = await axios.delete(BASE_URL, { data });
        return res.data
    } catch (error: any) {
        throw error.response?.data?.message || error.message || "Failed to delete virtual box";
    }
};

export const changeVisibility = async (
    id: string,
    userId: string,
    visibility: "public" | "private"
) => {
    try {
        const res = await axios.put(BASE_URL, { id, userId, visibility });
        return res.data
    } catch (error: any) {
        throw error.response?.data?.message || error.message || "Failed to change visibility";
    }
}

export const updateVirtualBox = async (
    id: string,
    userId: string,
    name?: string,
    visibility?: "public" | "private",
) => {
    try {
        const res = await axios.put(BASE_URL, { id, userId, name, visibility });
        return res.data;
    } catch (error: any) {
        throw error.response?.data?.message || error.message || "Failed to update virtual box";
    }
}

export const fetchSharedUsers = async (userId: string) => {
    try {
        const res = await axios.get(`${BASE_URL}/shared/users/${userId}`);
        return res.data;
    } catch (error: any) {
        throw error.response?.data?.message || error.message || "Failed to fetch shared users";
    }
};

export const shareVirtualBox = async (virtualboxId: string, userId: string, email: string) => {
    try {
        const res = await axios.post(`${BASE_URL}/share`, { virtualboxId, shareById: userId, email });
        return res.data;
    } catch (error: any) {
        throw error.response?.data?.message || error.message || "Failed to share virtual box";
    }
};

export const unShareVirtualBox = async (virtualboxId: string, sharedToId: string, sharedById: string) => {
    try {
        const data = {
            virtualboxId, sharedToId, sharedById
        }
        const res = await axios.delete(`${BASE_URL}/share`, { data });
        return res.data;
    } catch (error: any) {
        throw error.response?.data?.message || error.message || "Failed to share virtual box";
    }
};






export const incrementUserGenerations = async (userId: string) => {
    const res = await axios.post(`${BASE_URL}/generate`, { userId });
    if (res.status !== 200) throw new Error("Failed to increment generations");
};
