"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setToken } from '@/lib/auth'; // Gunakan helper yang sama dengan LoginForm Anda

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleCallback = () => {
            try {
                // 1. ✅ FIX: Sesuaikan nama param dengan Backend (accessToken, bukan access_token)
                const accessToken = searchParams.get('accessToken');
                const refreshToken = searchParams.get('refreshToken');
                const error = searchParams.get('error');

                if (error) {
                    router.push(`/login?error=${error}`);
                    return;
                }

                if (!accessToken || !refreshToken) {
                    // Jangan redirect terlalu cepat jika params belum mount
                    return;
                }

                // 2. Simpan Token
                // Gunakan setToken dari lib/auth agar konsisten dengan Login manual
                setToken(accessToken);
                localStorage.setItem('refresh_token', refreshToken);

                // 3. Redirect ke Dashboard
                // Gunakan window.location agar aplikasi refresh total 
                // dan state auth baru terbaca sempurna oleh semua komponen
                window.location.href = '/dashboard';

            } catch (err) {
                console.error('Auth callback error:', err);
                router.push('/login?error=auth_failed');
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                {/* Spinner Cantik Tailwind */}
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
                <h2 className="mt-4 text-lg font-semibold text-gray-700">Finalizing login...</h2>
                <p className="text-sm text-gray-500">Please wait a moment.</p>
            </div>
        </div>
    );
}

// 4. ⚠️ PENTING: Bungkus dengan Suspense
// useSearchParams di Next.js App Router WAJIB dibungkus Suspense
// jika tidak, build production akan error atau de-opt.
export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}