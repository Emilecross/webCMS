import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import React, { FC } from "react";

interface MyProps {
    handleDialogConfirm: (blogTitle: string, blogContent: string) => void,
    blogTitle: string,
    blogContent: string
}

const BlogDialog: FC<MyProps> = ({ blogTitle, blogContent, handleDialogConfirm }) => {
    const [open, setOpen] = React.useState(false);
    const [state, setState] = React.useState({blogTitle: blogTitle || '', blogContent: blogContent || ''});
  
    const handleClickOpen = () => {
      setState({
        ...state,
        blogTitle: blogTitle,
        blogContent: blogContent
      });
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setState({
        ...state,
        [e.target.id]: e.target.value
      })
    }
  
    const handleConfirm = () => {
      handleDialogConfirm(state.blogTitle, state.blogContent);
      handleClose();
    }
  
    return (
        <>
        <Button onClick={handleClickOpen}>
          Edit Details
        </Button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Edit Details</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter the new blog title and content below.
            </DialogContentText>
            <TextField
              autoFocus
              margin='dense'
              id='blogTitle'
              label='Title'
              type='text'
              defaultValue={state.blogTitle}
              fullWidth
              variant='standard'
              onChange={handleChange}
            />
            <TextField
              margin='dense'
              id='blogContent'
              label='Content'
              type='text'
              defaultValue={state.blogContent}
              fullWidth
              variant='standard'
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogActions>
        </Dialog>
      </>
    );    
}

export default BlogDialog;