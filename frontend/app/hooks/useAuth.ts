"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
        user: any | null;
        token: string | null;
        isLoading: boolean;
    }>({
        user: null,
        token: null,
        isLoading: true,
    });

    const isBrowser = typeof window !== 'undefined';

    const initializeAuth = useCallback(() => {
        if (!isBrowser) {
            setAuthState({
                user: null,
                token: null,
                isLoading: false,
            });
            return;
        }

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

            console.log('Auth initialized:', {
                tokenExists: !!token,
                userExists: !!user,
                keysInStorage: Object.keys(localStorage)
            });

            setAuthState(prev => {
                if (prev.user === user && prev.token === token && !prev.isLoading) {
                    return prev;
                }
                return {
                    user,
                    token,
                    isLoading: false,
                };
            });
        } catch (error) {
            console.error('Error initializing auth:', error);
            setAuthState({
                user: null,
                token: null,
                isLoading: false,
            });
        }
    }, [isBrowser]);

    useEffect(() => {
        initializeAuth();

        const handleStorageChange = () => {
            initializeAuth();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth-change', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-change', handleStorageChange);
        };
    }, [initializeAuth]);

    const isAuthenticated = useCallback(() => {
        return !authState.isLoading && !!authState.token && !!authState.user;
    }, [authState.isLoading, authState.token, authState.user]);

    const getUser = useCallback(() => {
        return authState.user;
    }, [authState.user]);

    const isLoading = useCallback(() => {
        return authState.isLoading;
    }, [authState.isLoading]);

    const login = useCallback((user: any, accessToken: string) => {
        if (!isBrowser) return;

        console.log('Saving to localStorage with keys:', STORAGE_KEYS);

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
        router.push('/dashboard');
        router.refresh();
    }, [isBrowser, router]);

    const logout = useCallback(() => {
        if (!isBrowser) return;

        // Hapus semua format
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
        localStorage.removeItem('isAuthenticated');

        setAuthState({
            user: null,
            token: null,
            isLoading: false,
        });

        window.dispatchEvent(new Event('auth-change'));
        router.push('/login');
        router.refresh();
    }, [isBrowser, router]);

    return {
        isAuthenticated,
        getUser,
        isLoading,
        login,
        logout,
        debug: () => ({
            currentToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
            legacyToken: localStorage.getItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN),
            currentUser: localStorage.getItem(STORAGE_KEYS.USER),
            legacyUser: localStorage.getItem(STORAGE_KEYS.LEGACY_USER),
            allStorage: Object.keys(localStorage),
            authState
        })
    };
};