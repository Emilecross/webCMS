import { Chip, Divider, Grid, Typography } from "@mui/material"
import { Box, Stack } from "@mui/system"
import { useEffect, useState } from "react"
import { getToken } from ".."
import { httpFunc } from "../functions"
import { Link } from "react-router-dom"
import DashboardRecommendations from "../components/DashboardRecommendations"
import SpinLoader from "../components/SpinLoader"

type dashUsrObj = {
    user_id: number,
    username: string,
    needs: string[]
}

export type dashObj = {
    our_needs: string[],
    connections: dashUsrObj[]
}

const initialDashValues: dashObj = {
    our_needs: [],
    connections: []
}

export default function Dashboard () {
    const [values, setValues] = useState(initialDashValues);
    const [loading, setLoading] = useState(true);

    useEffect (() => {
        const fetchData = async () => {
            const receivedData = await getDashData();
            const formattedData = formatUserData(receivedData);
            setValues(formattedData)
            setLoading(false);
        }
        fetchData().catch(console.error);
    }, [])

    return (
        <>
        <Box className="divBuffer">
            <Box className="mainBoxWidth">
                {dashboardGrid(values, setValues, loading)}
            </Box>
        </Box>
        </>
    )
}

function formatUserData (data: any): dashObj {
    const returnData: dashObj = {
        our_needs: data.our_needs,
        connections: data.connections
    }
    return returnData;
}

type requestOptions = {
    method: string;
    headers: {
        'Content-Type': string;
    };
};

async function getDashData () {
    const headerData = {
        'Content-Type'  :   'application/json',
        'token'         :   getToken(),
    }
    const requestOptions: requestOptions = {
        method: 'GET',
        headers: headerData,
    };
    const url = 'http://localhost:6969/dashboard/get_connections';

    const requestResponse = await httpFunc(url, requestOptions);
    return requestResponse;
}

function dashboardGrid (values: dashObj, setValues: React.Dispatch<React.SetStateAction<dashObj>>, loading: boolean) {

    if (loading) return (<SpinLoader/>)
    return (
        <>
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h4">
                        Your Needs
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Stack direction={"row"} gap={1} flexWrap={"wrap"} spacing={1}>
                        {values.our_needs.map((need) => {
                            return (
                                <Chip label={need} onClick={()=> {}/*handleClickNeed(need)*/} />
                            )
                        })}
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h4">
                        Connections
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Stack direction={"row"} gap={1} flexWrap={"wrap"} spacing={1}>
                        <Grid container spacing={2}>
                            <Grid item xs={2}>
                                <Typography variant="body1">
                                    Username
                                </Typography>
                            </Grid>
                            <Grid item xs={10}>
                                <Typography variant="body1">
                                    Needs
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            {values.connections.map((conn) => {
                                return (
                                    <>
                                    <Grid item xs={2}>
                                        <Box>
                                            <Link to={"/profile/" + conn.user_id}>{conn.username}</Link>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={10}>
                                        <Box>
                                            <Grid container spacing={2}>
                                                {conn.needs.map((need) => {
                                                    return (
                                                        <>
                                                        {values.our_needs.includes(need) &&
                                                            <Grid item xs={1.5}>
                                                                <Chip label={need} color='success' />
                                                            </Grid>
                                                        }
                                                        {!values.our_needs.includes(need) &&
                                                            <Grid item xs={1.5}>
                                                                <Chip label={need} />
                                                            </Grid>
                                                        }
                                                        </>
                                                    )
                                                })}
                                            </Grid>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider />
                                    </Grid>
                                    </>
                                )
                            })}
                        </Grid>
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <DashboardRecommendations/>
                </Grid>
            </Grid>
        </Box>
        </>
    )
}