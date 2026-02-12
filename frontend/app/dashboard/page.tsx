'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "@/app/hooks/useAuth";
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard";
import { DashboardHeader } from '@/components/dashboard/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { QuickAccess } from '@/components/dashboard/QuickAccess';

import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SkeletonDashboard } from '@/components/dashboard/SkeletonDashboard';
import { SkeletonEmployeeDashboard } from '@/components/dashboard/SkeletonEmployeeDashboard';

import DashboardCharts from '@/components/dashboard/ChartSummary';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const { getUser } = useAuth();
    const user = getUser();
    const isEmployee = user?.role?.toLowerCase() === 'employee';

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return isEmployee ? <SkeletonEmployeeDashboard /> : <SkeletonDashboard />;
    }

    if (isEmployee) {
        return <EmployeeDashboard />;
    }

    return (
        <div className="w-full max-w-full px-4 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <DashboardHeader />

            {/* Stats Cards */}
            <StatsCards />

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                <div className="lg:col-span-2 w-full space-y-8">
                    {/* Chart Summary - Visible on Desktop and Mobile */}
                    <div className="block">
                        <DashboardCharts />
                    </div>

                    {/* Quick Access - Visible on Mobile only */}
                    <div className="block lg:hidden">
                        <QuickAccess />
                    </div>
                </div>

                <div className="lg:col-span-1 w-full">
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
}