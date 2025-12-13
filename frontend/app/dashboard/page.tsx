'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { QuickAccess } from '@/components/dashboard/QuickAccess';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SkeletonDashboard } from '@/components/dashboard/SkeletonDashboard';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Tampilkan Skeleton saat loading
    if (loading) {
        return <SkeletonDashboard />;
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <DashboardHeader />

            {/* Stats Cards (Full Width Grid) */}
            <StatsCards />

            {/* Content Grid (Quick Access + Activity) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kiri: Quick Access (Lebar) */}
                <div className="lg:col-span-2">
                    <QuickAccess />
                </div>

                {/* Kanan: Recent Activity (Sempit) */}
                <div className="lg:col-span-1">
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
}