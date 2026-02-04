// components/dashboard/QuickAccess.tsx
'use client';

import {
    Calendar,
    DollarSign,
    FileText,
    Clock,
    Coffee,
    Users,
    Settings,
    Download,
    BarChart3,
    MoreHorizontal
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const quickAccessItems = [
    {
        title: 'Absensi',
        description: 'Riwayat kehadiran',
        icon: Calendar,
        color: 'bg-blue-500 text-white', // Icon background warna solid
        bgColor: 'bg-blue-50 dark:bg-blue-900/20', // Card background warna soft
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600', // Warna untuk icon jika tidak pakai background
        href: '/dashboard/attendance'
    },
    {
        title: 'Lembur',
        description: 'Monitoring jam',
        icon: Clock,
        color: 'bg-purple-500 text-white',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        iconColor: 'text-purple-600',
        href: null
    },
    {
        title: 'Gaji',
        description: 'Slip & payroll',
        icon: DollarSign,
        color: 'bg-emerald-500 text-white',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        iconColor: 'text-emerald-600',
        href: '/dashboard/payroll'
    },
    {
        title: 'Uang Makan',
        description: 'Klaim & pengajuan',
        icon: Coffee,
        color: 'bg-amber-500 text-white',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        iconColor: 'text-amber-600',
        href: null
    },
    {
        title: 'Ijin',
        description: 'Ajukan ijin kerja',
        icon: FileText,
        color: 'bg-indigo-500 text-white',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        borderColor: 'border-indigo-200 dark:border-indigo-800',
        iconColor: 'text-indigo-600',
        href: '/dashboard/leaves'
    },
    {
        title: 'Cuti',
        description: 'Cuti tahunan',
        icon: Users,
        color: 'bg-rose-500 text-white',
        bgColor: 'bg-rose-50 dark:bg-rose-900/20',
        borderColor: 'border-rose-200 dark:border-rose-800',
        iconColor: 'text-rose-600',
        href: '/dashboard/leaves'
    },
    {
        title: 'Laporan',
        description: 'Analytics HR',
        icon: BarChart3,
        color: 'bg-teal-500 text-white',
        bgColor: 'bg-teal-50 dark:bg-teal-900/20',
        borderColor: 'border-teal-200 dark:border-teal-800',
        iconColor: 'text-teal-600',
        href: '/dashboard/reports'
    },
    {
        title: 'Settings',
        description: 'Profile & settings',
        icon: Settings,
        color: 'bg-gray-500 text-white',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        borderColor: 'border-gray-200 dark:border-gray-700',
        iconColor: 'text-gray-600',
        href: '/dashboard/settings'
    },
];

export const QuickAccess = () => {
    const [showAll, setShowAll] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleNavigation = (href: string | null) => {
        if (href) {
            router.push(href);
        } else {
            toast.info("Fitur Dalam Pengembangan", {
                description: "Kami sedang bekerja keras untuk menghadirkan fitur ini.",
                duration: 3000,
            });
        }
    };

    if (!isMounted) {
        return (
            <Card className="mb-6 md:mb-8 border-0 shadow-sm bg-white dark:bg-gray-900">
                <CardHeader className="pb-3 px-0 md:px-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                                Akses Cepat
                            </h2>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Fitur utama Axon HRM dalam satu klik
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-3 md:px-6">
                    <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-8 gap-3">
                        {quickAccessItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleNavigation(item.href)}
                                className={`
                                    ${item.bgColor}
                                    p-4 rounded-xl border ${item.borderColor}
                                    flex flex-col items-center justify-center text-center
                                    cursor-pointer hover:opacity-90 transition-opacity
                                `}
                            >
                                <div className={`${item.color} p-2.5 rounded-lg mb-2.5`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.description}
                                </p>
                            </button>
                        ))}
                    </div>
                    <div className="md:hidden">
                        <div className="grid grid-cols-3 gap-2">
                            {quickAccessItems.slice(0, 6).map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleNavigation(item.href)}
                                    className={`
                                        ${item.bgColor}
                                        p-3 rounded-lg border ${item.borderColor}
                                        flex flex-col items-center justify-center
                                    `}
                                >
                                    <div className={`${item.color} p-1.5 rounded-md mb-1.5`}>
                                        <item.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <h3 className="text-xs font-medium text-gray-900 dark:text-white">
                                        {item.title}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                        {item.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6 md:mb-8 border-0 shadow-sm bg-white dark:bg-gray-900">
            <CardHeader className="pb-3 px-4 md:px-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                            Akses Cepat
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Fitur utama HRM dalam satu klik
                        </p>
                    </div>
                    <button className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
                {/* Desktop View dengan icon berwarna */}
                <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {quickAccessItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleNavigation(item.href)}
                            className={`
                                ${item.bgColor}
                                p-4 rounded-xl border ${item.borderColor}
                                flex flex-col items-center justify-center text-center
                                transition-all duration-150 hover:shadow-md hover:scale-[1.02]
                                active:scale-95
                            `}
                        >
                            <div className={`${item.color} p-2.5 rounded-lg mb-2.5 group-hover:scale-110 transition-transform`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                                {item.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.description}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Mobile View dengan icon berwarna */}
                <div className="md:hidden">
                    <div className="grid grid-cols-3 gap-2">
                        {quickAccessItems.slice(0, showAll ? quickAccessItems.length : 6).map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleNavigation(item.href)}
                                className={`
                                    ${item.bgColor}
                                    p-3 rounded-lg border ${item.borderColor}
                                    flex flex-col items-center justify-center
                                    transition-colors active:bg-gray-50 dark:active:bg-gray-700
                                `}
                            >
                                <div className={`${item.color} p-1.5 rounded-md mb-1.5`}>
                                    <item.icon className="w-3.5 h-3.5" />
                                </div>
                                <h3 className="text-xs font-medium text-gray-900 dark:text-white">
                                    {item.title}
                                </h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {item.description}
                                </p>
                            </button>
                        ))}

                        {/* Show More/Less Button */}
                        {quickAccessItems.length > 6 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className={`
                                    p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700
                                    bg-gray-50 dark:bg-gray-800/50
                                    flex flex-col items-center justify-center
                                    col-span-3
                                    transition-colors hover:bg-gray-100 dark:hover:bg-gray-800
                                `}
                            >
                                <div className="flex items-center gap-1.5">
                                    <MoreHorizontal className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {showAll ? 'Sembunyikan Fitur Lain' : `Tampilkan ${quickAccessItems.length - 6} Fitur Lainnya`}
                                    </span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};