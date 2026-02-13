"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { User } from '@/types/auth';
import { api } from '@/lib/api';

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

    const initializeAuth = useCallback(() => {
        console.log('useAuth: Initializing...');
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

            console.log('useAuth: Initialization complete. Token:', !!token, 'User:', !!user);
            setAuthState({
                user,
                token,
                isLoading: false,
            });
            if (token) {
                // Background fetch to update user data from server
                fetchProfile();
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    const fetchProfile = async () => {
        try {
            console.log('useAuth: Fetching profile from server using api client...');
            // PENTING: Gunakan 'api' instance agar interceptor jalan
            const { data: userData } = await api.get('/users/me');

            if (userData) {
                const currentUserStr = localStorage.getItem(STORAGE_KEYS.USER);
                const currentUser = currentUserStr ? JSON.parse(currentUserStr) : {};

                const updatedUser = {
                    ...currentUser,
                    ...userData,
                    name: userData.name
                };

                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

                if (JSON.stringify(currentUser) !== JSON.stringify(updatedUser)) {
                    console.log('🔄 useAuth: User profile updated from server');
                    setAuthState(prev => ({
                        ...prev,
                        user: updatedUser
                    }));
                }
            }
        } catch (e: any) {
            console.error('Failed to fetch profile:', e);
            if (e.response?.status === 401) {
                logout();
            }
        }
    };

    useEffect(() => {
        // Initialize immediately on mount
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

    const login = useCallback((user: User, accessToken: string) => {
        try {
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

            router.replace('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
        }
    }, [router]);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');

            setAuthState({
                user: null,
                token: null,
                isLoading: false,
            });

            window.dispatchEvent(new Event('auth-change'));
            router.replace('/auth/google'); // Or /login
        } catch (error) {
            console.error('Logout error in useAuth:', error);
        }
    }, [router]);

    const debug = useCallback(() => {
        return {
            currentToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
            legacyToken: localStorage.getItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN),
            currentUser: localStorage.getItem(STORAGE_KEYS.USER),
            legacyUser: localStorage.getItem(STORAGE_KEYS.LEGACY_USER),
            allStorage: Object.keys(localStorage),
            authState
        };
    }, [authState]);

    return {
        isAuthenticated,
        getUser,
        isLoading,
        login,
        logout,
        debug
    };
};