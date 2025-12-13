"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function GoogleAuthHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleGoogleAuth = async () => {
            try {
                // Simulasi proses autentikasi Google
                setStatus('redirecting');

                // Ambil callback URL jika ada
                const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

                // Simulasi delay untuk autentikasi
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Redirect ke halaman dashboard atau callback URL
                router.push(callbackUrl);

            } catch (err) {
                setStatus('error');
                setError(err instanceof Error ? err.message : 'Authentication failed');
            }
        };

        handleGoogleAuth();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-sky-50 to-emerald-50 p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-sky-200 to-emerald-200 rounded-full blur-3xl opacity-30"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.4, 0.3]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center"
            >
                {/* Google Logo */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="mx-auto w-20 h-20 mb-6 flex items-center justify-center"
                >
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-yellow-500 to-green-500 rounded-full" />
                        <div className="absolute inset-2 bg-white rounded-full" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-10 h-10" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>
                    </div>
                </motion.div>

                {/* Status Messages */}
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-gray-900 mb-2"
                >
                    {status === 'loading' && 'Connecting to Google...'}
                    {status === 'redirecting' && 'Authentication Successful!'}
                    {status === 'error' && 'Authentication Failed'}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 mb-6"
                >
                    {status === 'loading' && 'Please wait while we connect to your Google account.'}
                    {status === 'redirecting' && 'Redirecting to your dashboard...'}
                    {status === 'error' && error}
                </motion.p>

                {/* Loading Animation */}
                {status !== 'error' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative w-16 h-16 mb-4">
                            {/* Outer spinning ring */}
                            <motion.div
                                className="absolute inset-0 border-4 border-sky-200 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />

                            {/* Inner pulsing circle */}
                            <motion.div
                                className="absolute inset-4 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.7, 1, 0.7]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            {/* Google icon inside */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                </svg>
                            </div>
                        </div>

                        {/* Animated dots */}
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-sky-400"
                                    animate={{
                                        y: [0, -5, 0],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        delay: i * 0.2
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Error State Actions */}
                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 space-y-3"
                    >
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Return to Home
                        </button>
                    </motion.div>
                )}

                {/* Security Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 text-xs text-gray-500"
                >
                    Secure connection • Your information is protected
                </motion.p>
            </motion.div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-sky-300/30"
                        style={{
                            left: `${(i * 12 + 5)}%`,
                            top: `${(i * 8 + 10)}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        </div>
    );
}