"use client";

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { KontrakKaryawan } from '@/types/payroll';
import HeaderCard from '@/components/ui/header-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    FileText, Home, Users, AlertTriangle, CheckCircle2,
    XCircle, Clock, Search, Filter, ChevronRight,
    CalendarDays, User, Building2, Download,
} from 'lucide-react';
import { toast } from 'sonner';

type ContractStatus = 'active' | 'expiring_soon' | 'expired' | 'permanent';

function computeStatus(tglAkhir: string | undefined): ContractStatus {
    if (!tglAkhir) return 'permanent';
    const end = new Date(tglAkhir);
    const today = new Date();
    if (isBefore(end, today)) return 'expired';
    if (isBefore(end, addDays(today, 90))) return 'expiring_soon';
    return 'active';
}

function computeDaysLeft(tglAkhir: string | undefined): number | null {
    if (!tglAkhir) return null;
    return differenceInDays(new Date(tglAkhir), new Date());
}

const STATUS_CONFIG: Record<ContractStatus, {
    label: string;
    color: string;
    badgeColor: string;
    icon: React.ReactNode;
    borderColor: string;
}> = {
    active: {
        label: 'Aktif',
        color: 'bg-emerald-600',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        borderColor: 'border-l-emerald-500',
    },
    expiring_soon: {
        label: 'Segera Habis',
        color: 'bg-amber-600',
        badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
        borderColor: 'border-l-amber-500',
    },
    expired: {
        label: 'Kedaluwarsa',
        color: 'bg-red-600',
        badgeColor: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
        icon: <XCircle className="h-3.5 w-3.5" />,
        borderColor: 'border-l-red-500',
    },
    permanent: {
        label: 'Karyawan Tetap',
        color: 'bg-blue-600',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        borderColor: 'border-l-blue-500',
    },
};

