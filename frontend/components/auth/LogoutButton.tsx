// components/LogoutButton.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '../ui/button';

interface LogoutButtonProps {
    variant?: 'default' | 'icon' | 'text' | 'destructive' | 'ghost';
    className?: string;
    children?: React.ReactNode;
    onLogout?: () => void;
}

export default function LogoutButton({
    variant = 'default',
    className = '',
    children,
    onLogout
}: LogoutButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { getUser } = useAuth();
    const user = getUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const handleLogout = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

            // Call backend logout endpoint
            await fetch(`${backendUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            // Clear local storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');

            // Call optional callback
            if (onLogout) onLogout();

            // Redirect to login page
            router.push('/auth/google');
            router.refresh(); // Refresh untuk update auth state

        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local storage even if backend call fails
            localStorage.clear();
            router.push('/auth/google');
        } finally {
            setLoading(false);
        }
    };

    // Variant styles
    const variantStyles = {
        default: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors",
        icon: "p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors",
        text: "text-red-600 hover:text-red-800 font-medium hover:underline transition-colors",
        destructive: "px-4 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors rounded-lg"
    };

    return (
        <Button
            onClick={handleLogout}
            disabled={loading}
            className={`${variantStyles[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
            title={mounted ? `Logout ${user?.name || user?.email || ''}` : 'Logout'}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {variant !== 'icon' && 'Logging out...'}
                </span>
            ) : children || (
                <>
                    {variant === 'icon' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    ) : (
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </span>
                    )}
                </>
            )}
        </Button>
    );
}