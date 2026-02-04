// components/dashboard/RecentActivity.tsx
'use client';

import { CheckCircle, Clock, AlertTriangle, Users, Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/card';

const activities = [
    {
        type: 'approval',
        title: 'Pengajuan cuti disetujui',
        description: 'Sarah Miller - 3 hari cuti tahunan',
        time: '10 menit yang lalu',
        icon: CheckCircle,
        color: 'text-green-500'
    },
    {
        type: 'pending',
        title: 'Menunggu approval lembur',
        description: '5 karyawan weekend overtime',
        time: '1 jam yang lalu',
        icon: Clock,
        color: 'text-amber-500'
    },
    {
        type: 'alert',
        title: 'Absensi terlambat',
        description: '3 karyawan terlambat > 30 menit',
        time: '2 jam yang lalu',
        icon: AlertTriangle,
        color: 'text-red-500'
    },
    {
        type: 'new',
        title: 'Karyawan baru bergabung',
        description: 'Michael Chen - Software Engineer',
        time: 'Kemarin',
        icon: Users,
        color: 'text-blue-500'
    },
    {
        type: 'schedule',
        title: 'Jadwal review kinerja',
        description: 'Team Development - 15 Des 2024',
        time: '2 hari yang lalu',
        icon: Calendar,
        color: 'text-purple-500'
    }
];

export const RecentActivity = () => {
    return (
        <Card className="mb-8">
            <CardHeader className="pb-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Aktivitas Terbaru
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Update terbaru dari sistem Axon HRM
                </p>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                    {activities.map((activity, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-3 sm:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <div className={`${activity.color} p-1.5 sm:p-2 rounded-md sm:rounded-lg flex-shrink-0`}>
                                <activity.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                    {activity.title}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                                    {activity.description}
                                </p>
                                <p className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2">
                                    {activity.time}
                                </p>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs sm:text-sm font-medium whitespace-nowrap ml-2">
                                Lihat
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                        <div>
                            <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                                Total Pending Approval
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                12 pengajuan menunggu
                            </p>
                        </div>
                        <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm sm:text-base transition-colors w-full xs:w-auto">
                            Review Semua
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};