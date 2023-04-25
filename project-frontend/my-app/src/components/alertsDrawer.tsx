import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Drawer, Grid, IconButton, Link, Slide, TextField, TextFieldProps, Tooltip, Typography } from "@mui/material";
import { Fragment, useEffect, useRef, useState } from "react"
import { getUserId, getToken } from ".."
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { httpFunc } from "../functions";
import React from "react";
import { TransitionProps } from "@mui/material/transitions";

type requestObject = {
    sender_id: string,
    sender_username: string,
    receiver_id: string,
    receiver_username: string,
    message: string,
    request_id: string,
}

type paramObj = {
    title: string,
    content: string,
    request: requestObject
}

type alertArrayObject = {
    alerts: alertObject[]
}

export type alertObject = {
    alert_type: string,
    alert_id: number,
    params: paramObj
}

export const Transition = React.forwardRef(
    function Transition (
        props: TransitionProps & {
            children: React.ReactElement<any, any>;
        },
        ref: React.Ref<unknown>,
    ) {
        return <Slide direction="up" ref={ref} {...props} />
    }
);

export default function AlertsDrawer () {
    const [state, setState] = useState(false);
    const [alerts, setAlerts] = useState([] as JSX.Element | JSX.Element[])
    const [update, setUpdate] = useState(0);
    const toggleDrawer = (open: boolean) => {setState(open)};
    
    useEffect (() => {
        const fetchData = async () => {
            setAlerts(await alertsList(updateState));
        }
        fetchData();
    }, [update]);
    
    const updateState = () => {setUpdate(update + 1)}
    
    const ListObject = () => (
        <Box sx={{ width: 300 }} role="presentation">{alerts}</Box>
    )

    const openSidebar = async () => {
        setAlerts(await alertsList(updateState));
        toggleDrawer(true);
    }
    
    return (
        <Box>
            <Fragment>
                <Tooltip title="Open drawer" enterDelay={500} leaveDelay={200}>
                    <IconButton onClick={() => openSidebar()} sx={{ p: 0 }}>
                        <NotificationsIcon style={{color:'white'}}/>
                    </IconButton>
                </Tooltip>
                <Drawer
                    anchor='right'
                    open={state}
                    onClose={() => toggleDrawer(false)}
                >
                    <ListObject />
                </Drawer>
            </Fragment>
        </Box>
    );
}

const alertsList = async (parentUpdate: () => void) => {
    const alertsArray: alertArrayObject = await getAlertsArray(getUserId());
    if (alertsArray.alerts.length === 0) return noAlertsJsx();
    else return (
        <>
        <Box style={{maxHeight: '100%', overflow: 'auto'}}>
            {alertsArray.alerts.map((alert) => {return alertItem(alert, parentUpdate)})} 
        </Box>
        </>
    ) 
    
}

const noAlertsJsx = () => {
    return (
        <>
        <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
            <Typography variant="body1">There are no alerts</Typography>
        </Box>
        </>
    )
}

const alertItem = (alert: alertObject, parentUpdate: () => void) => {
    return (
        <div>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>{alert.params.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {alert.alert_type === 'connection_request' &&
                    RequestItem(alert, parentUpdate)
                }
                {alert.alert_type === 'request_accepted' &&
                    AcceptItem(alert)
                }
                {alert.alert_type === 'request_declined' &&
                    DeclineItem(alert)
                }
            </AccordionDetails>

          </Accordion>
        </div>
      );
}


// title, content
const DeclineItem = (alert: alertObject) => {

    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Typography variant="body1">
                        {alert.params.title}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2">
                        {alert.params.content}
                    </Typography>
                </Grid>
            </Grid>
        </>
    )

}

// title
const AcceptItem = (alert: alertObject) => {
    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Typography variant="body1">
                        {alert.params.title}
                    </Typography>
                </Grid>
            </Grid>
        </>
    )
}

const RequestItem = (alert: alertObject, parentUpdate: () => void) => {
    const senderUsername = alert.params.request.sender_username;
    const senderUserId = alert.params.request.sender_id;
    const requestId = alert.params.request.request_id;
    const message = alert.params.content;
    const senderProfileLink = <Link href={"/profile/"+senderUserId}>{senderUsername}</Link>;

    const handleAcceptUser = async () => {
        const acceptReturn = await postAcceptRequest(alert);
        if (acceptReturn !== '/error') {
            parentUpdate();
            return true;
        }
        return false;
    }

    const handleDeclineUser = async (msg: string) => {
        const declineReturn = await postDeclineRequest(alert, msg);
        if (declineReturn !== '/error') {
            parentUpdate()
            return true;
        }
        return false;
    }

    const ButtonDecline = () => {
        const declineMessage = useRef<TextFieldProps>(null);
        const [open, setOpen] = useState(false);
        const handleClickOpen = () => {setOpen(true)};
        const handleClose = () => {setOpen(false)};
        const handleCloseWithFunction = async (user_id: string) => {
            if (declineMessage.current) {
                if (await handleDeclineUser((declineMessage.current.value) as string)) setOpen(false);
            }
            
        };

        return (
            <Box key={"box" + Math.random().toString(36).slice(2)}>
                <Button variant="contained" color={"error"} onClick={handleClickOpen}>
                {"Decline"}
                </Button>
                <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                >
                <DialogTitle>{"Decline connection request?"}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <DialogContentText id="alert-dialog-slide-description">
                            {"Are you sure you want to decline " + senderUsername + "'s connection request?"}
                            </DialogContentText>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField inputRef={declineMessage} fullWidth multiline label="Decline Message" variant="outlined"/>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => handleClose()}>{"No"}</Button>
                    <Button variant="contained" color="error" onClick={() => handleCloseWithFunction(senderUserId)}>{"Yes"}</Button>
                </DialogActions>
                </Dialog>
            </Box>
        )
    }

    return (
        <>
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Typography variant="body1">
                    Connection Request from {senderProfileLink}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="body2">
                    {message}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Button onClick={() => handleAcceptUser()} variant="contained">Accept</Button>
            </Grid>
            <Grid item xs={6}>
                <ButtonDecline />
            </Grid>
        </Grid>
        </>
    )
}

async function getAlertsArray(userId: string) {
    if (!getToken()) return [];
    const data = await getAlertsData(userId);
    return data;
}

async function getAlertsData (userId: string) {
    const headerData = {
        'Content-Type'  :   'application/json',
        'token'         :   getToken(),
        'user_id'       :   userId
    }
    const requestOptions = {
        method: 'GET',
        headers: headerData,
    };
    return httpFunc("http://localhost:6969/user/get_alerts",requestOptions);
}

async function postAcceptRequest (alert: alertObject) {
    const header = {
        'Content-Type'  :   'application/json'
    }
    const body = JSON.stringify({
        'token'         :   getToken(),
        'alert_id'      :   alert.alert_id,
        'request_id'    :   alert.params.request.request_id
    })
    const requestOptions = {
        headers: header,
        method: 'POST',
        body: body,
    };
    return httpFunc("http://localhost:6969/user/accept_request",requestOptions);
}

async function postDeclineRequest (alert: alertObject, message: string) {
    const header = {
        'Content-Type'  :   'application/json'
    }
    const body = JSON.stringify({
        'token'         :   getToken(),
        'alert_id'      :   alert.alert_id,
        'request_id'    :   alert.params.request.request_id,
        'message'       :   message
    })
    const requestOptions = {
        headers: header,
        method: 'POST',
        body: body,
    };
    return httpFunc("http://localhost:6969/user/decline_request",requestOptions);
}