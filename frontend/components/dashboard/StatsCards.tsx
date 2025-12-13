// components/dashboard/StatsCards.tsx
'use client';

import { Calendar, Clock, Users, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const statsData = [
    {
        title: 'Total Kehadiran',
        value: '245',
        subtitle: 'Hari kerja thn ini', // Disingkat sedikit biar muat
        icon: Calendar,
        color: 'from-blue-500 to-cyan-500',
        trend: '+12%',
        trendUp: true,
        detail: '95% Rate'
    },
    {
        title: 'Total Lembur',
        value: '48',
        subtitle: 'Jam bulan ini',
        icon: Clock,
        color: 'from-purple-500 to-pink-500',
        trend: '+5%',
        trendUp: true,
        detail: 'Avg 2.5h'
    },
    {
        title: 'Cuti Diambil',
        value: '12',
        subtitle: 'Sisa cuti: 8',
        icon: Users,
        color: 'from-green-500 to-emerald-500',
        trend: '-3%',
        trendUp: false,
        detail: '3 Cuti, 9 Lain'
    },
    {
        title: 'Sakit & Alpha',
        value: '3',
        subtitle: '2 Sakit, 1 Alpha',
        icon: AlertCircle,
        color: 'from-orange-500 to-red-500',
        trend: '0%',
        trendUp: null,
        detail: '2 minggu lalu'
    }
];

export const StatsCards = () => {
    return (
        // PERUBAHAN UTAMA: grid-cols-2 (untuk mobile)
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
            {statsData.map((stat, index) => (
                <Card key={index} hover className="overflow-hidden">
                    {/* Padding lebih kecil di mobile (p-3), normal di desktop (md:p-6) */}
                    <CardContent className="p-3 md:p-6">

                        {/* Header: Icon & Trend */}
                        <div className="flex justify-between items-start mb-2 md:mb-4">
                            {/* Icon lebih kecil di mobile */}
                            <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-r ${stat.color}`}>
                                <stat.icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                            </div>

                            {/* Trend Badge */}
                            <div className={`flex items-center gap-0.5 md:gap-1 text-xs md:text-sm font-medium 
                                ${stat.trendUp === null ? 'text-gray-500' : stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.trendUp !== null && (
                                    stat.trendUp ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                                )}
                                {stat.trend}
                            </div>
                        </div>

                        {/* Value (Angka Besar) */}
                        <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 md:mb-1">
                            {stat.value}
                        </h3>

                        {/* Title */}
                        <p className="text-xs md:text-base text-gray-900 dark:text-white font-medium mb-0.5 md:mb-1 truncate">
                            {stat.title}
                        </p>

                        {/* Subtitle */}
                        <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-400 mb-1 md:mb-2 truncate">
                            {stat.subtitle}
                        </p>

                        {/* Detail footer (sembunyikan di layar sangat kecil jika perlu, atau kecilkan font) */}
                        <p className="text-[10px] md:text-sm text-gray-400 dark:text-gray-500 truncate">
                            {stat.detail}
                        </p>

                    </CardContent>
                </Card>
            ))}
        </div>
    );
};