import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, TextField, TextFieldProps, Typography } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import React from 'react'
import EditIcon from '@mui/icons-material/Edit';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import { ArrowForward, Category, PersonAddAlt, PostAdd, Campaign } from '@mui/icons-material';
import { Stack } from "@mui/system";
import { useNavigate, useParams } from "react-router-dom";
import BlockIcon from '@mui/icons-material/Block';
import CloudIcon from '@mui/icons-material/Cloud';
import {getToken, getUserId} from '../index'
import { httpFunc } from "../functions";
import GetProfileData, { initialProfilePageValues, profilePageValues } from "../components/getProfileData";
import { generateBlogGrid } from "./blog";
import { Transition } from "../components/alertsDrawer";
import SpinLoader from "../components/SpinLoader";

export default function Profile () {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [values, setValues] = useState(initialProfilePageValues);
    useEffect (() => {
        const fetchData = async () => {
            let userId = params.id;
            if (!userId) userId = '';
            // to demonstrate loader
            await new Promise(f => setTimeout(f, 1000));
            setValues(await GetProfileData(userId));
            setLoading(false);
        }
        fetchData().catch(console.error);
    }, [params.id])

    return (
        <>
            <Box className="divBuffer">
                <Box className="mainBoxWidth">
                    {UserPageGrid(values, setValues, values.userId, loading)}
                </Box>
            </Box>
        </>
    )
}

async function blockUser(isBlocked: boolean, blockee_id: string) {
    const putData = JSON.stringify({token: getToken(), user_id: blockee_id});
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: putData
    };
    const url = 'http://localhost:6969/social/' + (isBlocked ? 'unblock_user' : 'block_user');
    return httpFunc(url, requestOptions);
}

async function postReportRequest(target_id: string, reason: string) {
    const putData = JSON.stringify({token: getToken(), target_id: target_id, reason: reason});
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: putData
    };
    const url = 'http://localhost:6969/social/report_user';
    return httpFunc(url, requestOptions);
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

const postTranslateData = async (translateData: any) => {
    const header = {
      'Content-Type': 'application/json;charset=UTF-8'
    }
    const body = {
      token: getToken(),
      data: translateData
    }
    const requestOptions = {
      method: 'POST',
      headers: header,
      body: JSON.stringify(body)
    }
    const url = 'http://localhost:6969/translate/translate_data';
    return await httpFunc(url, requestOptions);
}

type connectionObj = {
    user_id: string,
    username: string,
    needs: string[]
}

