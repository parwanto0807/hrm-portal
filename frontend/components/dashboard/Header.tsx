// components/dashboard/Header.tsx
'use client';

import { motion } from 'framer-motion';

export const DashboardHeader = () => {
    // Anda bisa mengambil data user asli dari context/session di sini nanti
    const user = {
        name: "John Doe",
        role: "HR Manager",
        lastLogin: "Today at 08:45"
    };

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
                        Selamat Datang, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user.name}</span> 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2 text-sm md:text-base">
                        <span className="font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                            {user.role}
                        </span>
                        <span>•</span>
                        <span>Last login: {user.lastLogin}</span>
                    </p>
                </motion.div>

                {/* Right: Quick Stats / Date (Optional Placeholder) */}
                {/* Bagian kanan dikosongkan karena Profile & Notif sudah ada di Navbar. 
                    Jika ingin diisi, bisa dengan Tanggal Hari Ini atau Tombol Quick Action. */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="hidden md:block text-right"
                >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </motion.div>
            </div>
        </header>
    );
};