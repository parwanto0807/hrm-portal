"use client";

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PayrollPeriod, RekapPayrollRow, RekapPayrollSummary } from '@/types/payroll';
import HeaderCard from '@/components/ui/header-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    FileSpreadsheet, Home, BarChart3, Download, Filter,
    TrendingUp, TrendingDown, Users, Banknote, ShieldCheck,
    Receipt, ChevronDown, ChevronUp, Search, Building2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { exportPayrollToExcel } from '@/lib/exportPayrollExcel';

const fmt = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);

const fmtK = (v: number) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
    if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}Jt`;
    if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}Rb`;
    return fmt(v);
};

export default function PayrollSummaryPage() {
    const [selectedPeriode, setSelectedPeriode] = useState<string>('');
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('all');
    const [expandedDept, setExpandedDept] = useState<string | null>(null);
    const [showTable, setShowTable] = useState(false);

    // Fetch semua periode payroll
    const { data: periodes, isLoading: loadingPeriodes } = useQuery({
        queryKey: ['payrollPeriods'],
        queryFn: async () => {
            const res = await api.get('/payroll/periods?limit=60');
            return res.data.data as PayrollPeriod[];
        }
    });

    // Fetch rekap berdasarkan periode terpilih
    const { data: rekapData, isLoading: loadingRekap } = useQuery({
        queryKey: ['rekapPayroll', selectedPeriode],
        queryFn: async () => {
            const res = await api.get(`/payroll/periods/${selectedPeriode}/details`);
            // Transform data dari detail API ke format rekap
            const rawEmployees = res.data.data.employees || [];
            const rawSummary = res.data.data.summary;

            const rows: RekapPayrollRow[] = rawEmployees.map((e: any) => ({
                emplId: e.employeeId || e.emplId,
                nik: e.employeeIdNumber || e.nik || '',
                nama: e.employeeName || e.nama || '',
                kdDept: e.kdDept || '',
                nmDept: e.department || '',
                kdSeksie: e.kdSeksie || '',
                nmSeksie: e.section || '',
                kdJab: e.kdJab || '',
                nmJab: e.position || '',
                pokokBln: e.baseSalary || 0,
                pokokTrm: e.pokokTrm || e.baseSalary || 0,
                tJabatan: e.allowances?.tJabatan || 0,
                tTransport: e.allowances?.tTransport || e.allowances?.transport || 0,
                tMakan: e.allowances?.tMakan || e.allowances?.meal || 0,
                totUShift: e.allowances?.totUShift || 0,
                totULembur: e.allowances?.lembur || e.allowances?.overtime || 0,
                totJLembur: e.lemburHours || 0,
                thr: e.allowances?.thr || 0,
                tunjLain: e.allowances?.tLain || e.allowances?.other || 0,
                gKotor: e.grossSalary || 0,
                jhtEmpl: e.deductions?.jht || 0,
                jpnEmpl: e.deductions?.jpn || 0,
                jknEmpl: e.deductions?.bpjs || 0,
                tPph21: e.deductions?.pph21 || e.deductions?.tax || 0,
                potAbsen: e.deductions?.potAbsen || 0,
                pinjam: e.deductions?.potPinjaman || e.deductions?.loan || 0,
                koperasi: e.deductions?.iuranKoperasi || 0,
                potLain: e.deductions?.lain || e.deductions?.other || 0,
                totPotong: e.totalDeductions || 0,
                gBersih: e.netSalary || 0,
                jhtPerush: 0, jkkPerush: 0, jkmPerush: 0, jpnPerush: 0, jknPerush: 0,
                closing: e.status === 'Paid',
                kdSts: e.kdSts,
            }));

            const byDept = Object.values(
                rows.reduce((acc: Record<string, any>, r) => {
                    if (!acc[r.kdDept]) acc[r.kdDept] = {
                        kdDept: r.kdDept, nmDept: r.nmDept, count: 0, totalGKotor: 0, totalGBersih: 0
                    };
                    acc[r.kdDept].count++;
                    acc[r.kdDept].totalGKotor += r.gKotor;
                    acc[r.kdDept].totalGBersih += r.gBersih;
                    return acc;
                }, {})
            );

            const summary: RekapPayrollSummary = {
                periode: {
                    periodeId: rawSummary?.period?.id || selectedPeriode,
                    periodeNama: rawSummary?.period?.name || selectedPeriode,
                    status: rawSummary?.period?.status || 'Open',
                },
                totalKaryawan: rows.length,
                totalGKotor: rows.reduce((s, r) => s + r.gKotor, 0),
                totalGBersih: rows.reduce((s, r) => s + r.gBersih, 0),
                totalBpjsTk: rows.reduce((s, r) => s + r.jhtEmpl + r.jpnEmpl, 0),
                totalBpjsKes: rows.reduce((s, r) => s + r.jknEmpl, 0),
                totalPph21: rows.reduce((s, r) => s + r.tPph21, 0),
                totalPotong: rows.reduce((s, r) => s + r.totPotong, 0),
                totalBpjsPerush: rows.reduce((s, r) => s + r.jhtPerush + r.jkkPerush + r.jkmPerush + r.jpnPerush + r.jknPerush, 0),
                byDept: byDept as RekapPayrollSummary['byDept'],
            };

            return { rows, summary };
        },
        enabled: !!selectedPeriode,
    });

    const filteredRows = useMemo(() => {
        if (!rekapData?.rows) return [];
        return rekapData.rows.filter(r => {
            const matchSearch = !search || r.nama.toLowerCase().includes(search.toLowerCase()) || r.emplId.toLowerCase().includes(search.toLowerCase()) || r.nik.includes(search);
            const matchDept = filterDept === 'all' || r.kdDept === filterDept;
            return matchSearch && matchDept;
        });
    }, [rekapData?.rows, search, filterDept]);

    const uniqueDepts = useMemo(() => {
        if (!rekapData?.rows) return [];
        return [...new Set(rekapData.rows.map(r => r.kdDept))].map(k => ({
            kdDept: k,
            nmDept: rekapData.rows.find(r => r.kdDept === k)?.nmDept || k,
        }));
    }, [rekapData?.rows]);

    const handleExport = async () => {
        if (!rekapData) return toast.error('Belum ada data untuk diekspor');
        const tid = toast.loading('Memproses Excel...');
        try {
            await exportPayrollToExcel(filteredRows, rekapData.summary);
            toast.success('File Excel berhasil diunduh', { id: tid });
        } catch {
            toast.error('Gagal export Excel — pastikan library xlsx tersedia', { id: tid });
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
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent">
                                Rekap Payroll
                            </Badge>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="Rekap Laporan Payroll"
                description="Ringkasan gaji, potongan BPJS, PPh 21, dan THP seluruh karyawan per periode. Export ke Excel multi-sheet."
                icon={<FileSpreadsheet className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                gradientFrom="from-emerald-600"
                gradientTo="to-teal-600"
                patternText="PAYROLL REKAP"
                showActionArea
                actionArea={
                    <Button
                        onClick={handleExport}
                        disabled={!rekapData}
                        className="bg-white text-emerald-700 hover:bg-emerald-50 text-xs h-9 font-bold"
                    >
                        <Download className="h-3.5 w-3.5 mr-1.5" />Export Excel
                    </Button>
                }
            />

            {/* Pilih Periode */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Filter className="h-4 w-4" />
                    Pilih Periode Payroll
                </div>
                <div className="flex flex-wrap gap-2">
                    {loadingPeriodes ? (
                        <div className="flex gap-2">{[...Array(6)].map((_, i) => (
                            <div key={i} className="h-8 w-24 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                        ))}</div>
                    ) : periodes?.length === 0 ? (
                        <p className="text-sm text-slate-500">Belum ada periode payroll</p>
                    ) : (
                        periodes?.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPeriode(String(p.id))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedPeriode === String(p.id)
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                                    }`}
                            >
                                {p.name}
                                <span className={`ml-1.5 text-[10px] ${selectedPeriode === String(p.id) ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {p.status}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            {loadingRekap && selectedPeriode && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                    ))}
                </div>
            )}

            {rekapData && !loadingRekap && (
                <>
                    {/* Summary Tiles */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { icon: <Users className="h-4 w-4" />, label: 'Total Karyawan', value: String(filteredRows.length), color: 'from-blue-600 to-indigo-600', sub: `dari ${rekapData.summary.totalKaryawan} orang` },
                            { icon: <TrendingUp className="h-4 w-4" />, label: 'Total Gaji Kotor', value: fmtK(filteredRows.reduce((s, r) => s + r.gKotor, 0)), color: 'from-violet-600 to-purple-600', sub: 'Sebelum potongan' },
                            { icon: <TrendingDown className="h-4 w-4" />, label: 'Total Potongan', value: fmtK(filteredRows.reduce((s, r) => s + r.totPotong, 0)), color: 'from-rose-600 to-pink-600', sub: 'BPJS + PPh 21 + Lain' },
                            { icon: <Banknote className="h-4 w-4" />, label: 'Total THP', value: fmtK(filteredRows.reduce((s, r) => s + r.gBersih, 0)), color: 'from-emerald-600 to-teal-600', sub: 'Take Home Pay' },
                        ].map((item, i) => (
                            <div key={i} className={`rounded-2xl bg-gradient-to-br ${item.color} p-4 text-white shadow-lg`}>
                                <div className="flex items-center gap-2 mb-2 opacity-80">
                                    {item.icon}
                                    <span className="text-xs font-medium">{item.label}</span>
                                </div>
                                <div className="text-xl font-black">{item.value}</div>
                                <div className="text-xs opacity-70 mt-0.5">{item.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Rincian BPJS & PPh */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {[
                            { label: 'BPJS TK (Kryw)', value: rekapData.summary.totalBpjsTk, icon: <ShieldCheck className="h-3.5 w-3.5" />, color: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300' },
                            { label: 'BPJS Kes (Kryw)', value: rekapData.summary.totalBpjsKes, icon: <ShieldCheck className="h-3.5 w-3.5" />, color: 'border-teal-200 bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300' },
                            { label: 'PPh 21', value: rekapData.summary.totalPph21, icon: <Receipt className="h-3.5 w-3.5" />, color: 'border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300' },
                            { label: 'BPJS Perusahaan', value: rekapData.summary.totalBpjsPerush, icon: <Building2 className="h-3.5 w-3.5" />, color: 'border-violet-200 bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300' },
                            { label: 'Total Potongan', value: rekapData.summary.totalPotong, icon: <TrendingDown className="h-3.5 w-3.5" />, color: 'border-rose-200 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300' },
                        ].map(item => (
                            <div key={item.label} className={`rounded-xl border p-3 flex flex-col gap-1 ${item.color}`}>
                                <div className="flex items-center gap-1.5 text-xs font-medium opacity-80">{item.icon}{item.label}</div>
                                <div className="text-sm font-bold font-mono">{fmtK(item.value)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Per Departemen */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2.5 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-white" />
                            <span className="text-white font-semibold text-sm">Distribusi Per Departemen</span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {rekapData.summary.byDept.map(dept => (
                                <button
                                    key={dept.kdDept}
                                    onClick={() => {
                                        setExpandedDept(expandedDept === dept.kdDept ? null : dept.kdDept);
                                        setFilterDept(expandedDept === dept.kdDept ? 'all' : dept.kdDept);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {dept.kdDept}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-800 dark:text-white">{dept.nmDept}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{dept.count} karyawan</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-right">
                                        <div>
                                            <div className="text-xs text-slate-500">Gaji Kotor</div>
                                            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{fmtK(dept.totalGKotor)}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500">THP</div>
                                            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{fmtK(dept.totalGBersih)}</div>
                                        </div>
                                        <div className="relative w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                                            <div
                                                className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${Math.min(100, (dept.totalGBersih / rekapData.summary.totalGBersih) * 100 * 4)}%` }}
                                            />
                                        </div>
                                        {expandedDept === dept.kdDept
                                            ? <ChevronUp className="h-4 w-4 text-slate-400" />
                                            : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter & Tabel Detail */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama / ID..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="h-9 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                {filterDept !== 'all' && (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs cursor-pointer" onClick={() => setFilterDept('all')}>
                                        {uniqueDepts.find(d => d.kdDept === filterDept)?.nmDept} ✕
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">{filteredRows.length} karyawan</span>
                                <Button size="sm" variant="outline" onClick={() => setShowTable(!showTable)} className="h-8 text-xs">
                                    {showTable ? <ChevronUp className="h-3.5 w-3.5 mr-1" /> : <ChevronDown className="h-3.5 w-3.5 mr-1" />}
                                    {showTable ? 'Sembunyikan' : 'Tampilkan'} Detail
                                </Button>
                            </div>
                        </div>

                        {showTable && (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                            {['No', 'EMPL ID', 'Nama', 'Dept', 'Seksie', 'Gaji Pokok', 'G. Kotor', 'Potongan', 'THP', 'Status'].map(h => (
                                                <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredRows.map((r, i) => (
                                            <tr key={r.emplId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                                                <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300">{r.emplId}</td>
                                                <td className="px-3 py-2 font-medium text-slate-800 dark:text-white whitespace-nowrap">{r.nama}</td>
                                                <td className="px-3 py-2 text-slate-500">{r.nmDept}</td>
                                                <td className="px-3 py-2 text-slate-500">{r.nmSeksie}</td>
                                                <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-300">{fmt(r.pokokBln)}</td>
                                                <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-200">{fmt(r.gKotor)}</td>
                                                <td className="px-3 py-2 font-mono text-rose-600 dark:text-rose-400">{fmt(r.totPotong)}</td>
                                                <td className="px-3 py-2 font-mono font-bold text-emerald-600 dark:text-emerald-400">{fmt(r.gBersih)}</td>
                                                <td className="px-3 py-2">
                                                    <Badge className={`text-[10px] border-0 ${r.closing ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {r.closing ? 'Closed' : 'Open'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {!selectedPeriode && !loadingPeriodes && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-4">
                        <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 dark:text-slate-300">Pilih Periode Payroll</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Klik salah satu periode di atas untuk memuat rekap gaji</p>
                </div>
            )}
        </div>
    );
}
