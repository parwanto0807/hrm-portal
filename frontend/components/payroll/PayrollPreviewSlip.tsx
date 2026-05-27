"use client";

import React from 'react';
import { PayrollPreviewResult } from '@/types/payroll';
import {
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    TrendingDown,
    Building2,
    User,
    Calendar,
    Clock,
    Banknote,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PayrollPreviewSlipProps {
    data: PayrollPreviewResult;
}

const fmt = (v: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(v || 0);

const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

interface RowProps {
    label: string;
    value: number;
    sub?: string;
    highlight?: boolean;
}

function Row({ label, value, sub, highlight }: RowProps) {
    if (!value) return null;
    return (
        <div className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-sm ${highlight ? 'bg-slate-50 dark:bg-slate-800/60 font-semibold' : ''}`}>
            <div>
                <span className="text-slate-700 dark:text-slate-300">{label}</span>
                {sub && <span className="ml-1.5 text-[10px] text-slate-400">{sub}</span>}
            </div>
            <span className={`font-mono text-xs ${highlight ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                {fmt(value)}
            </span>
        </div>
    );
}

export function PayrollPreviewSlip({ data }: PayrollPreviewSlipProps) {
    const validasi = data.validasi || {};

    return (
        <div className="space-y-4">
            {/* Validasi Warnings */}
            {(validasi.gajiBawahUMK || validasi.missingKonfigBpjs || validasi.missingTarifTER) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 p-3 space-y-1">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs mb-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        Peringatan Validasi
                    </div>
                    {validasi.gajiBawahUMK && (
                        <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                            Gaji pokok di bawah UMK — periksa data karyawan
                        </p>
                    )}
                    {validasi.missingKonfigBpjs && (
                        <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                            Konfigurasi BPJS belum diset untuk perusahaan ini
                        </p>
                    )}
                    {validasi.missingTarifTER && (
                        <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                            Tarif TER PPh 21 tidak ditemukan untuk tahun ini
                        </p>
                    )}
                </div>
            )}

            {/* Info Karyawan */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-800/30">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <User className="h-3 w-3 text-slate-400" />
                        <span className="font-medium">{data.karyawan?.nama}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{data.periode?.nama}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        NIK: {data.karyawan?.nik}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Clock className="h-3 w-3 text-slate-400" />
                        Lembur: {data.totJLembur ?? 0} jam
                    </div>
                </div>
                {/* Pro-rata bar */}
                {data.hrKerjaNormal > 0 && (
                    <div className="mt-2.5">
                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                            <span>Hari Kerja Aktual</span>
                            <span>{data.hrKerja}/{data.hrKerjaNormal} hari</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                style={{ width: `${Math.min(100, (data.hrKerja / data.hrKerjaNormal) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Kolom 2: Pendapatan & Potongan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* A. Pendapatan */}
                <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-white" />
                        <span className="text-white font-semibold text-sm">A. Pendapatan</span>
                    </div>
                    <div className="p-2 space-y-0.5">
                        <Row label="Gaji Pokok" value={data.pokokBln} />
                        {data.pokokTrm !== data.pokokBln && (
                            <Row label="Upah Dibayarkan (Pro-Rata)" value={data.pokokTrm} highlight />
                        )}
                        <Row label="Tunjangan Jabatan" value={data.tJabatan} />
                        <Row label="Tunjangan Transport" value={data.tTransport} />
                        <Row label="Tunjangan Makan" value={data.tMakan} />
                        <Row label="Tunjangan Khusus" value={data.tKhusus} />
                        <Row label="Uang Shift" value={data.totUShift} />
                        <Row label="Upah Lembur" value={data.totULembur} sub={`${data.totJLembur ?? 0}j`} />
                        <Row label="THR" value={data.thr} />
                        <Row label="Tunjangan Lain" value={data.tunjLain} />
                        <div className="border-t border-emerald-100 dark:border-emerald-900/40 mt-1 pt-1">
                            <Row label="JUMLAH A" value={data.gKotor} highlight />
                        </div>
                    </div>
                </div>

                {/* B. Potongan */}
                <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/40 overflow-hidden">
                    <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-3 py-2 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-white" />
                        <span className="text-white font-semibold text-sm">B. Potongan</span>
                    </div>
                    <div className="p-2 space-y-0.5">
                        {/* BPJS Karyawan */}
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-2 pt-1">BPJS Ketenagakerjaan (Karyawan)</p>
                        <Row label="JHT" value={data.jhtEmpl} sub="2%" />
                        <Row label="Jaminan Pensiun" value={data.jpnEmpl} sub="1%" />
                        {/* BPJS Kesehatan */}
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-2 pt-1">BPJS Kesehatan (Karyawan)</p>
                        <Row label="JKN" value={data.jknEmpl} sub="1%" />
                        {/* PPh 21 */}
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-2 pt-1">Pajak</p>
                        <Row label="PPh 21 (TER)" value={data.tPph21} />
                        {data.pphEmpl > 0 && <Row label="PPh Karyawan" value={data.pphEmpl} />}
                        {/* Potongan Lain */}
                        {(data.potAbsen > 0 || data.pinjam > 0 || data.koperasi > 0) && (
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-2 pt-1">Potongan Lain</p>
                        )}
                        <Row label="Potongan Absensi" value={data.potAbsen} />
                        <Row label="Angsuran Pinjaman" value={data.pinjam} />
                        <Row label="Iuran Koperasi" value={data.koperasi} />
                        <Row label="Potongan Lain" value={data.potLain} />
                        <div className="border-t border-rose-100 dark:border-rose-900/40 mt-1 pt-1">
                            <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 font-semibold text-sm">
                                <span className="text-slate-700 dark:text-slate-300">JUMLAH B</span>
                                <span className="font-mono text-xs text-slate-900 dark:text-white">
                                    {fmt((data.jhtEmpl || 0) + (data.jpnEmpl || 0) + (data.jknEmpl || 0) + (data.tPph21 || 0) + (data.pphEmpl || 0) + (data.potAbsen || 0) + (data.pinjam || 0) + (data.koperasi || 0) + (data.potLain || 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BPJS Perusahaan (info) */}
            <div className="rounded-xl border border-blue-200/70 dark:border-blue-900/40 p-3">
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">BPJS Ditanggung Perusahaan (Info)</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
                    {[
                        { label: 'JHT', value: data.jhtPerush, sub: '3.7%' },
                        { label: 'JKK', value: data.jkkPerush, sub: '0.24%' },
                        { label: 'JKM', value: data.jkmPerush, sub: '0.3%' },
                        { label: 'JP', value: data.jpnPerush, sub: '2%' },
                        { label: 'JKN', value: data.jknPerush, sub: '4%' },
                    ].map(item => (
                        <div key={item.label} className="text-center p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                            <div className="font-bold text-blue-700 dark:text-blue-300">{item.label}</div>
                            <div className="text-slate-500 dark:text-slate-400">{item.sub}</div>
                            <div className="font-mono text-[9px] text-blue-600 dark:text-blue-400 mt-0.5">{fmt(item.value)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gaji Bersih */}
            <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between shadow-lg shadow-emerald-500/20">
                <div className="flex items-center gap-2 text-white">
                    <Banknote className="h-5 w-5" />
                    <span className="font-bold text-sm">GAJI BERSIH (THP)</span>
                </div>
                <div className="text-right">
                    <div className="text-xl font-black text-white tracking-tight">{fmt(data.gBersih)}</div>
                    <div className="text-emerald-100 text-[10px]">A - B = Gaji Dibayarkan</div>
                </div>
            </div>
        </div>
    );
}
