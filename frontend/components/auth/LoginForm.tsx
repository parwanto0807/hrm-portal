"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { setToken } from '@/lib/auth';

interface LoginFormProps {
    onSuccess?: () => void;
    showGoogleLogin?: boolean;
    redirectPath?: string;
    compact?: boolean;
}

export default function LoginForm({
    onSuccess,
    showGoogleLogin = true,
    redirectPath = '/dashboard',
    compact = false
}: LoginFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams(); // 1. Hook untuk baca URL params

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Gunakan suffix unik untuk ID agar tidak bentrok
    const idSuffix = compact ? 'mobile' : 'desktop';

    // 2. LOGIC BARU: Tangani Error dari URL (Google Redirect)
    useEffect(() => {
        const errorType = searchParams.get('error');

        if (errorType === 'cancelled') {
            setError('Login Google dibatalkan oleh pengguna.');
        } else if (errorType === 'google_auth_failed') {
            setError('Gagal login dengan Google. Silakan coba lagi.');
        } else if (errorType === 'callback_processing_error') {
            setError('Terjadi kesalahan saat memproses data login.');
        } else if (errorType === 'missing_tokens') {
            setError('Gagal mendapatkan akses token.');
        }

        // Opsional: Bersihkan URL agar parameter error hilang (agar bersih)
        if (errorType) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    // Handler Google Login - Redirect ke Backend OAuth
    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        // Redirect ke backend OAuth endpoint
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
        window.location.href = `${backendUrl}/api/auth/google`;
    };

    // Handler Login Email/Password
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.email || !formData.password) {
                throw new Error('Please fill in all fields');
            }

            // Panggil backend API untuk login
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

            const response = await fetch(`${backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Simpan token
            if (data.tokens) {
                setToken(data.tokens.accessToken);
                localStorage.setItem('refresh_token', data.tokens.refreshToken);
            }

            if (onSuccess) onSuccess();
            router.push(redirectPath);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    // Styles
    const containerClasses = compact
        ? "bg-white rounded-xl shadow-lg p-5"
        : "bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8";

    const inputClasses = compact
        ? "w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
        : "w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all";

    const buttonClasses = compact
        ? "w-full py-2.5 px-4 text-xs bg-gradient-to-r from-sky-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        : "w-full py-3.5 px-4 text-sm bg-gradient-to-r from-sky-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed";

    const googleButtonClasses = compact
        ? "w-full py-2.5 px-4 text-xs bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        : "w-full py-3 px-4 text-sm bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3";

    return (
        <motion.div
            initial={{ opacity: 0, y: compact ? 5 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={containerClasses}
        >
            {/* Header */}
            {!compact && (
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="mx-auto w-16 h-16 bg-gradient-to-br from-sky-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md mb-4"
                    >
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-gray-600 text-sm">Sign in to your account</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 ${compact ? 'text-xs' : 'text-sm'}`}
                >
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                </motion.div>
            )}

            {/* Google Login Button - Custom */}
            {showGoogleLogin && (
                <div className={compact ? 'mb-4' : 'mb-6'}>
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className={googleButtonClasses}
                    >
                        {googleLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin`} />
                                <span>Redirecting...</span>
                            </div>
                        ) : (
                            <>
                                <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Continue with Google</span>
                            </>
                        )}
                    </motion.button>
                </div>
            )}

            {/* Divider */}
            {showGoogleLogin && (
                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className={`px-3 bg-white text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                            Or with email
                        </span>
                    </div>
                </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                    <label
                        htmlFor={`email-${idSuffix}`}
                        className={`block font-medium text-gray-700 mb-1 ${compact ? 'text-xs' : 'text-sm'}`}
                    >
                        Email Address
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            id={`email-${idSuffix}`}
                            name="email"
                            autoComplete="username"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className={inputClasses}
                            required
                            disabled={loading}
                        />
                        <div className={`absolute right-3 ${compact ? 'top-2' : 'top-3'}`}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label
                            htmlFor={`password-${idSuffix}`}
                            className={`block font-medium text-gray-700 ${compact ? 'text-xs' : 'text-sm'}`}
                        >
                            Password
                        </label>
                        {!compact && (
                            <Link
                                href="/forgot-password"
                                className={`text-sky-600 hover:text-sky-700 hover:underline ${compact ? 'text-xs' : 'text-sm'}`}
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            id={`password-${idSuffix}`}
                            name="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={inputClasses}
                            required
                            disabled={loading}
                        />
                        <div className={`absolute right-3 ${compact ? 'top-2' : 'top-3'}`}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                    </div>
                    {compact && (
                        <div className="text-right mt-1">
                            <Link
                                href="/forgot-password"
                                className="text-xs text-sky-600 hover:text-sky-700 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    )}
                </div>

                {/* Remember Me */}
                {!compact && (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="remember"
                            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                            Remember me for 30 days
                        </label>
                    </div>
                )}

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className={buttonClasses}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
                            {compact ? 'Signing in...' : 'Sign in to Account'}
                        </div>
                    ) : (
                        compact ? 'Sign In' : 'Sign in to Account'
                    )}
                </motion.button>
            </form>

            {/* Footer Links */}
            {!compact && (
                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="text-sky-600 font-semibold hover:text-sky-700 hover:underline"
                        >
                            Sign up now
                        </Link>
                    </p>
                </div>
            )}
        </motion.div>
    );
}