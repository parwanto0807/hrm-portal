"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google'; // Import Wajib
import Image from 'next/image';

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
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const idSuffix = compact ? 'mobile' : 'desktop';

    // 1. Handle URL Errors (Legacy support jika ada redirect lama)
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'cancelled' || errorParam === 'access_denied') {
            setError('Login dibatalkan.');
            // Bersihkan URL agar rapi
            window.history.replaceState({}, '', window.location.pathname);
        } else if (errorParam) {
            setError(errorParam);
        }
    }, [searchParams]);

    // 2. Check Authentication Status
    useEffect(() => {
        const checkAuth = () => {
            const accessToken = localStorage.getItem('hrm_access_token');
            const userStr = localStorage.getItem('hrm_user');

            // Cek token DAN user untuk mencegah loop jika state tidak sinkron
            if (accessToken && userStr) {
                try {
                    // Validasi userStr adalah JSON yang valid
                    JSON.parse(userStr);
                    console.log('✅ User already authenticated, redirecting...');
                    if (onSuccess) onSuccess();
                    router.push(redirectPath);
                } catch (e) {
                    console.warn('❌ Corrupt user data found in login check, staying on login page.');
                    // Optional: Clean up corrupt data
                    localStorage.removeItem('hrm_user');
                }
            }
        };
        checkAuth();
    }, [router, onSuccess, redirectPath]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    // 3. HOOK GOOGLE LOGIN (PENGGANTI FUNGSI LAMA)
    // Ini menggunakan Popup, jadi user tidak meninggalkan halaman
    const loginToGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            setError(null);

            try {
                // Gunakan URL dari ENV (wajib https untuk mobile)
                // Gunakan URL dari ENV dengan fallback yang benar
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://solusiit.id/api';

                // Kirim Access Token ke Backend
                const response = await fetch(`${backendUrl}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: tokenResponse.access_token }),
                    credentials: 'include', // WAJIB: Agar cookie dikirim/diterima
                });

                const data = await response.json();
                console.log("❌ server response error full:", data); // DEBUG LOG

                if (!response.ok) {
                    // Cek 'message' ATAU 'error' agar fallbacknya jalan
                    throw new Error(data.message || data.error || "Gagal login dengan Google");
                }

                // Simpan Token & User Data
                const accessToken = data.tokens?.accessToken || data.accessToken;
                const refreshToken = data.tokens?.refreshToken || data.refreshToken;

                if (accessToken) {
                    localStorage.setItem('hrm_access_token', accessToken); // <- GANTI
                    if (refreshToken) localStorage.setItem('hrm_refresh_token', refreshToken);
                }

                if (data.user) {
                    localStorage.setItem('hrm_user', JSON.stringify(data.user)); // <- GANTI
                    localStorage.setItem('isAuthenticated', 'true');
                }

                // Sukses
                setIsRedirecting(true);
                window.dispatchEvent(new Event('auth-change'));
                if (onSuccess) onSuccess();
                router.push(redirectPath);

            } catch (err: unknown) {
                const error = err as Error;
                console.error("Google Auth Error:", error);
                setError(error.message || "Terjadi kesalahan saat login Google");
                setGoogleLoading(false); // Only stop loading if there's an error
            }
            // Removed finally block to keep loading visible during redirect
        },
        onError: (errorResponse) => {
            // MENANGANI PEMBATALAN (CANCEL)
            console.log("Login Cancelled:", errorResponse);
            setError("Login dibatalkan."); // Pesan error tanpa reload halaman
            setGoogleLoading(false);
        },
        flow: 'implicit' // Penting untuk mendapatkan access_token langsung
    });

    // 4. Email/Password Login Function (Tetap Sama)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.email || !formData.password) {
                throw new Error('Please fill in all fields');
            }

            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://solusiit.id/api';

            const response = await fetch(`${backendUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Simpan Token
            const accessToken = data.tokens?.accessToken || data.accessToken;

            if (accessToken) localStorage.setItem('hrm_access_token', accessToken); // <- GANTI
            if (data.user) {
                localStorage.setItem('hrm_user', JSON.stringify(data.user)); // <- GANTI
                localStorage.setItem('isAuthenticated', 'true');
            }

            setIsRedirecting(true);
            window.dispatchEvent(new Event('auth-change'));
            if (onSuccess) onSuccess();
            router.push(redirectPath);

        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'Login failed');
            setLoading(false); // Only stop loading if there's an error
        }
        // Removed finally block to keep loading visible
    };

    // Variant for staggered entrance
    const containerVariants: any = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "circOut",
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    // Styles
    const containerClasses = compact
        ? "bg-white dark:bg-slate-950/40 rounded-xl shadow-lg p-5 border border-slate-200 dark:border-slate-800/50 backdrop-blur-xl w-full"
        : "bg-white/80 dark:bg-slate-950/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-10 border border-slate-200/60 dark:border-slate-800/60 w-full";

    const inputClasses = compact
        ? "w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 dark:text-slate-200"
        : "w-full px-4 py-3 text-sm bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700";

    const buttonClasses = compact
        ? "w-full py-2.5 px-4 text-xs bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white font-bold rounded-lg hover:brightness-110 transition-all duration-300 disabled:opacity-50 active:scale-[0.98] shadow-md shadow-emerald-500/20"
        : "w-full py-4 px-4 text-sm bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:brightness-110 hover:translate-y-[-1px] active:scale-[0.97] transition-all duration-300 disabled:opacity-50 border border-emerald-400/20 dark:border-emerald-500/30";

    const googleButtonClasses = compact
        ? "w-full py-2.5 px-4 text-xs bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-850 dark:hover:to-slate-900/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm"
        : "w-full py-3.5 px-4 text-sm bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900/80 dark:to-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-800 dark:hover:to-slate-900 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] dark:shadow-none active:scale-[0.97] hover:border-slate-300 dark:hover:border-slate-700";

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={containerClasses}
        >
            {/* Loading Overlay */}
            <AnimatePresence>
                {(loading || googleLoading || isRedirecting) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-xl md:rounded-2xl"
                    >
                        <div className="relative flex flex-col items-center">
                            {/* Inner pulsing core */}
                            <div className="w-12 h-12 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 flex flex-col items-center gap-1"
                            >
                                <span className="text-slate-900 dark:text-white font-bold text-sm">Authenticating</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Please wait...</span>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            {!compact && (
                <motion.div variants={itemVariants} className="space-y-1 mb-10 text-center">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mx-auto w-16 h-16 bg-gradient-to-br from-sky-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-500/20 mb-6 p-1.5 cursor-default"
                    >
                        <Image
                            src="/icons/axon-hrm-icon-192x192.png"
                            alt="Axon"
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                        />
                    </motion.div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-[0.3em] block mb-1 drop-shadow-sm">PT. Grafindo Mitrasemesta</span>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight sm:text-4xl drop-shadow-sm">Axon HRM</h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold pt-1 px-4">Sign to Account</p>
                </motion.div>
            )}

            {/* Error Message */}
            {error && (
                <motion.div
                    variants={itemVariants}
                    className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-700 dark:text-rose-400 text-sm font-semibold flex items-center gap-3 shadow-sm border-l-4 border-l-rose-500"
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </motion.div>
            )}

            {/* Login Form */}
            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label
                        htmlFor={`email-${idSuffix}`}
                        className="block font-black text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-[0.2em] ml-1"
                    >
                        Email Address
                    </label>
                    <div className="relative group">
                        <input
                            type="email"
                            id={`email-${idSuffix}`}
                            name="email"
                            autoComplete="username"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@company.com"
                            className={inputClasses}
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor={`password-${idSuffix}`}
                        className="block font-black text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-[0.2em] ml-1"
                    >
                        Password
                    </label>
                    <div className="relative group">
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
                    </div>
                </div>

                <div className="pt-2">
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className={buttonClasses}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Authenticating...</span>
                            </div>
                        ) : (
                            'Sign to Account'
                        )}
                    </motion.button>
                </div>
            </motion.form>

            {/* Divider */}
            {showGoogleLogin && (
                <motion.div variants={itemVariants} className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] backdrop-blur-md">
                            Gateway
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Google Login Button */}
            {showGoogleLogin && (
                <motion.div variants={itemVariants} className="mb-2">
                    <motion.button
                        type="button"
                        onClick={() => {
                            setGoogleLoading(true);
                            loginToGoogle();
                        }}
                        disabled={googleLoading}
                        className={googleButtonClasses}
                    >
                        {googleLoading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-4 h-4 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
                                <span>Securing Session...</span>
                            </div>
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Login By Google Account</span>
                            </>
                        )}
                    </motion.button>
                </motion.div>
            )}
            {/* Footer Links Removed per request */}
        </motion.div>
    );
}