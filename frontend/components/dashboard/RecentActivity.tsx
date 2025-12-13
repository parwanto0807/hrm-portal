// components/dashboard/RecentActivity.tsx
'use client';

import { CheckCircle, Clock, AlertTriangle, Users, Calendar, FileText } from 'lucide-react';
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
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Aktivitas Terbaru
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Update terbaru dari sistem HRM
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <div className={`${activity.color} p-2 rounded-lg`}>
                                <activity.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                    {activity.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {activity.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {activity.time}
                                </p>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
                                Lihat
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                                Total Pending Approval
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                12 pengajuan menunggu
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                            Review Semua
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};