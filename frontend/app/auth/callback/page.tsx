// app/auth/callback/page.tsx
"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth(); // hook usage

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const accessToken = searchParams.get('accessToken');
                const refreshToken = searchParams.get('refreshToken');
                const userId = searchParams.get('userId');
                const success = searchParams.get('success');
                const error = searchParams.get('error');
                const email = searchParams.get('email');
                const name = searchParams.get('name');
                const image = searchParams.get('image');
                const role = searchParams.get('role');

                console.log('🔗 Auth callback received:', {
                    hasAccessToken: !!accessToken,
                    hasUserId: !!userId,
                    success,
                    email: email ? decodeURIComponent(email) : null
                });

                if (error) {
                    console.error('Auth callback error:', error);
                    router.push(`/login?error=${encodeURIComponent(error)}`);
                    return;
                }

                if (!accessToken || !success || !userId) {
                    console.error('Missing required parameters');
                    router.push('/login?error=missing_parameters');
                    return;
                }

                // Decode URL encoded values
                const decodedEmail = email ? decodeURIComponent(email) : '';
                const decodedName = name ? decodeURIComponent(name) : '';
                const decodedImage = image ? decodeURIComponent(image) : '';
                const decodedRole = role ? decodeURIComponent(role) : 'EMPLOYEE';

                // Construct User object matching type
                const userData = {
                    id: userId,
                    email: decodedEmail,
                    name: decodedName,
                    image: decodedImage,
                    role: decodedRole,
                    isActive: true // Assume active if login succeeded
                };

                // If refresh token exists, save it manually 
                // (login function in useAuth only takes user and access token currently)
                if (refreshToken) {
                    localStorage.setItem('refresh_token', refreshToken);
                    // Also set legacy key just in case
                    localStorage.setItem('refreshToken', refreshToken);
                }

                console.log('👤 Logging in via useAuth:', userData);

                // Call login from useAuth which handles storage, state, and redirect
                login(userData, accessToken);

            } catch (err) {
                console.error('Callback processing error:', err);
                router.push('/login?error=callback_error');
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-sky-600 mx-auto"></div>
                <p className="mt-6 text-lg font-semibold text-gray-800">Authenticating...</p>
                <p className="mt-2 text-sm text-gray-600">Please wait while we complete your login</p>
                <div className="mt-4 inline-flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                    <span>Securely processing your credentials</span>
                </div>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading authentication...</p>
                </div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}