import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BlogAddGrid from "../components/BlogAddGrid";
import { getUserId } from '../index';

export default function AddBlog() {
    const navigate = useNavigate();
    return (
        <>
        <Box className="divBuffer">
            <Box className="mainBoxWidth">
                {BlogAddGrid(navigate)}
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