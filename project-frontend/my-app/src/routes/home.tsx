import React, { useEffect, useState } from "react";
import '../App.css';
import './main.css';
import { Button, Card, CardActions, CardContent, Container, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Carousel from "react-material-ui-carousel";

import { gridBoxGen, httpFunc, typogItemGen, typogLinkGen } from "../functions";

type sponsorObject = {
    name: string,
    connections: number,
    user_id: string
}

async function popData() {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    const url ='http://localhost:6969/populate_test_data';
    return httpFunc(url, requestOptions);
}

const initialSponsorValues: sponsorObject[] = [];

export default function Home () {
    const [sponsors, setSponsors] = useState(initialSponsorValues);
    useEffect (() => {
        const fetchData = async () => {
            const receivedData = await getTopSponsors();
            const formattedData = formatData(receivedData);
            setSponsors(formattedData);
        }
        fetchData().catch(console.error)
        
    }, [])

    const popDataHandler = async () => {
        const reqResponse = await popData();
    }

    return (
        <>
        <Box className="divBuffer">
            {/* <Box className="mainBoxWidth">
                <Grid item xs={12}>
                        {gridBoxGen(12,<Button
                                    fullWidth
                                    variant="contained"
                                    onClick={()=>popDataHandler()}
                                    sx={{ mt: 3, mb: 2 , maxWidth: "60%"}}>
                                    Populate data
                                </Button>)}
                </Grid>
            </Box> */}
            <br></br>
            <Box sx={{maxWidth:'70%', margin:'auto'}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box sx={{margin:'auto', textAlign:'center'}}>
                            <Typography variant="h4">
                                Top 10 Sponsors
                            </Typography>
                        </Box>
                    </Grid>
                    {sponsors.map((sponsor) => {
                        const currProfUrl = "http://localhost:3000/profile/" + sponsor.user_id;
                        return (
                            <>
                            {gridBoxGen(7,typogLinkGen('body1',sponsor.name,currProfUrl))}
                            {gridBoxGen(3,typogItemGen('body1',String(sponsor.connections)))}
                            </>
                        )
                    })}
                </Grid>
            </Box>
        </Box>
        </>
    )
}

type dataObject = {
    sponsors: sponsorObject[]
}

function formatData(data:dataObject): sponsorObject[] {
    const returnData: sponsorObject[] = data.sponsors.map((item) => {
        return {name:item.name, connections:item.connections, user_id:item.user_id}
    })
    return returnData;
}

async function getTopSponsors () {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    };
    return (httpFunc("http://localhost:6969/user/top_ten_sponsors",requestOptions))
}

function MainCarousel () {
    var items = [
        {
            name: "Random Name #1",
            description: "Probably the most random thing you have ever seen!"
        },
        {
            name: "Random Name #2",
            description: "Hello World!"
        },
        {
            name: "Random Name #3",
            description: "Hello World Again!"
        }
    ]

    return (
        <Container sx={{ maxWidth: 275 }}>
            <Carousel>
                {items.map((item, i) => {
                    return (
                        <>
                            <Card variant="outlined">{createCard(item.name,item.description,i+1)}</Card>
                        </>
                    )
                })}
            </Carousel>
        </Container>
    )
}

function createCard (name:string, description: string, iter: number) {
    return (
        <React.Fragment>
            <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Card #{iter}
            </Typography>
            <Typography variant="h5" component="div">
                {name}
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                Secondary Text
            </Typography>
            <Typography variant="body2">
                {description}
            </Typography>
            </CardContent>
            <CardActions>
            <Button size="small">Learn More</Button>
            </CardActions>
        </React.Fragment>
    );
}