import React from "react";
import logo from '../logo.svg';
import '../App.css';


export default function NoMatch () {
    return (
        <>
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                Sorry no page was found on this URL.
                </p>
            </header>
        </div>
        </>
    )
}