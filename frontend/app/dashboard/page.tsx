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
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <SkeletonDashboard />;
    }

    return (
        <div className="w-full max-w-full px-4 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <DashboardHeader />

            {/* Stats Cards */}
            <StatsCards />

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                <div className="lg:col-span-2 w-full">
                    <QuickAccess />
                </div>

                <div className="lg:col-span-1 w-full">
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
}