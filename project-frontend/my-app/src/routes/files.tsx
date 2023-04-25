import React from 'react'
import { useParams } from 'react-router-dom'
import { getToken } from '..';
import { httpFunc } from '../functions';
import { Button, Grid, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

type fileObj = {
  filename: string,
  file_id: number
}

const initialState = {
  username: '',
  files: [] as fileObj[],
  loading: false
}

export default function Files() {
  const params = useParams();
  const [file, setFile] = React.useState<File>();
  const [state, setState] = React.useState(initialState);


  const fetchFiles = async () => {
    setState({
      ...state,
      loading: true
    })
    const header = {
      token: getToken(),
      partner_id: params.userid
    }
    const options = {
      headers: header,
      method: 'GET'
    }
    const data = await httpFunc('http://localhost:6969/files/get_files', options);
    /*
    data comes in as
    {
      username: partners_username,
      files: [{filename: fname, file_id: fid}]
    }
    */
    setState({
      ...state,
      username: data.username,
      files: data.files
    })
  }

  React.useEffect(() => {fetchFiles()}, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(undefined);
    if (!e.target.files) return;
    let file = e.target.files[0];
    setFile(file);
  }

  const uploadFile = async () => {
    if (file === undefined) return;
    const formData = new FormData();
    formData.append('file', file);

    const header = {
      token: getToken(),
      partner_id: params.userid
    }
    const options = {
      headers: header,
      method: 'POST',
      body: formData
    }
    httpFunc('http://localhost:6969/files/upload_file', options);
    fetchFiles();
  }

  const downloadFile = async (file_id: number) => {
    const header = {
      token: getToken(),
      partner_id: params.userid,
      file_id: file_id
    }
    const options = {
      headers: header,
      method: 'GET'
    }
    const response = await fetch('http://localhost:6969/files/download_file', options as any)
    const filename = response.headers.get('file_name')
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || '';
    link.click();    
  }

  const deleteFile = async (file_id: number) => {
    const body = {
      token: getToken(),
      partner_id: params.userid,
      file_id: file_id
    }
    const options = {
      headers: { 'Content-Type': 'application/json' },
      method: 'DELETE',
      body: JSON.stringify(body)
    }
    await httpFunc('http://localhost:6969/files/delete_file', options);
    fetchFiles();
  }

  return (
    <Grid
      container
      spacing={0}
      direction='column'
      alignItems='center'
      justifyContent='center'
    >
      {state.loading &&
        <Typography>
          LOADING...
        </Typography>
      }
      {!state.loading &&
      <>
        <Typography variant='h4'>
          Your shared folder with {state.username}
        </Typography>
        <input type='file' name='uploadFile' onChange={handleFileChange} />
        <Button onClick={uploadFile}>
          Submit
        </Button>
        {state.files.length == 0 &&
          <Typography>
            No files in this folder
          </Typography>
        }
        {state.files.length != 0 &&
          <List>
            {
              state.files.map((file) => {
                return (
                  <ListItem
                    sx={{pr: 15}}
                    secondaryAction={
                      <>
                        <IconButton edge='end' onClick={() => {downloadFile(file.file_id)}}>
                          <DownloadIcon />
                        </IconButton>
                        <IconButton edge='end' onClick={() => {deleteFile(file.file_id)}}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText primary={file.filename} />
                  </ListItem>
                )
                
              })
            }
          </List>
        }
        </>
      }
    </Grid>
  )
}