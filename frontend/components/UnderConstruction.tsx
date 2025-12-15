"use client";

import Link from 'next/link';

interface UnderConstructionProps {
    title: string;
    description?: string;
}

export default function UnderConstruction({
    title,
    description = "Kami sedang bekerja keras untuk membawa fitur ini kepada Anda. Silakan cek kembali nanti."
}: UnderConstructionProps) {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
            {/* Illustration Container */}
            <div className="relative mb-8 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative w-32 h-32 md:w-48 md:h-48 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl border border-gray-100 dark:border-gray-700">
                    <svg className="w-16 h-16 md:w-24 md:h-24 text-sky-500 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>

                    {/* Floating Elements Animation */}
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md space-y-4">
                <span className="inline-block py-1 px-3 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-sm font-semibold tracking-wide uppercase">
                    Dalam Pengembangan
                </span>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                    {title}
                </h1>

                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {description}
                </p>

                <div className="pt-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
