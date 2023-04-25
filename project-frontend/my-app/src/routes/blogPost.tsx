import { Button, Fab, Grid, Typography } from "@mui/material";
import React from "react";
import { useNavigate, useParams } from "react-router-dom"
import { getToken, getUserId } from "..";
import { httpFunc } from "../functions";
import BlogDialog from "../components/BlogDialog";
import GTranslateIcon from '@mui/icons-material/GTranslate';

const initialState = {
  blogAuthor: '',
  blogTitle: '',
  blogContent: '',
  loading: false
}

export default function BlogPost() {
  const [state, setState] = React.useState(initialState);
  const params = useParams();
  const navigate = useNavigate();
  
  const fetchBlog = async () => {
    setState({
      ...state,
      loading: true
    });

    const header = {
      'Content-Type'  :   'application/json',
      'token'         :   getToken(),
      'user_id'       :   params.userid,
      'blog_id'       :   params.blogid
    };
    const request = {
      method: 'GET',
      headers: header
    }
    const data = await httpFunc('http://localhost:6969/user/get_blog', request);
  
    setState({
      ...state,
      loading: false,
      blogTitle: data.title,
      blogContent: data.content,
      blogAuthor: data.author
    })

  }

  React.useEffect(() => {fetchBlog()}, []);
  

  const handleDialog = async (blogTitle: string, blogContent: string) => {
    const body = {
      token: getToken(),
      title: blogTitle,
      content: blogContent,
      blog_id: params.blogid
    }
    const header = {
      'Content-Type'  :   'application/json',
    }

    const requestOptions = {
      method: 'PUT',
      headers: header,
      body: JSON.stringify(body)
    }

    const data = await httpFunc('http://localhost:6969/user/edit_blog', requestOptions);
    fetchBlog();
  }

  const handleDelete = async () => {
    const body = {
      token: getToken(),
      blog_id: params.blogid
    }
    const header = {
      'Content-Type': 'application/json'
    }
    const requestOptions = {
      method: 'DELETE',
      headers: header,
      body: JSON.stringify(body)
    }
    const data = await httpFunc('http://localhost:6969/user/remove_blog', requestOptions);
    navigate(`/blog/${params.userid}`);
  }

  const handleTranslate = async (text: string, title: string) => {
    const header = {
      'Content-Type': 'application/json;charset=UTF-8'
    }
    const body = {
      token: getToken(),
      data: {blogContent: text, blogTitle: title}
    }
    const requestOptions = {
      method: 'POST',
      headers: header,
      body: JSON.stringify(body)
    }
    const url = 'http://localhost:6969/translate/translate_data';
    const returnedData = await httpFunc(url, requestOptions);
    setState({
      ...state,
      blogContent: returnedData.translation.blogContent,
      blogTitle: returnedData.translation.blogTitle
    })
  }


  return (
    <>
      {
        state.loading &&
        <Typography variant='h2' textAlign='center'>
          LOADING...
        </Typography>
      }
      {
        !state.loading &&
        <>
          <Grid 
            container 
            paddingTop={3}
            paddingLeft={3}
            paddingRight={3}
            alignItems='center'
            spacing={0}
            direction='column'
            justifyContent='center'  
          >
            <Grid item>
              <Typography variant='h4' textAlign='center'>
                {state.blogTitle}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='h6' textAlign='left'>
                By {state.blogAuthor}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='h6' textAlign='center'>
                {state.blogContent}
              </Typography>
            </Grid>
            {
              getUserId() == params.userid &&
              <Grid item>
                <BlogDialog blogTitle={state.blogTitle} blogContent={state.blogContent} handleDialogConfirm={handleDialog} />
                <Button onClick={handleDelete} color='error'>
                  Delete
                </Button>
                
              </Grid>
            }
          </Grid>
          <Grid container 
            paddingTop={3}
            paddingLeft={3}
            paddingRight={3}
            alignItems='center'
            spacing={0}
            direction='column'
            justifyContent='center'  
          >
            <Grid item xs={12}>
                <Fab onClick={() => handleTranslate(state.blogContent, state.blogTitle)} variant="extended">
                    <GTranslateIcon sx={{ mr: 1 }} />
                    Translate
                </Fab>
            </Grid>
          </Grid>
        </>
      }
    </>
  )
}