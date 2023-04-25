import { Box, Button, Chip, Grid, TextField, Typography } from "@mui/material"
import React, { Dispatch, useEffect, useState } from "react"
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Stack } from "@mui/system";
import { useNavigate } from "react-router-dom";
import {getToken} from '../index'
import { httpFunc } from "../functions";

type pageValues = {
    token: string,
    userId: string,
    userName: string,
    email: string,
    connections: number,
    accountType: string,
    needs: string[],
    permissions: number,
    isOwn: boolean
}

const initialPageValues: pageValues = {
    token: "",
    userId: "",
    userName: "",
    email: "",
    connections: 0,
    accountType: "",
    needs: [""],
    permissions: 0,
    isOwn: false
}

export default function Needs () {
    const [values, setValues] = useState(initialPageValues);
    useEffect (() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const currUserId = urlParams.has('user_id') ? urlParams.get('user_id')! : "";
        const fetchData = async () => {
            const receivedData = await getProfileData(currUserId);
            const formattedData = formatUserData(receivedData, currUserId);
            setValues(formattedData)
        }
        fetchData().catch(console.error);
    }, [])
    return (
        <>
        <Box className="divBuffer">
            <Box className="mainBoxWidth">
                {PageGrid(values, setValues)}
            </Box>
        </Box>
        </>
    )
}

function formatUserData ( data: any, _user_id: string): pageValues {
    const returnData = {
        token: getToken(),
        userId: _user_id,
        userName: data.username,
        email: data.email,
        connections: data.connections,
        accountType: (data.is_charity) ? "charity" : "sponsor",
        needs: (data.needs) ? data.needs : [],
        permissions: data.permissions,
        isOwn: data.is_own
    };
    return returnData;
}

type requestOptions = {
    method: string;
    headers: {
        'Content-Type': string;
    };
};

async function getProfileData (user_id: string) {
    const headerData = {
        'Content-Type'  :   'application/json',
        'token'         :   getToken(),
        'user_id'       :   user_id
    }
    const requestOptions: requestOptions = {
        method: 'GET',
        headers: headerData,
    };
    const url = 'http://localhost:6969/user/profile_data';

    const requestResponse = await httpFunc(url, requestOptions);
    return requestResponse;
}

async function addOrDeleteNeedsData (need: string, isDelete: boolean) {
    const postData = JSON.stringify({token: getToken(), need: need});
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: postData
    };

    const url = isDelete ? 'http://localhost:6969/user/remove_need' : 'http://localhost:6969/user/add_need'

    return httpFunc(url, requestOptions);
}

async function clearAllNeedsData (token: string) {
    const postData = JSON.stringify({token: getToken()});
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: postData
    };

    const url = 'http://localhost:6969/user/remove_all_needs';

    return httpFunc(url, requestOptions);
}

function PageGrid (values: pageValues, setValues: Dispatch<React.SetStateAction<pageValues>>) {
    const navigate = useNavigate();
    async function handleDeleteNeed (need: string) {
        let needsArr = values.needs;
        const index = needsArr.indexOf(need);
        const deleteReturn = await addOrDeleteNeedsData(need, true);
        if (deleteReturn !== '/error') {
            needsArr.splice(index, 1);
            setValues({...values,needs: needsArr})
        }
    }

    async function handleAddNeed () {
        const need =((document.getElementById('needsInput')) as HTMLInputElement).value;
        if (need === "") console.log('empty')
        else {
            let needsArr = values.needs;
            const addReturn = await addOrDeleteNeedsData(need, false);
            if (addReturn !== '/error') {
                needsArr.push(need);
                setValues({...values,needs: needsArr});
                ((document.getElementById('needsInput')) as HTMLInputElement).value = "";
            }
        }
    }

    async function handleClearNeed () {
        const clearReturn = await clearAllNeedsData(values.token);
        if (clearReturn !== '/error') {
            setValues({...values,needs: []})
        }
    }
    
    function handleClickNeed (need: string) {
    }

    return (
        <>
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Box>
                        <Typography variant="h3">
                            {values.userName}'s Needs List
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Stack direction={"row"} gap={1} flexWrap={"wrap"} spacing={1}>
                        {values.needs.map((need) => {
                            return (
                                <Chip label={need} onClick={()=> handleClickNeed(need)} onDelete={() => handleDeleteNeed(need)} />
                            )
                        })}
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{margin:'auto'}}>
                        <Button onClick={handleClearNeed} variant="contained" startIcon={<DeleteSweepIcon />}>Clear all needs</Button>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box>
                        <Typography variant="h5">
                            Add Needs Here
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={8}>
                    <Box>
                        <TextField fullWidth id="needsInput" label="Type need here" variant="outlined" />
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{margin:'auto'}}>
                        <Button onClick={handleAddNeed} variant="contained" startIcon={<AddIcon />}>Add Need</Button>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{margin:'auto'}}>
                        <Button onClick={()=>navigate(`/profile/${values.userId}`)} variant="contained" startIcon={<ArrowBackIcon />}>Back to Profile</Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>

        </>
    )
}