import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getUserId } from '../index'
import { typogItemGen, typogLinkGen } from "../functions";
import { useEffect, useState } from "react";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import GetProfileData from "../components/getProfileData";

export type blogObject = {
    blog_id: string,
    title: string,
    content: string,
    authorId: string,
    author: string
}

type State = {
    username: string,
    userId: string,
    blogs: blogObject[]
}

const initialState = {
    username: '',
    userId: '',
    blogs: [] as blogObject[]
}

export default function Blog() {
    const [state, setState] = useState(initialState);
    const params = useParams();
    useEffect (() => {
        const fetchData = async () => {
            const id = params.id;
            if (id) {
                const data = await GetProfileData(id);
                setState({
                    username: data.userName,
                    userId: data.userId,
                    blogs: data.blogs
                })
            }
        }
        fetchData();
    }, [])

    return (
        <>
        <Box className="divBuffer">
            <Box className="mainBoxWidth">
                {BlogGrid(state)}
            </Box>
        </Box>
        </>
    );
}

function BlogGrid(values: State) {
    const navigate = useNavigate();
    return (
        <>
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box>
                            <Typography variant="h3">
                                {values.username}'s Blog
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box>
                            {generateBlogGrid(navigate, values.blogs)}
                        </Box>
                    </Grid>
                    {getUserId() === values.userId && <Grid item xs={3}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={()=>navigate('/add_blog')}>
                            Add Post
                        </Button>
                    </Grid>}
                    <Grid item xs={9}>
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

export function generateBlogGrid (navigate: NavigateFunction, blogs:blogObject[], numOfPosts?: number) {
    let printBlogs = blogs.slice();
    if (numOfPosts) printBlogs.length = numOfPosts;
    const returnArray = printBlogs.map((blog) => {
        return (
            <>
            <Grid item xs={12}>
                <Box>
                    {generateBlogCard(blog, navigate)}
                </Box>
            </Grid>
            </>
        )
    })
    return (
        <>
        <Grid container spacing={2}>
            {returnArray}
        </Grid>
        </>
    );
}

function generateBlogCard (blog: blogObject, navigate: NavigateFunction) {
    const currProfUrl = "http://localhost:3000/profile/" + blog.authorId;
    const blogCard = <>
        <Card variant="outlined" sx={{minWidth: "30vw"}}>
            <CardContent>
                {typogItemGen("h4", blog.title)}
                {typogLinkGen("body1",blog.author, currProfUrl)}
                {typogItemGen("body1",blog.content)}
                <Button onClick={() => {navigate(`/blog/${blog.authorId}/${blog.blog_id}`)}}>
                    View Blogpost
                </Button>
            </CardContent>
        </Card>
    </>


    return blogCard;
}

