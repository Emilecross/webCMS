import { Box, Button, Grid } from "@mui/material"
import { NavigateFunction, useNavigate } from "react-router-dom"
import { getUserId } from "..";
import { gridBoxGen, typogItemGen } from "../functions";


export default function SuccessPage () {
    return (
        <>
        <Box className="divBuffer">
            <Box className="mainBoxWidth">
                <GetSuccessLayout />
            </Box>
        </Box>
        </>
    )
}

function GetSuccessLayout() {
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const successType = urlParams.get('type');
    let type        : string;
    let heading     : string;
    let body        : string;
    let buttonText  : string;
    let nav         : string;
    let isButton    : boolean;
    switch (successType) {
        case 'verify':
            type        = 'login';
            heading     = 'Verification Successful';
            body        = 'Please log into your account';
            buttonText  = 'Login';
            nav         = '/login';
            isButton    = true;
            return basicSuccessPage(type, heading, body, nav, buttonText, navigate, isButton);
        case 'register':
            type        = 'verify';
            heading     = 'Registration Successful';
            body        = 'Please check your email for a verification code and proceed to the verification page.';
            buttonText  = 'Verify';
            nav         = '/verify';
            isButton    = true;
            return basicSuccessPage(type, heading, body, nav, buttonText, navigate, isButton);
        case 'forgot_reset':
            type        = 'login';
            heading     = 'Password Reset Request Successful';
            body        = 'Please check your email for a reset link.';
            buttonText  = '';
            nav         = '';
            isButton    = false;
            return basicSuccessPage(type, heading, body, nav, buttonText, navigate, isButton);
        case 'reset_successful':
            type        = 'login';
            heading     = 'Password Reset Successful';
            body        = 'Please log into your account';
            buttonText  = 'Login';
            nav         = '/login';
            isButton    = true;
            return basicSuccessPage(type, heading, body, nav, buttonText, navigate, isButton);
        case 'blog_add':
            type        = 'blog';
            heading     = 'Blog Post Sucessful';
            body        = 'Your blog has been posted!';
            buttonText  = 'Back to my Profile';
            nav         = '/profile/' + getUserId();
            isButton    = true;
            return basicSuccessPage(type, heading, body, nav, buttonText, navigate, isButton);
        default:
            return <></>
    }
}

function basicSuccessPage (type: string, heading: string, body: string, nav: string, buttonText: string, navigate: NavigateFunction, isButton: boolean) {
    function onClickHandler () {
        navigate(nav);
    }
    return (
        <>
        <Box sx={{maxWidth:'50%',margin:'auto'}}>
        <Grid container spacing={1}>
            {gridBoxGen(12,typogItemGen("h4", heading))}
            {gridBoxGen(12,<></>)}
            {gridBoxGen(12,typogItemGen("body1", body))}
            {gridBoxGen(12,"")}
            {(isButton) ?
            gridBoxGen(12,<Button
                key={type + '-button'}
                fullWidth
                variant="contained"
                onClick={() => onClickHandler()}
                sx={{ mt: 3, mb: 2 , maxWidth: "30%"}}>
                {buttonText}
            </Button>) : <></>}
        </Grid>
        </Box>
        </>
    )
}
