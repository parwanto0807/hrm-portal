"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import HeaderCard from '@/components/ui/header-card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, BarChart3, Users, UserMinus, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function HrAnalyticsPage() {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['hrAnalytics'],
        queryFn: async () => {
            const res = await api.get('/reports/analytics');
            return res.data.data;
        }
    });

    if (isLoading) {
        return <div className="p-6 text-slate-500">Memuat visualisasi analitik...</div>;
    }

    const { totalEmployees, employeesLeftThisMonth, genderStats, deptStats } = analytics || {};

    // Transform gender stats for recharts
    const genderData = (genderStats || []).map((g: any) => ({
        name: g.kdSex === 'LAKILAKI' ? 'Laki-Laki' : g.kdSex === 'PEREMPUAN' ? 'Perempuan' : 'Lainnya',
        value: g._count.kdSex
    }));

    return (
        <div className="flex flex-col gap-4 md:gap-5 p-2 md:p-6 pb-24">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild><Link href="/dashboard"><Badge variant="outline"><Home className="h-3 w-3 mr-1" />Dashboard</Badge></Link></BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild><Link href="/dashboard/reports"><Badge variant="outline"><BarChart3 className="h-3 w-3 mr-1" />Laporan</Badge></Link></BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage><Badge className="bg-slate-800 text-white border-transparent">Analitik SDM</Badge></BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="Dashboard Analitik SDM"
                description="Visualisasi interaktif headcount, demografi, dan tren SDM perusahaan."
                icon={<BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                gradientFrom="from-slate-700"
                gradientTo="to-slate-900"
                patternText="HR ANALYTICS"
            />

            {/* Top Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 flex flex-col justify-center items-center">
                    <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center mb-3">
                        <Users className="h-5 w-5 text-violet-600" />
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Total Karyawan Aktif</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{totalEmployees || 0}</h3>
                </div>
                
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 flex flex-col justify-center items-center">
                    <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center mb-3">
                        <UserMinus className="h-5 w-5 text-rose-600" />
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Karyawan Keluar (Bulan Ini)</p>
                    <h3 className="text-3xl font-bold text-rose-600">{employeesLeftThisMonth || 0}</h3>
                </div>
                
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 flex flex-col justify-center items-center">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                        <Building2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Total Departemen</p>
                    <h3 className="text-3xl font-bold text-emerald-600">{deptStats?.length || 0}</h3>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-violet-600 to-indigo-600 p-5 flex flex-col justify-center items-center shadow-lg">
                    <p className="text-sm text-white/80 mb-1">Turnover Rate</p>
                    <h3 className="text-3xl font-bold text-white">
                        {totalEmployees ? ((employeesLeftThisMonth / totalEmployees) * 100).toFixed(1) : 0}%
                    </h3>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Demografi Karyawan (Gender)</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {genderData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Distribusi Karyawan per Departemen</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptStats} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} fontSize={10} />
                                <RechartsTooltip />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
