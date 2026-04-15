import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Ensure it ends with /api/
const baseURL = rawApiUrl.replace(/\/+$/, '') + (rawApiUrl.includes('/api') ? '/' : '/api/');

const api = axios.create({
    baseURL: baseURL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
