import { Box, Button, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { gridBoxGen, httpFunc, typogItemGen, typogLinkGen } from "../functions";
import { getUserId, getToken } from "../index";
import GetProfileData, { initialProfilePageValues } from "../components/getProfileData";
import { useNavigate } from "react-router-dom";
import { profilePageValues } from "../components/getProfileData";
import SpinLoader from "../components/SpinLoader";


type userObject = {
    username: string,
    user_id: number,
    connections: number,
    is_connected: boolean,
    is_charity: boolean,
    is_pending: boolean
}

const allUsers: userObject[] = [];

const useBlockList = (blocked_users: Array<Number>) => {
    const [blockedIds, setBlockedIds] = useState(blocked_users);
  
    const addToBlocked = (id: number) => setBlockedIds((prev) => [...prev, id]);
  
    const removeFromBlocked = (id: number) =>
        setBlockedIds((prev) => prev.filter((existingId) => existingId !== id));
  
    const isBlocked = (id: number) => !!blockedIds.find(user_id => user_id === id);
  
    const toggleBlocked = (id: number) =>
      isBlocked(id) ? removeFromBlocked(id) : addToBlocked(id);
  
    return { isBlocked, toggleBlocked, setBlockedIds};
};

export default function AllUsers () {
    const [users, setUsers] = useState(allUsers);
    const [loading, setLoading] = useState(true);
    const [myData, setValues] = useState(initialProfilePageValues);
    const fetchAndSetMyData = async () => {setValues(await GetProfileData(getUserId()))};
    const fetchAndSetUsersData = async () => {
        const receivedData = await getAllUsers();
        setLoading(false);
        const formattedData = formatData(receivedData);
        setUsers(formattedData);
    }
    useEffect (() => {
        fetchAndSetMyData();
        fetchAndSetUsersData();
    }, [])

    return (
        <>
        <Box className="divBuffer">
            <Box className="mainBoxWidth">
                {AllUsersGrid(users, myData, loading, fetchAndSetMyData, fetchAndSetUsersData)}
            </Box>
        </Box>
        </>
    )
}

function AllUsersGrid (users: userObject[], myData: profilePageValues, loading: boolean, fetchAndSetMyData: () => void, fetchAndSetUsersData: () => void) {
    const blocked_users =  myData.blocked_users;
    const permissions = myData.permissions;
    const amIcharity = myData.accountType == "charity";
    const { isBlocked, toggleBlocked } = useBlockList(blocked_users);
    const navigate = useNavigate();
    if (loading) return (<SpinLoader/>)

    const handleMouseEvent = async (type: string, currUserId: string) => {
        switch(type) {
            case "connect":
                await postConnectRequest(currUserId);
                fetchAndSetMyData();
                fetchAndSetUsersData();
                break;
            case "block":
                await postBlockUnblockUser("block",currUserId);
                fetchAndSetMyData();
                fetchAndSetUsersData();
                break;
            case "unblock":
                await postBlockUnblockUser("unblock",currUserId);
                fetchAndSetMyData();
                fetchAndSetUsersData();
                break;
            default:
                break;

        }
    };
    return (
        <>
            <Box sx={{maxWidth:'70%', margin:'auto'}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box sx={{margin:'auto', textAlign:'center'}}>
                            <Typography variant="h4">
                                All Users
                            </Typography>
                        </Box>
                        {permissions === 1 && <Box sx={{margin:'auto', textAlign:'center'}}>
                            <>
                                <Button onClick={() => navigate("/admin")} variant="contained">
                                    Admin
                                </Button>
                            </>
                        </Box>}
                    </Grid>
                    {users.map((user) => {
                        const buttonConnect = () => {
                            return (
                                <>
                                <Button 
                                onClick={() => 
                                    {
                                        if (!user.is_connected) handleMouseEvent("connect",String(user.user_id))
                                    }
                                }
                                disabled={user.is_connected || (user.is_charity == amIcharity) || user.is_pending}
                                variant="contained">
                                    {user.is_pending ? 'Pending' : 'Connect' }
                                </Button>
                                </>
                            )
                        }
                        const blockButton = () => {
                            return (
                                <>
                                <Button 
                                variant="contained"
                                onClick={() => {
                                    (isBlocked(user.user_id)) ?
                                    handleMouseEvent("unblock",String(user.user_id)):
                                    handleMouseEvent("block",String(user.user_id));
                                    toggleBlocked(user.user_id);
                                }
                                }>
                                    {(isBlocked(user.user_id)) ? "Unblock" : "Block"}
                                </Button>
                                </>
                            )
                        }
                        const currProfUrl = "http://localhost:3000/profile/" + user.user_id;
                        return (
                            <>
                            {gridBoxGen(5,typogLinkGen('body1',user.username, currProfUrl))}
                            {gridBoxGen(1,typogItemGen('body1',String(user.connections)))}
                            {gridBoxGen(3,buttonConnect())}
                            {gridBoxGen(3,blockButton())}
                            </>
                        )
                    })}
                </Grid>

            </Box>
        </>
    )
}

type dataObject = {
    users: userObject[]
}

function formatData(data:dataObject): userObject[] {
    const returnData: userObject[] = data.users.map((item) => {
        return {
            username:item.username,
            user_id:item.user_id,
            connections:item.connections,
            is_connected:item.is_connected,
            is_charity: item.is_charity,
            is_pending: item.is_pending
        }
    })
    return returnData;
}

async function getAllUsers () {
    const requestOptions = {
        method: 'GET',
        headers: { 
            'token'         : getToken()
        },
    };
    return httpFunc('http://localhost:6969/user/get_users',requestOptions);
}

async function postConnectRequest (partner_id: string) {
    const postData = JSON.stringify({token: getToken(), partner_id: partner_id, message: ""})
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: postData
    };
    return httpFunc('http://localhost:6969/social/request_connection',requestOptions);
}

async function postBlockUnblockUser (mode: string, blockee_id: string) {
    const postData = JSON.stringify({token: getToken(), user_id: blockee_id})
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: postData
    };
    switch(mode) {
        case "block":
            return httpFunc('http://localhost:6969/social/block_user',requestOptions);
        case "unblock":
            return httpFunc('http://localhost:6969/social/unblock_user',requestOptions);
        default:
            break;
    }
}

