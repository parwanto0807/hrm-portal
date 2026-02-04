// src/lib/api.ts
import axios from "axios";

// Ganti dengan URL backend Express Anda
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // WAJIB: Agar cookie dikirim/diterima
});

// Response Interceptor: Handle 401 & Auto Refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Jika error 401 dan belum pernah diretry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call Refresh Token Endpoint
                // Assumes BASE_URL points to /api, so this becomes /api/auth/refresh
                await api.post('/auth/refresh');

                // Retry Original Request
                return api(originalRequest);
            } catch (refreshError) {
                // Jika Refresh Token juga expired/invalid, redirect ke login
                console.error('Session expired, redirecting to login...');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);