function UserPageGrid (values: profilePageValues, setValues: React.Dispatch<React.SetStateAction<profilePageValues>>, user_id: string, loading: boolean) {
    const [requested, setRequested] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const [connections, setConnections] = useState([] as string[]);
    const params = useParams();
    const navigate = useNavigate();


    const fetchConnections = async () => {
        const header = {
            token: getToken(),
            'Content-Type': 'application/json'
        }
        const requestOptions = {
            headers: header,
            method: 'GET'
        }
        const data = await httpFunc('http://localhost:6969/dashboard/get_connections', requestOptions)
        const filteredConnections = data.connections.map((connection: connectionObj) => {
            return connection.user_id;
        })
        setConnections(filteredConnections);
    }

    React.useEffect(() => {fetchConnections()}, []);
    if (loading) return (<SpinLoader/>)
    const blockHandler = async (isBlocked: boolean, blockee_id: string) => {
        await blockUser(isBlocked, blockee_id);
    };
    const requestHandler = async (user_id: string) => {
        await postConnectRequest(user_id);
    };
    
    const reportHandler = async (reportee_id: string, reason: string) => {
        const response = await postReportRequest(reportee_id, reason);
        if (response !== '/error') {
            // implement mui snackbar decline request alert bottom right
            return true;
        }
        return false;
    };



    const handleTranslate = async () => {
        const translatedData = await postTranslateData({needs: values.needs, description: values.description});
        setValues({
            ...values,
            needs: translatedData.translation.needs,
            description: translatedData.translation.description
        }
        )
    }



    const ButtonReport = () => {
        const reportMessage = useRef<TextFieldProps>(null);
        const [open, setOpen] = useState(false);
        const handleClickOpen = () => {setOpen(true)};
        const handleClose = () => {setOpen(false)};
        const handleCloseWithFunction = async () => {
            if (reportMessage.current) {
                await reportHandler(user_id, reportMessage.current.value as string);
            } else {
                await reportHandler(user_id, "User did not specify a reason");
            }
            setOpen(false);
        };
        

        return (
            <Box key={"box" + Math.random().toString(36).slice(2)}>
                <Button variant="contained" color={"error"} onClick={handleClickOpen} startIcon={<Campaign/>}>
                    {"Report"}
                </Button>
                <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                >
                <DialogTitle>{`I am reporting ${values.userName} because`}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <TextField inputRef={reportMessage} fullWidth multiline label="Reason" variant="outlined"/>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="error" onClick={() => handleCloseWithFunction()}>{"Report"}</Button>
                    <Button variant="contained" onClick={() => handleClose()}>{"Cancel"}</Button>
                </DialogActions>
                </Dialog>
            </Box>
        )
    }
    
    return (
        <>
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Box>
                        {user_id === getUserId()
                        ? <Typography variant="h4">My Profile</Typography>
                        : <Typography style={{wordWrap: "break-word"}} variant="h4">{values.userName}'s Profile</Typography>}
                    </Box>
                    <Box>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Fab onClick={handleTranslate} variant="extended">
                                    <GTranslateIcon sx={{ mr: 1 }} />
                                    Translate
                                </Fab>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="body1">
                                    Connections:
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body1">
                                    {values.connections}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6">
                                    Description:
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    {values.description}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Stack direction={"row"} gap={1} flexWrap={"wrap"} spacing={1}>
                                    {values.needs.map((need) => {
                                        return (
                                            <Chip label={need} onClick={()=>{}} />
                                        )
                                    })}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                    {user_id !== getUserId()
                    ?<Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                            <Button variant="contained" startIcon={<Category />} onClick={()=>navigate('/needs?user_id='+ user_id)}>
                                View Needs
                            </Button>
                            </Grid>
                            {!(params.id != undefined && connections.includes(params.id)) && (
                                <Grid item xs={12}>
                                    <Button disabled={requested} 
                                            variant="contained" 
                                            startIcon={<PersonAddAlt />} 
                                            onClick={()=>{
                                                            requestHandler(user_id);
                                                            setRequested(!requested);
                                                        }}>
                                        {(requested) ? "Requested" : "Connect"}
                                    </Button>
                                </Grid>
                            )}
                            {params.id !== undefined && connections.includes(params.id) &&
                                <Grid item xs={12}>
                                    <Button variant="contained" startIcon={<CloudIcon />} onClick={()=>navigate('/files/'+ user_id)}>
                                        View Shared Files
                                    </Button>
                                </Grid> 
                            }
                            
                            <Grid item xs={12}>
                                <Button 
                                variant="contained"
                                startIcon={<BlockIcon />}
                                onClick={()=>{
                                            blockHandler(blocked, user_id);
                                            setBlocked(!blocked);
                                        }
                                    }>
                                    {(blocked) ? "Unblock" : "Block"}
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <ButtonReport />
                            </Grid>
                        </Grid>
                    </Box>
                    :<Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Button variant="contained" startIcon={<Category />} onClick={()=>navigate('/needs?user_id='+ user_id)}>
                                    View Needs
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" startIcon={<EditIcon />} onClick={()=>navigate('/update_profile')}>
                                    Edit Profile
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" startIcon={<PostAdd />} onClick={()=>navigate("/add_blog")}>
                                    Add Blog
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>}
                    
                </Grid>
                <Grid item xs={8}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box>
                                {user_id !== getUserId()
                                ?<Typography variant="h3">
                                    {values.userName}'s Blogs
                                </Typography>
                                :<Typography variant="h3">
                                    My Blog
                                </Typography>}
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box>
                                {generateBlogGrid(navigate,values.blogs,3)}
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Button variant="contained" startIcon={<ArrowForward />} onClick={()=>navigate('/blog/' + user_id)}>
                                View More
                            </Button>
                        </Grid>
                        <Grid item xs={7}>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>

        </>
    )
}
