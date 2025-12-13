"use client";

import { Suspense } from 'react'; // 1. Import Suspense
import LoginForm from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const handleLoginSuccess = () => {
        console.log('Login successful!');
        // Router push sudah ditangani di dalam LoginForm, 
        // tapi jika butuh logic tambahan (misal tracking analytics), taruh di sini.
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white via-sky-50 to-emerald-50">
            {/* Mobile Header - Only visible on mobile */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="md:hidden p-4 flex items-center justify-center bg-gradient-to-r from-sky-600 to-emerald-600 shadow-md"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div className="text-white">
                        <h1 className="text-lg font-bold">HRM Portal</h1>
                        <p className="text-xs text-sky-100 uppercase tracking-wide">PT. Grafindo Mitrasemesta</p>
                    </div>
                </div>
            </motion.div>

            {/* Left Side - Branding (Desktop Only) */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hidden md:flex md:w-1/2 bg-gradient-to-br from-sky-600 to-emerald-600 p-8 md:p-12 flex-col justify-center relative overflow-hidden"
            >
                {/* Background Pattern Overlay (Optional Polish) */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

                <div className="max-w-md mx-auto text-white relative z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center mb-8 shadow-inner"
                    >
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </motion.div>

                    <h1 className="text-4xl font-bold mb-4">HR Management System</h1>
                    <p className="text-sky-100 text-lg mb-8 font-light">
                        PT. Grafindo Mitrasemesta
                    </p>

                    <div className="space-y-4">
                        {[
                            { color: "bg-emerald-300", text: "Secure & Encrypted Login" },
                            { color: "bg-sky-300", text: "Integrated Employee Management" },
                            { color: "bg-cyan-300", text: "Real-time Analytics Dashboard" }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + (index * 0.1) }}
                                className="flex items-center gap-3"
                            >
                                <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`}></div>
                                <span className="text-sm md:text-base">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-sm md:max-w-md"
                >
                    {/* 2. WAJIB: Bungkus konten form dengan Suspense */}
                    <Suspense fallback={
                        <div className="flex justify-center p-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                        </div>
                    }>
                        {/* Mobile: Compact Card */}
                        <div className="md:hidden">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome Back</h2>
                                <p className="text-xs text-gray-600">Sign in to continue</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
                                <LoginForm
                                    onSuccess={handleLoginSuccess}
                                    showGoogleLogin={true}
                                    redirectPath="/dashboard"
                                    compact={true}
                                />
                            </div>
                        </div>

                        {/* Desktop: Full Card */}
                        <div className="hidden md:block">
                            <LoginForm
                                onSuccess={handleLoginSuccess}
                                showGoogleLogin={true}
                                redirectPath="/dashboard"
                                compact={false}
                            />
                        </div>
                    </Suspense>

                    {/* Mobile Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="md:hidden mt-6 text-center"
                    >
                        <div className="text-xs text-gray-500 space-y-2">
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Secure 256-bit encryption</span>
                            </div>
                            <p className="text-gray-400">© 2025 HRM Platform</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Mobile Background Decorations */}
            <div className="md:hidden absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-full blur-3xl opacity-30" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-full blur-3xl opacity-30" />
            </div>
        </div>
    );
}