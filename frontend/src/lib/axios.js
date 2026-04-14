import axios from 'axios';

import setupMockAdapter from './mockApi';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://citizen-grievance-backend.vercel.app/',
});

// Always mock for POC demonstration
setupMockAdapter(api);

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