export default function ContractsPage() {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<ContractStatus | 'all'>('all');
    const [filterDept, setFilterDept] = useState('all');
    const [selectedContract, setSelectedContract] = useState<KontrakKaryawan | null>(null);

    const { data: contracts, isLoading } = useQuery({
        queryKey: ['contracts'],
        queryFn: async () => {
            const res = await api.get('/employees/contracts');
            const rows = res.data.data as KontrakKaryawan[];
            return rows.map(r => ({
                ...r,
                status: computeStatus(r.tglAkhir),
                daysLeft: computeDaysLeft(r.tglAkhir),
            }));
        },
        staleTime: 60_000,
    });

    const uniqueDepts = useMemo(() => {
        if (!contracts) return [];
        return [...new Set(contracts.map(c => c.karyawan?.dept?.nmDept || ''))].filter(Boolean).map(d => ({ label: d }));
    }, [contracts]);

    const filtered = useMemo(() => {
        if (!contracts) return [];
        return contracts.filter(c => {
            const matchSearch = !search
                || c.karyawan?.nama?.toLowerCase().includes(search.toLowerCase())
                || c.emplId?.toLowerCase().includes(search.toLowerCase())
                || c.nik?.includes(search);
            const matchStatus = filterStatus === 'all' || c.status === filterStatus;
            const matchDept = filterDept === 'all' || c.karyawan?.dept?.nmDept === filterDept;
            return matchSearch && matchStatus && matchDept;
        });
    }, [contracts, search, filterStatus, filterDept]);

    // Stats
    const stats = useMemo(() => ({
        all: contracts?.length || 0,
        active: contracts?.filter(c => c.status === 'active').length || 0,
        expiring: contracts?.filter(c => c.status === 'expiring_soon').length || 0,
        expired: contracts?.filter(c => c.status === 'expired').length || 0,
        permanent: contracts?.filter(c => c.status === 'permanent').length || 0,
    }), [contracts]);

    const handleExportCSV = () => {
        if (!filtered.length) return toast.error('Tidak ada data');
        const headers = ['EMPL ID', 'NIK', 'Nama', 'Dept', 'Jabatan', 'Tgl Mulai', 'Tgl Akhir', 'Sisa Hari', 'Status', 'Keterangan'];
        const rows = filtered.map(c => [
            c.emplId, c.nik || '', c.karyawan?.nama || '',
            c.karyawan?.dept?.nmDept || '',
            c.karyawan?.jabatan?.nmJab || '',
            format(new Date(c.tglMulai), 'dd/MM/yyyy'),
            c.tglAkhir ? format(new Date(c.tglAkhir), 'dd/MM/yyyy') : 'Permanen',
            c.daysLeft !== null ? c.daysLeft : '-',
            STATUS_CONFIG[c.status!]?.label || '',
            c.keterangan || '',
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Monitor_Kontrak_PKWT_${format(new Date(), 'yyyyMMdd')}.csv`;
        a.click();
        toast.success('CSV berhasil diunduh');
    };

    return (
        <div className="flex flex-col gap-4 md:gap-5 p-2 md:p-6 pb-24">
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
                            <Link href="/dashboard/employees">
                                <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Users className="h-3 w-3 mr-1" />Karyawan
                                </Badge>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            <Badge className="bg-violet-600 hover:bg-violet-700 text-white border-transparent">
                                Monitor Kontrak PKWT
                            </Badge>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="Monitor Kontrak PKWT"
                description="Pantau status kontrak karyawan PKWT — deteksi yang segera habis atau sudah kedaluwarsa untuk tindakan perpanjangan."
                icon={<FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                gradientFrom="from-violet-600"
                gradientTo="to-purple-600"
                patternText="PKWT CONTRACT"
                showActionArea
                actionArea={
                    <Button onClick={handleExportCSV}
                        className="bg-white text-violet-700 hover:bg-violet-50 text-xs h-9 font-bold">
                        <Download className="h-3.5 w-3.5 mr-1.5" />Export CSV
                    </Button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                    { label: 'Total Kontrak', val: stats.all, status: 'all', color: 'bg-slate-700' },
                    { label: 'Aktif', val: stats.active, status: 'active', color: 'bg-emerald-600' },
                    { label: 'Segera Habis', val: stats.expiring, status: 'expiring_soon', color: 'bg-amber-600' },
                    { label: 'Kedaluwarsa', val: stats.expired, status: 'expired', color: 'bg-red-600' },
                    { label: 'Kary. Tetap', val: stats.permanent, status: 'permanent', color: 'bg-blue-600' },
                ].map(s => (
                    <button
                        key={s.status}
                        onClick={() => setFilterStatus(filterStatus === s.status ? 'all' : s.status as any)}
                        className={`rounded-xl border-2 p-3 text-center transition-all duration-200 ${filterStatus === s.status
                            ? `${s.color} text-white border-transparent shadow-lg`
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <div className={`text-2xl font-black ${filterStatus === s.status ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                            {s.val}
                        </div>
                        <div className={`text-xs mt-0.5 ${filterStatus === s.status ? 'text-white/80' : 'text-slate-500'}`}>
                            {s.label}
                        </div>
                    </button>
                ))}
            </div>

            {/* Alert: kontrak segera habis */}
            {stats.expiring > 0 && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 animate-in fade-in">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            {stats.expiring} kontrak akan habis dalam 90 hari
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            Segera tindak lanjuti perpanjangan atau pengangkatan karyawan tetap sesuai UU Ketenagakerjaan Pasal 59 (maks 2 periode PKWT).
                        </p>
                    </div>
                </div>
            )}
            {stats.expired > 0 && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                            {stats.expired} kontrak sudah kedaluwarsa
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                            Karyawan dengan kontrak kedaluwarsa berpotensi menjadi karyawan tetap by law (Pasal 59 ayat 7 UU No. 13/2003 jo. UU Cipta Kerja).
                        </p>
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama / EMPL ID / NIK..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-9 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </div>
                <select
                    value={filterDept}
                    onChange={e => setFilterDept(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                    <option value="all">Semua Dept</option>
                    {uniqueDepts.map(d => (
                        <option key={d.label} value={d.label}>{d.label}</option>
                    ))}
                </select>
                <span className="text-xs text-slate-500 ml-auto">{filtered.length} kontrak ditampilkan</span>
            </div>

            {/* Contract List */}
            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse h-20 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-slate-500">Tidak ada kontrak ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ubah filter atau tambahkan data kontrak karyawan</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(c => {
                        const cfg = STATUS_CONFIG[c.status!] || STATUS_CONFIG.active;
                        return (
                            <div
                                key={c.id}
                                className={`rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${cfg.borderColor} cursor-pointer`}
                                onClick={() => setSelectedContract(selectedContract?.id === c.id ? null : c)}
                            >
                                <div className="flex items-center gap-4 p-4">
                                    {/* Status dot */}
                                    <div className={`h-10 w-10 rounded-full ${cfg.color} flex items-center justify-center text-white flex-shrink-0`}>
                                        {cfg.icon}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white">{c.karyawan?.nama}</span>
                                            <Badge className={`text-[10px] border-0 ${cfg.badgeColor}`}>{cfg.label}</Badge>
                                            <Badge className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-0">{c.emplId}</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Building2 className="h-3 w-3" />
                                                {c.karyawan?.dept?.nmDept || '-'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {c.karyawan?.jabatan?.nmJab || '-'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="h-3 w-3" />
                                                {format(new Date(c.tglMulai), 'd MMM yyyy', { locale: localeId })}
                                                {' → '}
                                                {c.tglAkhir
                                                    ? format(new Date(c.tglAkhir), 'd MMM yyyy', { locale: localeId })
                                                    : <span className="text-blue-500 font-medium">Permanen</span>
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Days left */}
                                    <div className="text-right flex-shrink-0">
                                        {c.daysLeft !== null ? (
                                            <>
                                                <div className={`text-2xl font-black ${c.daysLeft < 0 ? 'text-red-600' : c.daysLeft < 90 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                    {c.daysLeft < 0 ? Math.abs(c.daysLeft) : c.daysLeft}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {c.daysLeft < 0 ? 'hari lalu' : 'hari lagi'}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-xs font-semibold text-blue-500">∞</div>
                                        )}
                                    </div>

                                    <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${selectedContract?.id === c.id ? 'rotate-90' : ''}`} />
                                </div>

                                {/* Expanded detail */}
                                {selectedContract?.id === c.id && (
                                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-0 animate-in fade-in slide-in-from-top-1">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 text-xs">
                                            <div><span className="text-slate-500">NIK:</span> <span className="font-mono">{c.nik || c.karyawan?.nik || '-'}</span></div>
                                            <div><span className="text-slate-500">Seksi:</span> <span>{c.karyawan?.sie?.nmSeksie || '-'}</span></div>
                                            <div><span className="text-slate-500">Status Karyawan:</span> <span>{c.karyawan?.kdJns || '-'}</span></div>
                                            {c.keterangan && (
                                                <div className="col-span-3">
                                                    <span className="text-slate-500">Keterangan:</span>{' '}
                                                    <span className="italic text-slate-700 dark:text-slate-300">{c.keterangan}</span>
                                                </div>
                                            )}
                                        </div>
                                        {c.status === 'expiring_soon' && (
                                            <div className="mt-2 flex gap-2">
                                                <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white">
                                                    Perpanjang Kontrak
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-7 text-xs border-blue-300 text-blue-700">
                                                    Angkat Karyawan Tetap
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
