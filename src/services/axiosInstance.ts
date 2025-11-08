import axios from 'axios';

// 1. Get the current IP/Hostname from the browser's URL bar
const hostname = window.location.hostname;

// 2. Set the Backend Port (Matches backend/index.js default)
const BACKEND_PORT = 5000;

// 3. Logic: Automatically point to the backend on the SAME IP/Host as the frontend
// This ensures that if you access via localhost, 127.0.0.1, or a Network IP, it just works.
export const BASE_URL = `http://${hostname}:${BACKEND_PORT}`;


const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('[Axios Interceptor] Token from localStorage:', token ? '✅ Token exists' : '❌ No token');
        console.log('[Axios Interceptor] Request URL:', config.url);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[Axios Interceptor] Authorization header set');
        } else {
            console.warn('[Axios Interceptor] No token found for request:', config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;