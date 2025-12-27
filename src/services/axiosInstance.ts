import axios from 'axios';

// 1. Get the current IP/Hostname from the browser's URL bar
const hostname = window.location.hostname; 

// 2. Set the Backend Port
const BACKEND_PORT = 5000;

// 3. Logic: If I am on localhost, use localhost. Otherwise, use the IP I'm currently on.
const BASE_URL = hostname === 'localhost' 
    ? `http://localhost:${BACKEND_PORT}` 
    : `http://${hostname}:${BACKEND_PORT}`;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;