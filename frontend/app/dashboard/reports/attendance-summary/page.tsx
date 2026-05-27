"use client";

import React, { useState, useMemo } from 'react';
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
import {
    CalendarCheck, Home, BarChart3, Download, Filter,
    Clock, UserCheck, UserX, AlertCircle, TrendingDown,
    Search, Users, ChevronRight, Gauge,
} from 'lucide-react';
import { toast } from 'sonner';
import { exportAttendanceToExcel } from '@/lib/exportPayrollExcel';
import { PayrollPeriod } from '@/types/payroll';

interface AbsensiRow {
    emplId: string;
    nik: string;
    nama: string;
    kdDept: string;
    nmDept: string;
    nmSeksie?: string;
    hrHadir: number;
    hrAlpha: number;
    hrIzin: number;
    hrSakit: number;
    hrCuti: number;
    hrLembur: number;
    totalLembur: number;
    mntLambat: number;
    mntCepat: number;
    hrKerjaNormal: number;
    persenHadir: number;
}

const STATUS_COLORS: Record<string, string> = {
    H: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40',
    A: 'bg-red-100 text-red-700 dark:bg-red-950/40',
    I: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40',
    S: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40',
    C: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40',
};

function AttendanceBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-xs w-6 text-right">{value}</span>
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export default function AttendanceSummaryPage() {
    const [selectedPeriode, setSelectedPeriode] = useState<string>('');
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('all');

    // Fetch periode
    const { data: periodes, isLoading: loadingPeriodes } = useQuery({
        queryKey: ['payrollPeriods'],
        queryFn: async () => {
            const res = await api.get('/payroll/periods?limit=60');
            return res.data.data as PayrollPeriod[];
        }
    });

    // Fetch rekap absensi untuk periode terpilih
    const { data: absensiRows, isLoading: loadingAbsensi } = useQuery({
        queryKey: ['rekapAbsensi', selectedPeriode],
        queryFn: async (): Promise<AbsensiRow[]> => {
            const periode = periodes?.find(p => String(p.id) === selectedPeriode);
            if (!periode) return [];

            // Gunakan startDate - endDate dari periode
            const res = await api.get('/attendance', {
                params: {
                    startDate: periode.startDate,
                    endDate: periode.endDate,
                    limit: 5000,
                    page: 1,
                }
            });

            const records = res.data.data || [];

            // Agregasi per karyawan
            const byEmpl: Record<string, AbsensiRow> = {};

            for (const rec of records) {
                const emplId = rec.emplId;
                if (!byEmpl[emplId]) {
                    byEmpl[emplId] = {
                        emplId,
                        nik: rec.nik || rec.karyawan?.nik || '',
                        nama: rec.nama || rec.karyawan?.nama || emplId,
                        kdDept: rec.kdDept || rec.karyawan?.dept?.kdDept || '',
                        nmDept: rec.karyawan?.dept?.nmDept || rec.kdDept || '',
                        nmSeksie: rec.karyawan?.sie?.nmSeksie || '',
                        hrHadir: 0, hrAlpha: 0, hrIzin: 0, hrSakit: 0,
                        hrCuti: 0, hrLembur: 0, totalLembur: 0,
                        mntLambat: 0, mntCepat: 0, hrKerjaNormal: 0,
                        persenHadir: 0,
                    };
                }
                const row = byEmpl[emplId];
                const kd = rec.kdAbsen || 'H';
                if (kd === 'H') row.hrHadir++;
                else if (kd === 'A') row.hrAlpha++;
                else if (kd === 'I') row.hrIzin++;
                else if (kd === 'S') row.hrSakit++;
                else if (kd === 'C' || kd === 'CT') row.hrCuti++;
                if (rec.lambat > 0) row.mntLambat += rec.lambat;
                if (rec.cepat > 0) row.mntCepat += rec.cepat;
                const totLmb = parseFloat(rec.totLmb || 0);
                if (totLmb > 0) { row.hrLembur++; row.totalLembur += totLmb; }
                row.hrKerjaNormal++;
            }

            return Object.values(byEmpl).map(r => ({
                ...r,
                persenHadir: r.hrKerjaNormal > 0 ? (r.hrHadir / r.hrKerjaNormal) * 100 : 0,
            }));
        },
        enabled: !!selectedPeriode && !!periodes,
    });

    const uniqueDepts = useMemo(() => {
        if (!absensiRows) return [];
        return [...new Set(absensiRows.map(r => r.kdDept))].map(k => ({
            kdDept: k,
            nmDept: absensiRows.find(r => r.kdDept === k)?.nmDept || k,
        }));
    }, [absensiRows]);

    const filteredRows = useMemo(() => {
        if (!absensiRows) return [];
        return absensiRows.filter(r => {
            const matchSearch = !search || r.nama.toLowerCase().includes(search.toLowerCase()) || r.emplId.toLowerCase().includes(search.toLowerCase());
            const matchDept = filterDept === 'all' || r.kdDept === filterDept;
            return matchSearch && matchDept;
        });
    }, [absensiRows, search, filterDept]);

    const totalStats = useMemo(() => ({
        hadir: filteredRows.reduce((s, r) => s + r.hrHadir, 0),
        alpha: filteredRows.reduce((s, r) => s + r.hrAlpha, 0),
        izin: filteredRows.reduce((s, r) => s + r.hrIzin, 0),
        sakit: filteredRows.reduce((s, r) => s + r.hrSakit, 0),
        cuti: filteredRows.reduce((s, r) => s + r.hrCuti, 0),
        totalLembur: filteredRows.reduce((s, r) => s + r.totalLembur, 0),
        mntLambat: filteredRows.reduce((s, r) => s + r.mntLambat, 0),
        persenHadirAvg: filteredRows.length > 0 ? filteredRows.reduce((s, r) => s + r.persenHadir, 0) / filteredRows.length : 0,
    }), [filteredRows]);

    const periode = periodes?.find(p => String(p.id) === selectedPeriode);

    const handleExport = async () => {
        if (!filteredRows.length) return toast.error('Tidak ada data untuk diekspor');
        const tid = toast.loading('Memproses Excel...');
        try {
            await exportAttendanceToExcel(filteredRows as any, periode?.name || selectedPeriode);
            toast.success('File Excel berhasil diunduh', { id: tid });
        } catch {
            toast.error('Gagal export Excel', { id: tid });
        }
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
                            <Link href="/dashboard/reports">
                                <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <BarChart3 className="h-3 w-3 mr-1" />Laporan
                                </Badge>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-transparent">Rekap Absensi</Badge>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="Rekap Laporan Absensi"
                description="Ringkasan hadir, alpha, izin, sakit, cuti, lembur, dan keterlambatan seluruh karyawan per periode."
                icon={<CalendarCheck className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                gradientFrom="from-blue-600"
                gradientTo="to-indigo-600"
                patternText="ABSENSI REKAP"
                showActionArea
                actionArea={
                    <Button onClick={handleExport} disabled={!filteredRows.length}
                        className="bg-white text-blue-700 hover:bg-blue-50 text-xs h-9 font-bold">
                        <Download className="h-3.5 w-3.5 mr-1.5" />Export Excel
                    </Button>
                }
            />

            {/* Pilih Periode */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Filter className="h-4 w-4" />
                    Pilih Periode
                </div>
                <div className="flex flex-wrap gap-2">
                    {loadingPeriodes ? (
                        <div className="flex gap-2">{[...Array(6)].map((_, i) => (
                            <div key={i} className="h-8 w-24 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                        ))}</div>
                    ) : (
                        periodes?.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPeriode(String(p.id))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedPeriode === String(p.id)
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                    }`}
                            >
                                {p.name}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Stats cards */}
            {selectedPeriode && !loadingAbsensi && filteredRows.length > 0 && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                        {[
                            { label: 'Hadir', val: totalStats.hadir, color: 'from-emerald-600 to-teal-600', icon: <UserCheck className="h-3 w-3" /> },
                            { label: 'Alpha', val: totalStats.alpha, color: 'from-red-600 to-rose-600', icon: <UserX className="h-3 w-3" /> },
                            { label: 'Izin', val: totalStats.izin, color: 'from-blue-600 to-indigo-600', icon: <AlertCircle className="h-3 w-3" /> },
                            { label: 'Sakit', val: totalStats.sakit, color: 'from-amber-600 to-orange-600', icon: <AlertCircle className="h-3 w-3" /> },
                            { label: 'Cuti', val: totalStats.cuti, color: 'from-violet-600 to-purple-600', icon: <CalendarCheck className="h-3 w-3" /> },
                            { label: 'Jam Lembur', val: totalStats.totalLembur.toFixed(1), color: 'from-slate-700 to-slate-800', icon: <Clock className="h-3 w-3" /> },
                            { label: 'Mnt Terlambat', val: totalStats.mntLambat, color: 'from-rose-700 to-pink-700', icon: <TrendingDown className="h-3 w-3" /> },
                            { label: '% Hadir Avg', val: `${totalStats.persenHadirAvg.toFixed(1)}%`, color: 'from-teal-600 to-cyan-600', icon: <Gauge className="h-3 w-3" /> },
                        ].map(s => (
                            <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} p-3 text-white`}>
                                <div className="flex items-center gap-1 opacity-80 text-[10px] mb-1">{s.icon}{s.label}</div>
                                <div className="text-lg font-black">{s.val}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama / ID..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="h-9 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={filterDept}
                            onChange={e => setFilterDept(e.target.value)}
                            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Semua Dept</option>
                            {uniqueDepts.map(d => (
                                <option key={d.kdDept} value={d.kdDept}>{d.nmDept}</option>
                            ))}
                        </select>
                        <span className="text-xs text-slate-500">{filteredRows.length} karyawan</span>
                    </div>

                    {/* Tabel Rekap */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    {['No', 'EMPL ID', 'Nama', 'Dept', 'Hadir', 'Alpha', 'Izin', 'Sakit', 'Cuti', 'Lembur(j)', 'Terlambat', '% Hadir'].map(h => (
                                        <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredRows.map((r, i) => (
                                    <tr key={r.emplId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                                        <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-300">{r.emplId}</td>
                                        <td className="px-3 py-2 font-medium text-slate-800 dark:text-white whitespace-nowrap">{r.nama}</td>
                                        <td className="px-3 py-2 text-slate-500">{r.nmDept}</td>
                                        <td className="px-3 py-2">
                                            <AttendanceBar value={r.hrHadir} max={r.hrKerjaNormal} color="bg-emerald-500" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <AttendanceBar value={r.hrAlpha} max={r.hrKerjaNormal} color="bg-red-500" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <AttendanceBar value={r.hrIzin} max={r.hrKerjaNormal} color="bg-blue-500" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <AttendanceBar value={r.hrSakit} max={r.hrKerjaNormal} color="bg-amber-500" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <AttendanceBar value={r.hrCuti} max={r.hrKerjaNormal} color="bg-violet-500" />
                                        </td>
                                        <td className="px-3 py-2 font-mono text-slate-600">{r.totalLembur.toFixed(1)}</td>
                                        <td className="px-3 py-2">
                                            {r.mntLambat > 0 ? (
                                                <Badge className="bg-rose-100 text-rose-700 border-0 text-[10px]">{r.mntLambat} mnt</Badge>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${r.persenHadir >= 90 ? 'bg-emerald-500' : r.persenHadir >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${r.persenHadir}%` }}
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-bold ${r.persenHadir >= 90 ? 'text-emerald-600' : r.persenHadir >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {r.persenHadir.toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {loadingAbsensi && selectedPeriode && (
                <div className="space-y-2">
                    {[...Array(8)].map((_, i) => <div key={i} className="animate-pulse h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />)}
                </div>
            )}

            {!selectedPeriode && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center mb-4">
                        <CalendarCheck className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 dark:text-slate-300">Pilih Periode Absensi</p>
                    <p className="text-sm text-slate-500 mt-1">Data absensi akan dikumpulkan dan diagregasi per karyawan</p>
                </div>
            )}
        </div>
    );
}
