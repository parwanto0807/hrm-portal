// src/lib/api.ts
import axios from "axios";

// Ganti dengan URL backend Express Anda
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // WAJIB: Agar cookie dikirim/diterima
});

// Opsional: Tambahkan interceptor jika nanti ada auth token
api.interceptors.request.use((config) => {
    // const token = ... logic ambil token
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});