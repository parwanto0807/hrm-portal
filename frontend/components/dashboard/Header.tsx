// components/dashboard/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/hooks/useAuth'; // 1. Import hook auth

export const DashboardHeader = () => {
    const { getUser } = useAuth();
    const [mounted, setMounted] = useState(false);

    // 2. Ambil data user
    const user = getUser();

    // 3. Pastikan komponen sudah mounted sebelum menampilkan data user
    useEffect(() => {
        setMounted(true);
    }, []);

    // Helper untuk tanggal hari ini
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Helper untuk waktu (simulasi last login session ini)
    const timeNow = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Jika belum mounted, tampilkan skeleton loading sederhana agar tidak layout shift kasar
    if (!mounted) {
        return (
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="animate-pulse">
                        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                {/* Left: Welcome Message */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Selamat Datang,{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {/* 4. Tampilkan Nama User Real */}
                            {user?.name || 'User'}
                        </span>{' '}
                        👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2 text-sm md:text-base">
                        <span className="font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                            {/* 5. Tampilkan Role Real */}
                            {user?.role || 'Employee'}
                        </span>
                        <span>•</span>
                        {/* Karena lastLogin biasanya tidak disimpan di token JWT sederhana, 
                            kita tampilkan sesi aktif saat ini atau tanggal hari ini */}
                        <span>Session started: {timeNow}</span>
                    </p>
                </motion.div>

                {/* Right: Date Display */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="hidden md:block text-right"
                >
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {today}
                    </p>
                </motion.div>
            </div>
        </header>
    );
};