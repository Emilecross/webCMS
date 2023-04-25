import React from "react";
import logo from '../logo.svg';
import '../App.css';
import { Button } from "@mui/material";

import {getToken, setToken} from '../index'

export default function About () {
    return (
        <>
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                About This Page
                </p>
                <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
                >
                Learn React
                </a>
            </header>
        </div>

        <Button 
            variant="contained" 
            fullWidth 
            sx={{ mt: 3, mb: 2 , maxWidth: "51%"}}
            onClick={()=>console.log(getToken())}> 
            Print 
        </Button>
        <Button 
            variant="contained" 
            fullWidth 
            sx={{ mt: 3, mb: 2 , maxWidth: "51%"}}
            onClick={()=>{setToken('15937820')}}> 
            Print 
        </Button>

        </>
    )
}

