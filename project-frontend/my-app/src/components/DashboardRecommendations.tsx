import React from 'react'
import { getToken } from '..'
import { gridBoxGen, httpFunc, typogLinkGen } from '../functions'
import { Chip, Grid, Stack, Typography } from '@mui/material'
import BasicSelect from './BasicSelect'

type Recommendation = {
  username: string,
  user_id: string,
  needs: string[]
}

const initialState = {
  is_charity: false,
  needs: [] as string[],
  recommendations: [] as Recommendation[],
  option: 'All',
  loading: false
}

export default function DashboardRecommendations() {
  const [state, setState] = React.useState(initialState)

  const handleChoice = async (choice: string) => {
    setState({
      ...state,
      option: choice
    })
  }

  const fetchRecommendations = async () => {
    setState({
      ...state,
      loading: true
    })
    const header = {
      'Content-Type': 'application/json',
      'token': getToken(),
      'option': state.option
    }
    const request = {
      method: 'GET',
      headers: header
    }
    const data = await httpFunc('http://localhost:6969/dashboard/get_recommendations', request);

    setState({
      ...state,
      loading: false,
      needs: data.needs,
      is_charity: data.is_charity,
      recommendations: data.recommendations
    })
  }

  const options = ['All', 'Lone', 'Connected']

  React.useEffect(() => {fetchRecommendations()}, [state.option]);

  const NeedsDisplay = (user: Recommendation) => {

    return (
      <Stack direction='row' gap={1} flexWrap='wrap' spacing={1}>
        {
          user.needs.map((need) => {
            return (
              <>
              {state.needs.includes(need) &&
                <Chip label={need} color='success' />
              }
              {!state.needs.includes(need) &&
                <Chip label={need} />
              }
              </>
            )
          })
        }
      </Stack>
    )

    
  }


  const UserDisplay = () => {
    return (
      <Grid container spacing={1}>
        {state.recommendations.map((user) => {
          return (
            <>
              {gridBoxGen(3, typogLinkGen('body1', user.username, `http://localhost:3000/profile/${user.user_id}`))}
              {gridBoxGen(8, NeedsDisplay(user))}
            </>
          )
        })}
      </Grid>
    )
  }


  return (
    <Grid container mt={3} spacing={2}>

      <Grid item xs={3}>
        <BasicSelect label="Recommendation Type" choices={options} onChange={handleChoice} value={state.option}></BasicSelect>
      </Grid>
      <Grid item xs={12}>
        {state.loading &&
          <Typography variant='h2'>
            LOADING...
          </Typography>
        }
        {!state.loading &&
          <>
          {state.needs.length != 0 && state.recommendations.length != 0 &&
            <>
              <Typography variant='h4'>
                {state.is_charity && <>Sponsors who can help with your needs</>}
                {!state.is_charity && <>Charities who could use your help</>}
              </Typography>
              <Grid>
                {UserDisplay()}
              </Grid>
            </>
          }
          {state.needs.length != 0 && state.recommendations.length == 0 &&
            <>
              <Typography variant='h4'>
                Sorry, none of your needs were found in our database
              </Typography>
            </>
          }
          {
            state.needs.length == 0 &&
            <>
              <Typography variant='h5'>
                Set some needs in your profile to receive recommendations
              </Typography>
            </>
          }
          </>
          
        }
      </Grid>
    </Grid>
  )
}