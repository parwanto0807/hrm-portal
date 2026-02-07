"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { User } from '@/types/auth';

export const STORAGE_KEYS = {
    // New format
    ACCESS_TOKEN: 'hrm_access_token',
    USER: 'hrm_user',
    // Legacy format (for backward compatibility)
    LEGACY_ACCESS_TOKEN: 'access_token',
    LEGACY_USER: 'user',
};

export const useAuth = () => {
    const router = useRouter();
    const [authState, setAuthState] = useState<{
        user: User | null;
        token: string | null;
        isLoading: boolean;
    }>({
        user: null,
        token: null,
        isLoading: true,
    });

    // Track if component is mounted
    const [isMounted, setIsMounted] = useState(false);
    const initRef = useRef(false);

    // Initialize auth HANYA setelah component mounted
    const initializeAuth = useCallback(() => {
        // CRITICAL: Jangan akses localStorage sebelum mounted
        if (!isMounted) return;

        // Prevent multiple initialization
        if (initRef.current) return;
        initRef.current = true;

        try {
            // Coba format baru dulu, jika tidak ada coba format lama
            let token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            let userStr = localStorage.getItem(STORAGE_KEYS.USER);

            // Jika tidak ada di format baru, coba format lama
            if (!token) {
                token = localStorage.getItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
                // Jika ada data lama, migrasikan ke format baru
                if (token) {
                    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
                    localStorage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
                }
            }

            if (!userStr) {
                userStr = localStorage.getItem(STORAGE_KEYS.LEGACY_USER);
                if (userStr) {
                    localStorage.setItem(STORAGE_KEYS.USER, userStr);
                    localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
                }
            }

            const user = userStr ? JSON.parse(userStr) : null;

            // if (process.env.NODE_ENV === 'development') {
            //     console.log('Auth initialized:', {
            //         tokenExists: !!token,
            //         userExists: !!user,
            //         storageKeysCount: Object.keys(localStorage).length
            //     });
            // }

            setAuthState({
                user,
                token,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error initializing auth:', error);
            setAuthState({
                user: null,
                token: null,
                isLoading: false,
            });
        }
    }, [isMounted]);

    // Effect 1: Set mounted flag
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 0);
        return () => {
            clearTimeout(timer);
            setIsMounted(false);
            initRef.current = false;
        };
    }, []);

    // Effect 2: Initialize auth setelah mounted
    useEffect(() => {
        if (!isMounted) return;

        const timer = setTimeout(() => initializeAuth(), 0);

        const handleStorageChange = () => {
            initRef.current = false;
            initializeAuth();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth-change', handleStorageChange);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-change', handleStorageChange);
        };
    }, [isMounted, initializeAuth]);

    const isAuthenticated = useCallback(() => {
        return !authState.isLoading && !!authState.token && !!authState.user;
    }, [authState.isLoading, authState.token, authState.user]);

    const getUser = useCallback(() => {
        return authState.user;
    }, [authState.user]);

    const isLoading = useCallback(() => {
        return authState.isLoading;
    }, [authState.isLoading]);

    const login = useCallback((user: User, accessToken: string) => {
        if (!isMounted) return;

        try {
            if (process.env.NODE_ENV === 'development') {
                console.log('Logging in with keys:', STORAGE_KEYS);
            }

            // Simpan dengan format baru
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

            // Hapus data lama jika ada
            localStorage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);

            setAuthState({
                user,
                token: accessToken,
                isLoading: false,
            });

            window.dispatchEvent(new Event('auth-change'));

            // Use replace instead of push for better UX
            router.replace('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
        }
    }, [isMounted, router]);

    const logout = useCallback(() => {
        if (!isMounted) return;

        try {
            // Hapus semua format localStorage yang mungkin ada
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);

            // Hapus key tambahan yang mungkin digunakan di komponen lain
            localStorage.removeItem('accessToken');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');

            // Reset state
            setAuthState({
                user: null,
                token: null,
                isLoading: false,
            });

            // Beritahu tab/window lain tentang perubahan auth
            window.dispatchEvent(new Event('auth-change'));

            // Redirect ke halaman login yang benar (Consistently use /auth/google if that's the main login)
            // Namun agar fleksibel, kita biarkan komponen pemanggil menangani redirect jika perlu,
            // atau kita tetapkan default ke /auth/google karena itu yang digunakan di LogoutButton sebelumnya.
            router.replace('/auth/google');
        } catch (error) {
            console.error('Logout error in useAuth:', error);
        }
    }, [isMounted, router]);

    const debug = useCallback(() => {
        if (!isMounted) {
            return {
                error: 'Not mounted yet',
                authState
            };
        }

        return {
            currentToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
            legacyToken: localStorage.getItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN),
            currentUser: localStorage.getItem(STORAGE_KEYS.USER),
            legacyUser: localStorage.getItem(STORAGE_KEYS.LEGACY_USER),
            allStorage: Object.keys(localStorage),
            authState,
            isMounted
        };
    }, [isMounted, authState]);

    return {
        isAuthenticated,
        getUser,
        isLoading,
        login,
        logout,
        debug,
        // Export mounted state untuk debugging
        isMounted,
    };
};