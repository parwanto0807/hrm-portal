"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TarifTER } from '@/types/payroll';
import HeaderCard from '@/components/ui/header-card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    Receipt,
    Home,
    Settings,
    Filter,
    FileText,
    Info,
} from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const fmt = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const pctFmt = (v: number) => `${(v * 100).toFixed(2)}%`;

const KATEGORI_INFO = {
    A: {
        label: 'Kategori A',
        desc: 'PTKP: TK/0 (Tidak Kawin, 0 tanggungan)',
        color: 'bg-blue-600',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
        row: 'hover:bg-blue-50 dark:hover:bg-blue-950/10',
    },
    B: {
        label: 'Kategori B',
        desc: 'PTKP: TK/1, TK/2, TK/3, K/0 (Kawin tanpa tanggungan)',
        color: 'bg-violet-600',
        badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
        row: 'hover:bg-violet-50 dark:hover:bg-violet-950/10',
    },
    C: {
        label: 'Kategori C',
        desc: 'PTKP: K/1, K/2, K/3 (Kawin dengan tanggungan)',
        color: 'bg-emerald-600',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        row: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/10',
    },
};

export default function TarifPPhPage() {
    const [filterKategori, setFilterKategori] = useState<'all' | 'A' | 'B' | 'C'>('all');
    const [filterTahun, setFilterTahun] = useState<string>('2025');

    const { data: tarifs, isLoading } = useQuery({
        queryKey: ['tarifTER', filterTahun],
        queryFn: async () => {
            const res = await api.get(`/payroll/config/tarif-ter${filterTahun ? `?tahun=${filterTahun}` : ''}`);
            return res.data.data as TarifTER[];
        }
    });

    const filtered = tarifs?.filter(t => filterKategori === 'all' || t.kategori === filterKategori) || [];

    const groupedByKat: Record<string, TarifTER[]> = {};
    filtered.forEach(t => {
        if (!groupedByKat[t.kategori]) groupedByKat[t.kategori] = [];
        groupedByKat[t.kategori].push(t);
    });

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-2 md:p-6 pb-24 md:pb-6">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">
                                <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Home className="h-3 w-3 mr-1" />Dashboard
                                </Badge>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard/settings">
                                <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Settings className="h-3 w-3 mr-1" />Pengaturan
                                </Badge>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            <Badge className="bg-amber-600 hover:bg-amber-700 text-white border-transparent">
                                Tarif TER PPh 21
                            </Badge>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="Tarif TER PPh 21"
                description="Tarif Efektif Rata-Rata (TER) untuk kalkulasi PPh 21 sesuai PMK No. 168 Tahun 2023 — berlaku 1 Januari 2024."
                icon={<Receipt className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                gradientFrom="from-amber-500"
                gradientTo="to-orange-600"
                patternText="PMK 168/2023 TARIF TER PPh 21"
            />

            {/* Regulasi info box */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-300">
                    <p className="font-semibold mb-1">Cara Kerja Metode TER (PMK 168/2023):</p>
                    <p>Bulan Jan–Nov: <code className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">PPh 21 = Penghasilan Bruto × Tarif TER</code></p>
                    <p className="mt-0.5">Bulan Des: Rekonsiliasi tahunan dengan metode progresif untuk menentukan PPh 21 final.</p>
                    <p className="mt-0.5">Kategori ditentukan oleh status PTKP karyawan (TK/0, K/0, K/1, K/2, K/3).</p>
                </div>
            </div>

            {/* Kategori Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['A', 'B', 'C'] as const).map(kat => {
                    const info = KATEGORI_INFO[kat];
                    const count = tarifs?.filter(t => t.kategori === kat).length || 0;
                    return (
                        <button
                            key={kat}
                            onClick={() => setFilterKategori(filterKategori === kat ? 'all' : kat)}
                            className={`text-left rounded-xl border-2 p-3 transition-all duration-200 ${filterKategori === kat
                                ? 'border-slate-700 dark:border-slate-300 shadow-md bg-white dark:bg-slate-800'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`h-6 w-6 rounded-lg ${info.color} flex items-center justify-center`}>
                                    <FileText className="h-3.5 w-3.5 text-white" />
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{info.label}</span>
                                <Badge className={`ml-auto text-[10px] border-0 ${info.badge}`}>{count} tarif</Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{info.desc}</p>
                        </button>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Tahun:</span>
                {['2024', '2025'].map(y => (
                    <button
                        key={y}
                        onClick={() => setFilterTahun(y)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterTahun === y
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {y}
                    </button>
                ))}
            </div>

            {/* Tarif Tables */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse h-48 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                    ))}
                </div>
            ) : Object.keys(groupedByKat).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Receipt className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-slate-500">Tidak ada tarif TER ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba jalankan seeder: node scripts/seed-tarif-ter.js</p>
                </div>
            ) : (
                Object.entries(groupedByKat).map(([kat, rows]) => {
                    const info = KATEGORI_INFO[kat as keyof typeof KATEGORI_INFO];
                    return (
                        <div key={kat} className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className={`${info.color} px-4 py-2.5 flex items-center gap-2`}>
                                <FileText className="h-4 w-4 text-white" />
                                <span className="text-white font-semibold text-sm">{info.label}</span>
                                <span className="text-white/80 text-xs">— {info.desc}</span>
                                <Badge className="ml-auto bg-white/20 text-white border-0 text-[10px]">{rows.length} baris</Badge>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                            <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">No</th>
                                            <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">Batas Bawah</th>
                                            <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">Batas Atas</th>
                                            <th className="px-3 py-2 text-right font-semibold text-slate-600 dark:text-slate-300">Tarif TER</th>
                                            <th className="px-3 py-2 text-center font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {rows.map((row, i) => (
                                            <tr key={row.id} className={`${info.row} transition-colors`}>
                                                <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">{i + 1}</td>
                                                <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">
                                                    {fmt(row.batasMin)}
                                                </td>
                                                <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">
                                                    {row.batasMax !== null ? fmt(row.batasMax) : <span className="text-slate-400 italic">Tak terbatas</span>}
                                                </td>
                                                <td className="px-3 py-1.5 text-right">
                                                    <span className={`font-bold font-mono ${info.badge.replace('bg-', 'text-').split(' ')[1]} `}>
                                                        {pctFmt(row.tarif)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-1.5 text-center">
                                                    {row.isActive ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-0 text-[9px]">Aktif</Badge>
                                                    ) : (
                                                        <Badge className="bg-slate-100 text-slate-500 border-0 text-[9px]">Nonaktif</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })
            )}

            {/* Summary */}
            {tarifs && tarifs.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                        Total <strong>{tarifs.length}</strong> baris tarif TER tahun <strong>{filterTahun}</strong> — 
                        sumber: PMK No. 168 Tahun 2023. Tarif berlaku efektif 1 Januari 2024.
                    </span>
                </div>
            )}
        </div>
    );
}
