"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import HeaderCard from '@/components/ui/header-card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, BarChart3, TrendingUp, Search, Filter } from 'lucide-react';

export default function KpiSummaryPage() {
    const [tahun, setTahun] = useState<string>(new Date().getFullYear().toString());
    const [search, setSearch] = useState('');

    const { data: kpiData, isLoading } = useQuery({
        queryKey: ['kpiReport', tahun],
        queryFn: async () => {
            const res = await api.get(`/reports/kpi?tahun=${tahun}`);
            return res.data.data;
        }
    });

    const filtered = kpiData?.filter((k: any) => 
        !search || k.karyawan?.nama?.toLowerCase().includes(search.toLowerCase()) || k.karyawan?.nik?.includes(search)
    ) || [];

    const getGradeColor = (grade: string) => {
        if (grade === 'A') return 'bg-emerald-100 text-emerald-700';
        if (grade === 'B') return 'bg-blue-100 text-blue-700';
        if (grade === 'C') return 'bg-amber-100 text-amber-700';
        if (grade === 'D') return 'bg-red-100 text-red-700';
        return 'bg-slate-100 text-slate-700';
    };

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
                        <BreadcrumbPage><Badge className="bg-violet-600 hover:bg-violet-700 text-white border-transparent">KPI Karyawan</Badge></BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="Laporan Kinerja KPI"
                description="Evaluasi Key Performance Indicator karyawan per periode."
                icon={<TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                gradientFrom="from-violet-600"
                gradientTo="to-purple-600"
                patternText="KPI REPORT"
            />

            <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari karyawan..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-9 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </div>
                <select
                    value={tahun}
                    onChange={e => setTahun(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                </select>
                <span className="text-xs text-slate-500 ml-auto">{filtered.length} data ditemukan</span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">EMPL ID</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Nama</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Departemen</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Jabatan</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Periode</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Total Nilai</th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">Grade</th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isLoading ? (
                            <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Memuat data...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Belum ada data KPI untuk tahun {tahun}</td></tr>
                        ) : (
                            filtered.map((r: any) => (
                                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-300">{r.emplId}</td>
                                    <td className="px-4 py-2 font-medium">{r.karyawan?.nama}</td>
                                    <td className="px-4 py-2 text-slate-500">{r.karyawan?.dept?.nmDept || '-'}</td>
                                    <td className="px-4 py-2 text-slate-500">{r.karyawan?.jabatan?.nmJab || '-'}</td>
                                    <td className="px-4 py-2">
                                        <Badge className="bg-slate-100 text-slate-600 border-0">{r.periode === 0 ? 'Tahunan' : `Q${r.periode}`}</Badge>
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold">{parseFloat(r.totalNilai || 0).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getGradeColor(r.grade)}`}>{r.grade || '-'}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <Badge variant="outline" className="text-[10px] uppercase">{r.status}</Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
