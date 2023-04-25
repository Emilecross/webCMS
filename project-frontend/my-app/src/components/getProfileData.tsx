import { getToken } from "..";
import { httpFunc } from "../functions";
import { blogObject } from "../routes/blog";

export default async function GetProfileData(userId: string) {
    const receivedData = await getUserData(userId);
    const formattedData = formatUserData(receivedData, userId);
    return formattedData;
}

export type profilePageValues = {
    token: string,
    userId: string,
    userName: string,
    email: string,
    connections: number,
    accountType: string,
    needs: string[],
    permissions: number,
    isOwn: boolean,
    description: string,
    blocked_users: number[],
    blogs: blogObject[]
}

export const initialProfilePageValues: profilePageValues = {
    token: "",
    userId: "",
    userName: "",
    email: "",
    connections: 0,
    accountType: "",
    needs: [""],
    permissions: 0,
    isOwn: false,
    description: "",
    blocked_users: [],
    blogs: []
}

function formatUserData (data: any, user_id: string): profilePageValues {
    const returnData = {
        token: getToken(),
        userId: user_id,
        userName: data.username,
        email: data.email,
        connections: data.connections,
        accountType: (data.is_charity) ? "charity" : "sponsor",
        needs: (data.needs) ? data.needs : [],
        permissions: data.permissions,
        isOwn: data.is_own,
        description: data.description,
        blocked_users: data.blocked_users,
        blogs: data.blogs
    };
    return returnData;
}

async function getUserData (userId: string) {
    const headerData = {
        'Content-Type'  :   'application/json',
        'token'         :   getToken(),
        'user_id'       :   userId
    }
    const requestOptions = {
        method: 'GET',
        headers: headerData,
    };
    return httpFunc("http://localhost:6969/user/profile_data",requestOptions);
}