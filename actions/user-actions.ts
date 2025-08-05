import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`;

export const fetchAllUsers = async () => {
    try {
        const res = await axios.get(BASE_URL);
        return res.data.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                throw error.response?.data?.message || error.message || "Failed to fetch users";
            }
            throw "Failed to fetch users";
        }
    };

export const fetchUserById = async (id: string) => {
    try {
        const res = await axios.get(`${BASE_URL}/${id}`);
        return res.data
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            throw error.response?.data?.message || error.message || "Failed to fetch user";
        }
        throw "Failed to fetch user";
    }
};

type dataType = {
    id: string;
    name: string;
    email: string;
}

export const createUser = async (data: dataType) => {
    try {
        const res = await axios.post(BASE_URL, {data});
        return res.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            throw error.response?.data?.message || error.message || "Failed to create users";
        }
        throw "Failed to create users";
    }
};
