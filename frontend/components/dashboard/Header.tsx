// components/dashboard/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/hooks/useAuth';
import HeaderCard from '@/components/ui/header-card';
import { Home } from 'lucide-react';

export const DashboardHeader = () => {
    const { getUser } = useAuth();
    const [mounted, setMounted] = useState(false);

    // 2. Ambil data user
    const user = getUser();

    // 3. Pastikan komponen sudah mounted sebelum menampilkan data user
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
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
        <div className="mb-0">
            <HeaderCard
                title={`Selamat Datang, ${user?.name || 'User'} 👋`}
                description={`${user?.role || 'Employee'} • Session started: ${timeNow}`}
                icon={<Home className="h-6 w-6 text-white" />}
                gradientFrom="from-blue-600"
                gradientTo="to-purple-600"
                patternText="HR Portal"
                className="mb-0"
            />
        </div>
    );
};