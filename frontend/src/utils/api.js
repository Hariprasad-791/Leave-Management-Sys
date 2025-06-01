import axios from 'axios';

// Determine backend URL based on environment
const getBackendURL = () => {
    // In Docker, use the service name
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';
    }
    return '/api'; // Use nginx proxy in production
};

const API = axios.create({
    baseURL: getBackendURL(),
    timeout: 10000,
    withCredentials: true,
});

API.interceptors.request.use(
    (req) => {
        const token = localStorage.getItem('token');
        if (token) {
            req.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Making request to:', req.baseURL + req.url);
        return req;
    },
    (error) => {
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default API;
