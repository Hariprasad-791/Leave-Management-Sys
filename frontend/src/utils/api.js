import axios from 'axios';

const API = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
        ? '/api' 
        : 'http://localhost:5000/api',
    timeout: 10000,
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        
        // Ensure we're rejecting with an Error object
        const errorToReject = error instanceof Error ? error : new Error(String(error));
        return Promise.reject(errorToReject);
    }
);

export default API;
