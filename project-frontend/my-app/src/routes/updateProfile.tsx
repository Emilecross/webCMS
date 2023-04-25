import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DescriptionUpdateGrid from "../components/DescriptionUpdateGrid";
import EmailUpdateGrid from "../components/EmailUpdateGrid";
import GetProfileData, { initialProfilePageValues } from "../components/getProfileData";
import PasswordUpdateGrid from "../components/PasswordUpdateGrid";
import UsernameUpdateGrid from "../components/UsernameUpdateGrid";
import {getUserId} from '../index';

export default function UpdateProfile () {
    const [values, setValues] = useState(initialProfilePageValues);
    useEffect (() => {
        const fetchData = async () => {
            setValues(await GetProfileData(getUserId()));
        }
        fetchData().catch(console.error);
    }, [])

    const navigate = useNavigate();
    return (
        <>
        <Box className="divBuffer">
            <Box className="mainBoxWidth">
                {EmailUpdateGrid(navigate)}
                {UsernameUpdateGrid(navigate)}
                {DescriptionUpdateGrid(navigate, values.description)}
                {PasswordUpdateGrid(navigate)}
                <br></br>
                <Box sx={{textAlign: 'center', maxWidth: "50%", margin: 'auto'}}>
                    <Button 
                        variant="contained" 
                        fullWidth 
                        sx={{ mt: 3, mb: 2 , maxWidth: "51%"}}
                        onClick={()=>navigate('/profile/' + getUserId())}> 
                        Back to Profile
                    </Button>
                </Box>
            </Box>
        </Box>
        </>
    )
}