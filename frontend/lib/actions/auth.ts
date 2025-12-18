// lib/auth.ts

// Hapus slash (//) di bawah jika sudah install 'js-cookie'
// import Cookies from 'js-cookie'; 

export const AUTH_TOKEN_KEY = 'accessToken';

export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
};

export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, token);

        // Opsional: Set cookie juga untuk Middleware
        // Cookies.set(AUTH_TOKEN_KEY, token, { expires: 7 }); 
    }
};

export const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_TOKEN_KEY);

        // Cookies.remove(AUTH_TOKEN_KEY);
    }
};

// Tambahan: Helper untuk cek status login dengan cepat
export const isAuthenticated = () => {
    const token = getToken();
    return !!token; // Mengembalikan true jika token ada, false jika null
};