import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

declare global {
interface Window {
    token: string,
    user_id: string
}
}

export const getToken = (): string => {
    if (sessionStorage.getItem('token')) return sessionStorage.getItem('token')!;
    return "";
} 
export const setToken = (newToken: string) => sessionStorage.setItem('token',newToken);

export const getUserId = (): string => {
    if (sessionStorage.getItem('user_id')) return sessionStorage.getItem('user_id')!;
    return "";
}
export const setUserId = (newUserId: string) => sessionStorage.setItem('user_id',newUserId);

export let token = window.token;

token = "";

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root'),
);
