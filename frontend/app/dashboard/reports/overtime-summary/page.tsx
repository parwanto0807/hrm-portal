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
import { Home, Clock, Search } from 'lucide-react';

const fmt = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);

export default function OvertimeSummaryPage() {
    const [periode, setPeriode] = useState<string>('202401'); // Default example
    const [search, setSearch] = useState('');

    const { data: otData, isLoading } = useQuery({
        queryKey: ['overtimeReport', periode],
        queryFn: async () => {
            const res = await api.get(`/reports/overtime?periode=${periode}`);
            return res.data.data;
        }
    });

    const filtered = otData?.filter((k: any) => 
        !search || k.karyawan?.nama?.toLowerCase().includes(search.toLowerCase()) || k.nik?.includes(search)
    ) || [];

    // Aggregations
    const totalHours = filtered.reduce((sum: number, curr: any) => sum + parseFloat(curr.totLembur || 0), 0);
    const totalCost = filtered.reduce((sum: number, curr: any) => sum + (curr.estimasiBiaya || 0), 0);

    return (
        <div className="flex flex-col gap-4 md:gap-5 p-2 md:p-6 pb-24">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild><Link href="/dashboard"><Badge variant="outline"><Home className="h-3 w-3 mr-1" />Dashboard</Badge></Link></BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild><Link href="/dashboard/reports"><Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Laporan</Badge></Link></BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage><Badge className="bg-rose-600 hover:bg-rose-700 text-white border-transparent">Lembur</Badge></BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="Laporan Lembur (Overtime)"
                description="Detail jam lembur per periode beserta kalkulasi estimasi biayanya."
                icon={<Clock className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                gradientFrom="from-rose-600"
                gradientTo="to-pink-600"
                patternText="OVERTIME REPORT"
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <p className="text-xs text-slate-500 mb-1">Total Jam Lembur</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{totalHours.toFixed(2)} <span className="text-sm font-normal text-slate-400">jam</span></p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <p className="text-xs text-slate-500 mb-1">Estimasi Biaya</p>
                    <p className="text-xl font-bold text-rose-600">{fmt(totalCost)}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <p className="text-xs text-slate-500 mb-1">Karyawan Lembur</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{filtered.length} <span className="text-sm font-normal text-slate-400">orang</span></p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center mt-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama/NIK..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-9 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                </div>
                <select
                    value={periode}
                    onChange={e => setPeriode(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                    <option value="202401">Jan 2024</option>
                    <option value="202402">Feb 2024</option>
                    <option value="202403">Mar 2024</option>
                    <option value="202404">Apr 2024</option>
                    <option value="202405">Mei 2024</option>
                </select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Tanggal</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Nama</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Departemen</th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">Jam Mulai - Akhir</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Total Jam</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Estimasi Biaya</th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isLoading ? (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Memuat data lembur...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Tidak ada data lembur untuk periode {periode}</td></tr>
                        ) : (
                            filtered.map((r: any) => (
                                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="px-4 py-2 font-medium">{new Date(r.tglLembur).toLocaleDateString('id-ID')}</td>
                                    <td className="px-4 py-2">{r.karyawan?.nama}</td>
                                    <td className="px-4 py-2 text-slate-500">{r.karyawan?.dept?.nmDept || '-'}</td>
                                    <td className="px-4 py-2 text-center font-mono">
                                        {r.realMulai} - {r.realAkhir}
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold text-rose-600">{parseFloat(r.totLembur).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right font-mono">{fmt(r.estimasiBiaya)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <Badge variant={r.approved ? "default" : "secondary"} className={r.approved ? "bg-emerald-100 text-emerald-700" : ""}>
                                            {r.approved ? 'Approved' : 'Pending'}
                                        </Badge>
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
