import { Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Slide, Tooltip, Typography } from "@mui/material";
import ReportIcon from '@mui/icons-material/Report';
import { TransitionProps } from "@mui/material/transitions";
import React, { useEffect, useState } from "react";
import { gridBoxGen, httpFunc, typogLinkGen } from "../functions";
import { getToken } from "../index";
import ReportItem, { reportObject } from "../components/ReportItem";
import SpinLoader from "../components/SpinLoader";

export type userObject = {
    username: string,
    user_id: string,
    reports: reportObject[]
}

type userSetObj = {
    users: userObject[],
    setUsers: React.Dispatch<React.SetStateAction<userObject[]>>
}

const Transition = React.forwardRef(
    function Transition (
        props: TransitionProps & {
            children: React.ReactElement<any, any>;
        },
        ref: React.Ref<unknown>,
    ) {
        return <Slide direction="up" ref={ref} {...props} />
    }
);

const initUserValues: userObject[] = [];

export default function AllUsers () {
    const [users, setUsers] = useState(initUserValues);
    const [loading, setLoading] = useState(true);
    const allUsers: userSetObj = {
        users: users,
        setUsers: setUsers
    };
    useEffect (() => {
        const fetchData = async () => {
            const receivedData = await getAllUsers();
            setLoading(false);
            const formattedData = formatData(receivedData);
            setUsers(formattedData);
        }
        fetchData().catch(console.error)
    }, [])

    return (
        <>
        <Box className="divBuffer">
            <Box className="mainBoxWidth">
                {AdminGrid(allUsers, loading)}
            </Box>
        </Box>
        </>
    )
}
function AdminGrid (usersAndSet: userSetObj, loading: boolean) {
    const users = usersAndSet.users;
    const setUsers = usersAndSet.setUsers;
    if (loading) return (<SpinLoader/>)

    const handleRemoveUser = (user_id: string) => {
        
        const usrArrCopy = users.slice(0);
        const index = users.map(i => i.user_id).indexOf(user_id);

        
        const removeResult = async () => {
            await postRemoveRequest(user_id)
        }
        removeResult();
        usrArrCopy.splice(index,1);
        setUsers(usrArrCopy);
        return true;
    }

    return (
        <>
            <Box sx={{maxWidth:'70%', margin:'auto'}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box sx={{margin:'auto', textAlign:'center'}}>
                            <Typography variant="h4">
                                Admin Console
                            </Typography>
                        </Box>
                    </Grid>
                    {users.map((user) => {
                        const ButtonRemove = () => {
                            const [open, setOpen] = React.useState(false);
                            const handleClickOpen = () => {setOpen(true)};
                            const handleClose = () => {setOpen(false)};
                            const handleCloseWithFunction = (user_id: string) => {
                                if (handleRemoveUser(user_id)) setOpen(false);
                            };
                            return (
                                <Box key={"box" + Math.random().toString(36).slice(2)}>
                                    <Button variant="contained" color={"error"} onClick={handleClickOpen}>
                                    {"Remove User"}
                                    </Button>
                                    <Dialog
                                    open={open}
                                    TransitionComponent={Transition}
                                    keepMounted
                                    onClose={handleClose}
                                    aria-describedby="alert-dialog-slide-description"
                                    >
                                    <DialogTitle>{"Remove " + user.username + " as a user"}</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText id="alert-dialog-slide-description">
                                        {"Are you sure you want to remove " + user.username + " as a user?"}
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => handleClose()}>{"No"}</Button>
                                        <Button onClick={() => handleCloseWithFunction(user.user_id)}>{"Yes"}</Button>
                                    </DialogActions>
                                    </Dialog>
                                </Box>
                            )
                        }
                        const ButtonReports = () => {
                            const [open, setOpen] = React.useState(false);
                            const reports = user.reports.map((report) => {return ReportItem(report)});
                            const handleClickOpen = () => {setOpen(true)};
                            const handleClose = () => {setOpen(false)};
                            const ListObject = () => (
                                <Box sx={{ width: 300 }} role="presentation">{reports}</Box>
                            )
                            return (
                                <Box key={"box" + Math.random().toString(36).slice(2)}>
                                    <Tooltip title='View User Reports' followCursor={true}>
                                        <Button 
                                        variant="contained"
                                        color={"error"}
                                        onClick={handleClickOpen}
                                        disabled={user.reports.length === 0}>
                                        <Badge badgeContent={user.reports.length} overlap="rectangular">
                                            <ReportIcon/>
                                        </Badge>
                                        </Button>
                                    </Tooltip>
                                    <Dialog
                                    open={open}
                                    TransitionComponent={Transition}
                                    keepMounted
                                    onClose={handleClose}
                                    aria-describedby="reports-dialog-slide-description"
                                    >
                                    <DialogTitle>{user.username + "'s reports"}</DialogTitle>
                                    <DialogContent>
                                        <ListObject/>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => handleClose()}>{"Close"}</Button>
                                    </DialogActions>
                                    </Dialog>
                                </Box>
                            )
                        }
                        const currProfUrl = "http://localhost:3000/profile/" + user.user_id;
                        return (
                            <>
                            {gridBoxGen(5,typogLinkGen('body1',user.username, currProfUrl))}
                            {gridBoxGen(3,<ButtonReports/>)}
                            {gridBoxGen(3,<ButtonRemove/>)}
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
        return {username:item.username, user_id:item.user_id, reports: item.reports}
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

export async function postRemoveRequest (user_id: string) {
    const postData = JSON.stringify({token: getToken(), user_id: user_id})
    const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json'},
        body: postData
    };
    return httpFunc('http://localhost:6969/social/remove_user',requestOptions);
}