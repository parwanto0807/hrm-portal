"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import HeaderCard from '@/components/ui/header-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, FileText, Download, Search } from 'lucide-react';
import { toast } from 'sonner';

const fmt = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);

export default function Pph21AnnualPage() {
    const [tahun, setTahun] = useState<string>(new Date().getFullYear().toString());
    const [search, setSearch] = useState('');

    const { data: pphData, isLoading } = useQuery({
        queryKey: ['pph21Report', tahun],
        queryFn: async () => {
            const res = await api.get(`/reports/pph21?tahun=${tahun}`);
            return res.data.data;
        }
    });

    const filtered = pphData?.filter((k: any) => 
        !search || k.nama?.toLowerCase().includes(search.toLowerCase()) || k.nik?.includes(search)
    ) || [];

    const handleExport = () => {
        toast.info('Fitur ekspor SPT 1721-A1 Excel akan diintegrasikan dengan SheetJS.');
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
                        <BreadcrumbLink asChild><Link href="/dashboard/reports"><Badge variant="outline"><FileText className="h-3 w-3 mr-1" />Laporan</Badge></Link></BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage><Badge className="bg-amber-600 hover:bg-amber-700 text-white border-transparent">Rekap PPh 21</Badge></BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="Rekap PPh 21 Tahunan"
                description="Agregasi penghasilan bruto dan potongan PPh 21 per karyawan selama satu tahun berjalan (Form 1721-A1)."
                icon={<FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                gradientFrom="from-amber-600"
                gradientTo="to-orange-600"
                patternText="PPH21 ANNUAL"
                showActionArea
                actionArea={
                    <Button onClick={handleExport} className="bg-white text-amber-700 hover:bg-amber-50 text-xs h-9 font-bold">
                        <Download className="h-3.5 w-3.5 mr-1.5" />Export 1721-A1
                    </Button>
                }
            />

            <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari NIK / Nama..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-9 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>
                <select
                    value={tahun}
                    onChange={e => setTahun(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                </select>
                <span className="text-xs text-slate-500 ml-auto">{filtered.length} wajib pajak</span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">EMPL ID</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">NIK (NPWP)</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Nama</th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">Bulan Aktif</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Total Penghasilan Bruto</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Total PPh 21 Dipotong</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isLoading ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Kalkulasi PPh 21...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Tidak ada data payroll PPh21 untuk tahun {tahun}</td></tr>
                        ) : (
                            filtered.map((r: any) => (
                                <tr key={r.emplId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-300">{r.emplId}</td>
                                    <td className="px-4 py-2 font-mono">{r.nik || '-'}</td>
                                    <td className="px-4 py-2 font-medium">{r.nama}</td>
                                    <td className="px-4 py-2 text-center text-slate-500">{r.bulanAktif} bln</td>
                                    <td className="px-4 py-2 text-right font-mono">{fmt(r.totalBruto)}</td>
                                    <td className="px-4 py-2 text-right font-mono text-amber-600 font-bold">{fmt(r.totalPph21)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
