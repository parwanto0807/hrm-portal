"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    Users,
    UserCheck,
    UserX,
    Clock,
    TrendingUp,
    TrendingDown,
    Cpu,
    Wifi,
    WifiOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
    stats: {
        total: number;
        presentCount: number;
        lateCount: number;
        absentCount: number;
        presentPercentage: number;
        latePercentage: number;
        absentPercentage: number;
    } | null;
    isLoading: boolean;
    machineStatus?: {
        success: boolean;
        message: string;
    } | null;
}

export const StatsCards = ({ stats, isLoading, machineStatus }: StatsCardsProps) => {
    const cards = [
        {
            title: 'Total Kehadiran',
            value: stats?.total || 0,
            icon: Users,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-950/30',
            borderColor: 'border-blue-100 dark:border-blue-900/50',
            description: 'Total data log'
        },
        {
            title: 'Hadir',
            value: `${stats?.presentPercentage.toFixed(1) || 0}%`,
            subValue: `${stats?.presentCount || 0} karyawan`,
            icon: UserCheck,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
            borderColor: 'border-emerald-100 dark:border-emerald-900/50',
            description: 'Tepat waktu & Hadir'
        },
        {
            title: 'Terlambat',
            value: `${stats?.latePercentage.toFixed(1) || 0}%`,
            subValue: `${stats?.lateCount || 0} karyawan`,
            icon: Clock,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-50 dark:bg-amber-950/30',
            borderColor: 'border-amber-100 dark:border-amber-900/50',
            description: 'Masuk setelah jadwal'
        },
        {
            title: 'Alpha',
            value: `${stats?.absentPercentage.toFixed(1) || 0}%`,
            subValue: `${stats?.absentCount || 0} karyawan`,
            icon: UserX,
            color: 'text-rose-600 dark:text-rose-400',
            bgColor: 'bg-rose-50 dark:bg-rose-950/30',
            borderColor: 'border-rose-100 dark:border-rose-900/50',
            description: 'Tanpa keterangan'
        }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-3 md:p-6">
                            <div className="h-3 w-16 bg-slate-200 rounded mb-4" />
                            <div className="h-6 w-12 bg-slate-200 rounded mb-2" />
                            <div className="h-2 w-20 bg-slate-200 rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {cards.map((card) => (
                <Card
                    key={card.title}
                    className={cn(
                        "overflow-hidden transition-all hover:shadow-md border-l-4",
                        card.borderColor
                    )}
                >
                    <CardContent className="p-3 md:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] sm:text-xs font-bold text-muted-foreground whitespace-nowrap uppercase tracking-tight">
                                {card.title}
                            </span>
                            <div className="hidden sm:flex items-center gap-2">
                                {card.title === 'Total Kehadiran' && machineStatus && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[9px] px-1.5 py-0 border-none flex items-center gap-1",
                                            machineStatus.success
                                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 animate-pulse"
                                                : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                                        )}
                                    >
                                        <div className={cn("h-1.5 w-1.5 rounded-full", machineStatus.success ? "bg-emerald-500" : "bg-rose-500")} />
                                        X304 {machineStatus.success ? 'Online' : 'Offline'}
                                    </Badge>
                                )}
                                <div className={cn("p-1.5 rounded-lg", card.bgColor)}>
                                    <card.icon className={cn("h-4 w-4", card.color)} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {card.value}
                                </span>
                            </div>
                            {card.subValue && (
                                <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-semibold">
                                    {card.subValue}
                                </span>
                            )}
                            <div className="mt-2 sm:mt-4 flex items-center gap-1">
                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                                    {card.description}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
