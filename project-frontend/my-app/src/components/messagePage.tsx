import { Avatar, Divider, Fab, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField, Typography } from '@mui/material'
import React from 'react'
import { httpFunc } from '../functions';
import { getToken } from '..';
import GTranslateIcon from '@mui/icons-material/GTranslate'
import SendIcon from '@mui/icons-material/Send';

type connection = {
  username: string,
  user_id: string
}

type returnedConnection = {
  user_id: string,
  username: string,
  needs: string[]
}

export default function MessagePage() {
  const [connections, setConnections] = React.useState([] as connection[]);
  const [selectedId, setSelectedId] = React.useState('');
  const [connectionsLoading, setConnectionsLoading] = React.useState(false);

  const fetchConnections = async () => {
    const header = {
      'Content-Type': 'application/json',
      'token': getToken()
    }
    const requestOptions = {
      method: 'GET',
      headers: header
    }
    const url = 'http://localhost:6969/dashboard/get_connections'
    setConnectionsLoading(true);
    const data = await httpFunc(url, requestOptions);
    setConnectionsLoading(false);
    const filteredData = data.connections.filter((connection: returnedConnection) => {
      return {
        username: connection.username,
        user_id: connection.user_id
      }
    })
    setConnections(filteredData);
  }

  const handleUserChoice = (user_id: string) => {
    setSelectedId(user_id);
  }

  React.useEffect(() => {fetchConnections()}, []);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          {!connectionsLoading &&
          <>
          <Typography variant='h6' textAlign='center'>
            Your Connections
          </Typography>
          <Divider />
          <List>
            {
            connections.map((connection) => {
              return (
                <ListItemButton onClick={() => handleUserChoice(connection.user_id)}>
                  <ListItemIcon>
                    <Avatar />
                  </ListItemIcon>
                  <ListItemText primary={connection.username} />
                </ListItemButton>
              )
            })
            }
          </List>
          </>
          }
        </Grid>
        <Grid item xs={9}>
          {selectedId.length !== 0 &&
            <MessageBox key={selectedId} user_id={selectedId} />
          }
        </Grid>
      </Grid>
    </>
  )
}

type messageProps = {
  user_id: string
}

type messageObject = {
  message_id: string,
  fromMe: boolean,
  timeSent: string,
  message: string
}

function MessageBox ({ user_id }: messageProps) {
  const [loading, setLoading] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [messages, setMessages] = React.useState([] as messageObject[]);
  const [shownMessages, setShownMessages] = React.useState([] as messageObject[]);
  const [inputMessage, setInputMessage] = React.useState('');

  const fetchMessages = async () => {
    const header = {
      token: getToken(),
      target_id: user_id
    }
    const requestOptions = {
      method: 'GET',
      headers: header
    }
    let url = 'http://localhost:6969/social/get_messages';
    setLoading(true);
    const data = await httpFunc(url, requestOptions);
    setLoading(false);
    setUsername(data.username);
    setMessages(data.messages);
  }

  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value);
  }

  const handleSend = () => {
    if (inputMessage.length === 0) return;
    const header = {
      'Content-Type': 'application/json;charset=UTF-8'
    }
    const body = {
      token: getToken(),
      target_id: user_id,
      content: inputMessage
    }
    const requestOptions = {
      method: 'POST',
      headers: header,
      body: JSON.stringify(body)
    }
    const url = 'http://localhost:6969/social/send_message';
    const data = httpFunc(url, requestOptions);
    setInputMessage('');
  }

  const handleTranslate = async (message_id: string, message_content: string) => {
    const header = {
      'Content-Type': 'application/json;charset=UTF-8'
    }
    const body = {
      token: getToken(),
      text: message_content
    }
    const requestOptions = {
      method: 'POST',
      headers: header,
      body: JSON.stringify(body)
    }
    const url = 'http://localhost:6969/translate/translate_text';
    const data = await httpFunc(url, requestOptions);
    
    const filteredMessages = shownMessages.map((message) => {
      if (message.message_id === message_id) {
        return {
          ...message,
          message: data.translation
        }
      }
      return message
    })

    setShownMessages(filteredMessages);
  }

  React.useEffect(() => {
    const newShown = [...shownMessages];
    while (newShown.length !== messages.length) {
      newShown.push(messages[newShown.length]);
    }
    setShownMessages(newShown);
  }, [messages])

  React.useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 500);
    return () => clearInterval(interval);
  }, [])

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant='h4'>
            {username}'s Messages
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <List sx={{maxHeight:'75vh', overflow:'auto'}}>
            {
              shownMessages.map((message) => {
                return (
                  <ListItem>
                    <Grid container>
                      {!message.fromMe &&
                      <Grid item xs={1}>
                        <IconButton onClick={() => handleTranslate(message.message_id, message.message)}>
                          <GTranslateIcon />
                        </IconButton>
                      </Grid>
                      }
                      <Grid item xs={11}>
                        <Grid container>
                          <Grid item xs={12}>
                            {message.fromMe && 
                              <ListItemText primaryTypographyProps={{align:"right"}} primary={message.message}></ListItemText>
                            }
                            {!message.fromMe && 
                              <ListItemText primaryTypographyProps={{align:"left"}}  primary={message.message}></ListItemText>
                            }
                          </Grid>
                        
                          <Grid item xs={12}>
                            {message.fromMe && (
                              <ListItemText secondaryTypographyProps={{align:"right"}} secondary={message.timeSent}></ListItemText>
                            )}
                            {!message.fromMe && (
                              <ListItemText secondaryTypographyProps={{align:"left"}} secondary={message.timeSent}></ListItemText>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                      {message.fromMe &&
                      <Grid item xs={1}>
                        <IconButton onClick={() => handleTranslate(message.message_id, message.message)}>
                          <GTranslateIcon />
                        </IconButton>
                      </Grid>
                      }
                    </Grid>
                    
                  </ListItem>
                )
              })
            }
          </List>
          <Divider />
          <Grid container spacing={2} style={{ padding: '20px' }}>
            <Grid item xs={11}>
              <TextField 
              label='Type Something'
              value={inputMessage}
              onChange={handleMessageChange}
              fullWidth
              />
            </Grid>
            <Grid item xs={1} alignContent='right'>
              <Fab color='primary' aria-label='add' onClick={handleSend}>
                <SendIcon />
              </Fab>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}