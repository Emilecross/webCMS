import { Box, Button, Grid } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { getToken, getUserId } from "..";
import { gridBoxGen, httpFunc, typogItemGen } from "../functions";

async function logoutCurrentUser() {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({token: getToken()})
    };
    const url ='http://localhost:6969/auth/logout';
    return httpFunc(url, requestOptions);
}

export default function Logout() {
    const logoutHandler = () => {
        logoutCurrentUser();
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user_id");
        navigate('/');
    }

    const navigate = useNavigate();
    return (
        <>
        <Box sx={{maxWidth:'50%',margin:'auto'}}>
            <Grid container spacing={1}>
                {gridBoxGen(12,<></>)}
                {gridBoxGen(12,<></>)}
                {gridBoxGen(12,<></>)}
                {gridBoxGen(12,typogItemGen("h4", "Are you sure you want to logout?"))}
                {gridBoxGen(12,<></>)}
                <Box sx={{textAlign: 'center', maxWidth: "50%", margin: 'auto'}}>
                <Button 
                        variant="contained" 
                        fullWidth 
                        sx={{ mt: 3, mb: 2 , maxWidth: "51%"}}
                        onClick={()=>logoutHandler()}> 
                        Logout
                    </Button>
                    <Button 
                        variant="contained" 
                        fullWidth 
                        sx={{ mt: 3, mb: 2 , maxWidth: "70%"}}
                        onClick={()=>navigate('/profile/' + getUserId())}> 
                        Back to Profile
                    </Button>
                </Box>
            </Grid>
        </Box>
        </>
    )
}
