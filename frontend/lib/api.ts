// src/lib/api.ts
import axios from "axios";

// Ganti dengan URL backend Express Anda
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://solusiit.id/api";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // WAJIB: Agar cookie dikirim/diterima
});

// Response Interceptor: Handle 401 & Auto Refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 1. Jika ini request ke /auth/refresh dan GAGAL, jangan retry!
        // Ini adalah kunci agar tidak looping tak terbatas.
        if (originalRequest.url?.includes('/auth/refresh')) {
            isRefreshing = false;
            processQueue(error, null);

            // Redirect ke login jika refresh token expire/invalid
            if (typeof window !== 'undefined') {
                console.error('Session expired globally, redirecting to login...');

                // Clear all auth data to prevent looping
                localStorage.removeItem('hrm_access_token');
                localStorage.removeItem('hrm_user');
                localStorage.removeItem('isAuthenticated');
                // Legacy keys
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');

                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        // 2. Jika error 401 dan bukan request ke /auth/refresh
        if (error.response?.status === 401 && !originalRequest._retry) {

            if (isRefreshing) {
                // Jika sedang ada refresh lain berjalan, masukkan ke antrian
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call Refresh Token Endpoint
                await api.post('/auth/refresh');

                isRefreshing = false;
                processQueue(null, 'success');

                // Retry Original Request
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);

                // Redirection is handled above in step 1 logic
                return Promise.reject(refreshError);
            }
        }

        // 3. Handle 403 Forbidden (Token Expired or Invalid) from Backend
        if (error.response?.status === 403) {
            if (typeof window !== 'undefined') {
                console.error('Access forbidden (403), redirecting to login...');

                // Clear all auth data
                localStorage.removeItem('hrm_access_token');
                localStorage.removeItem('hrm_user');
                localStorage.removeItem('isAuthenticated');
                // Legacy keys
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');

                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);