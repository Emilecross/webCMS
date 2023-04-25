import { Box, Button, Chip, Grid, IconButton, Stack, TextField, Typography } from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

import { getUserId } from '../index'
import { httpFunc, typogLinkGen } from "../functions";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BasicSelect from "../components/BasicSelect";

export default function Search() {
    return (
        <>
        <Box className="divBuffer">
            <Box className="mainBoxWidth">
                {SearchGrid()}
            </Box>
        </Box>
        </>
    );
}

type UserObject = {
    user_id: number,
    username: string
};

function SearchGrid() {
    const navigate = useNavigate();
    const choices = ["All", "Charities", "Sponsors"];
    const [choice, setChoice] = useState("All");
    const [query, setQuery] = useState("");
    const [needs, setNeeds] = useState([] as string[]);
    const [inputNeed, setInputNeed] = useState("");
    const [returnUsers, setReturnUsers] = useState([] as UserObject[]);
    const [loading, setLoading] = useState(false);

    const handleChoice = (choice: string) => {
        setChoice(choice);
    }

    const handleQuery = (event: React.ChangeEvent<any>) => {
        setQuery(event.target.value);
    }

    async function handleSearch() {
        const queryWords = query.split(" ");
        const header = {
            "Content-Type": "application/json",
            "words": queryWords,
            "needs": needs
        }
        const requestOptions = {
            method: "GET",
            headers: header
        }
        let url = "http://localhost:6969/search/search_all";
        if (choice == "Charities") url = "http://localhost:6969/search/search_charity";
        if (choice == "Sponsors") url = "http://localhost:6969/search/search_sponsor";
        setLoading(true);
        const result = await httpFunc(url, requestOptions);
        setLoading(false);
        setReturnUsers(result.users)
        return result;
    }

    const handleNeedChange = (event: React.ChangeEvent<any>) => {
        setInputNeed(event.target.value);
    }

    const addNeed = () => {
        if (inputNeed === "") return;
        setInputNeed("");
        const need = inputNeed;
        if (needs.includes(need)) return;
        let newArr = needs;
        newArr.push(need);
        setNeeds(newArr);
    }

    const deleteNeed = (needVal: string) => {
        setNeeds((needs) => needs.filter((need) => need != needVal));
    }

    const UserDisplay = () => {
        if (loading) {
            return (
                <Typography variant="h5">
                    LOADING
                </Typography>
            )
        }
        return (
            returnUsers.map((user) => {
                return (
                    typogLinkGen("h5", user.username, `http://localhost:3000/profile/${user.user_id}`)
                )
            })
        )
    }

    return (
        <>

        <Grid container spacing={2}>
            <Grid mt={5} item xs={4}>
                <Box>
                    <Typography variant="h5">
                        Add needs to search
                    </Typography>
                </Box>
                <TextField fullWidth value={inputNeed} onChange={handleNeedChange} label="Add a need to search" variant="outlined"/>
                <Stack direction={"row"} gap={1} flexWrap={"wrap"} spacing={1}>
                    {needs.map((need) => {
                        return <Chip label={need} onDelete={() => {deleteNeed(need)}}/>
                    })}
                </Stack>
                <Box sx={{margin: "auto"}}>
                    <Button onClick={addNeed} variant="contained" startIcon={<AddIcon/>}>Add Need</Button>
                </Box>
            </Grid>
            <Grid item xs={8}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box>
                            <Typography variant="h3">
                                Search for Users
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={3}>
                        <Box>
                            <BasicSelect label="Search for" choices={choices} onChange={handleChoice} value={choice}></BasicSelect>
                        </Box>
                    </Grid>
                    <Grid item xs={11}>
                        <Box>
                            <TextField fullWidth id="outlined-search" label="Search field" type="search" onChange={handleQuery} />
                        </Box>
                    </Grid>
                    <Grid item xs={1}>
                        <Box>
                            <IconButton size="large" onClick={handleSearch}>
                                <SearchIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>

                    </Grid>
                    <Grid item xs={12}>
                        {UserDisplay()}
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Box>
                    <Button 
                        variant="contained" 
                        startIcon={<ArrowBackIcon />}
                        onClick={()=>navigate('/profile/' + getUserId())}> 
                        Back to Profile
                    </Button>
                </Box>
            </Grid>
        </Grid>
        </>
    )
}