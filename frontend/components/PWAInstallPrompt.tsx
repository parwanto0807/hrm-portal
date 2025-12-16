"use client";

import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Handler untuk event beforeinstallprompt
        const handleBeforeInstallPrompt = (e: any) => {
            // 1. Cegah browser menampilkan prompt bawaan
            e.preventDefault();

            // 2. Simpan event-nya agar bisa dipanggil nanti saat tombol Install diklik
            setDeferredPrompt(e);

            // 3. Tampilkan UI kustom kita jika belum pernah di-skip session ini
            const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
            if (!isDismissed) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Panggil prompt asli browser
        deferredPrompt.prompt();

        // Tunggu respon user
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // Reset prompt karena hanya bisa digunakan sekali
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleSkipClick = () => {
        // Sembunyikan prompt
        setIsVisible(false);
        // Simpan status di session storage agar tidak muncul lagi sampai tab ditutup/dibuka ulang
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">

                {/* Info App */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Install HRM Pro</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Akses lebih cepat & notifikasi realtime.</p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleSkipClick}
                        className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Lewati
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-emerald-500 hover:shadow-lg rounded-lg transition-all transform active:scale-95"
                    >
                        Install Sekarang
                    </button>
                </div>

            </div>
        </div>
    );
}