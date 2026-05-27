"use client";

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PayrollCalculateResult, PayrollPreviewResult } from '@/types/payroll';
import { Button } from '@/components/ui/button';
import {
    Play,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Eye,
    X,
    Lock,
    Unlock,
    Users,
    TrendingUp,
    AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { PayrollPreviewSlip } from '@/components/payroll/PayrollPreviewSlip';

const fmt = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);

interface PayrollCalculatePanelProps {
    periodeId: string;
    isClosed: boolean;
    userRole: string;
    totalEmployees: number;
    onRefresh: () => void;
}

interface EmployeePreviewModalProps {
    periodeId: string;
    emplId: string;
    onClose: () => void;
}

function EmployeePreviewModal({ periodeId, emplId, onClose }: EmployeePreviewModalProps) {
    const [data, setData] = React.useState<PayrollPreviewResult | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        api.get(`/payroll/periods/${periodeId}/preview/${emplId}`)
            .then(res => setData(res.data.data))
            .catch(err => setError(err.response?.data?.message || 'Gagal memuat preview'))
            .finally(() => setLoading(false));
    }, [periodeId, emplId]);

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">Preview Kalkulasi</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">ID: {emplId} — Periode: {periodeId}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="overflow-y-auto p-4 flex-1">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                            <p className="text-sm text-slate-500">Memproses kalkulasi...</p>
                        </div>
                    )}
                    {error && (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                            <AlertCircle className="h-8 w-8 text-rose-500" />
                            <p className="text-sm font-medium text-rose-600">{error}</p>
                        </div>
                    )}
                    {data && !loading && <PayrollPreviewSlip data={data} />}
                </div>
            </div>
        </div>
    );
}

export function PayrollCalculatePanel({
    periodeId,
    isClosed,
    userRole,
    totalEmployees,
    onRefresh,
}: PayrollCalculatePanelProps) {
    const queryClient = useQueryClient();
    const [result, setResult] = useState<PayrollCalculateResult | null>(null);
    const [showErrors, setShowErrors] = useState(false);
    const [previewEmplId, setPreviewEmplId] = useState<string | null>(null);

    const canCalculate = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(userRole);
    const canClose = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);
    const canReopen = userRole === 'SUPER_ADMIN';

    // ── Mutation: Calculate ───────────────────────────────────────
    const calculateMutation = useMutation({
        mutationFn: () => api.post(`/payroll/periods/${periodeId}/calculate`),
        onSuccess: (res) => {
            const data = res.data.data as PayrollCalculateResult;
            setResult(data);
            if (data.gagal === 0) {
                toast.success(`✅ Kalkulasi selesai — ${data.berhasil} karyawan berhasil diproses`);
            } else {
                toast.warning(`⚠️ Kalkulasi selesai — ${data.berhasil} sukses, ${data.gagal} gagal`);
            }
            queryClient.invalidateQueries({ queryKey: ['payrollDetail', periodeId] });
            queryClient.invalidateQueries({ queryKey: ['payrollLog', periodeId] });
            onRefresh();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal menjalankan kalkulasi payroll');
        },
    });

    // ── Mutation: Close ───────────────────────────────────────────
    const closeMutation = useMutation({
        mutationFn: () => api.post(`/payroll/periods/${periodeId}/close`),
        onSuccess: () => {
            toast.success('Periode berhasil di-closing — data terkunci');
            queryClient.invalidateQueries({ queryKey: ['payrollDetail', periodeId] });
            queryClient.invalidateQueries({ queryKey: ['payrollPeriods'] });
            onRefresh();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal closing periode');
        },
    });

    // ── Mutation: Reopen ──────────────────────────────────────────
    const reopenMutation = useMutation({
        mutationFn: () => api.post(`/payroll/periods/${periodeId}/reopen`),
        onSuccess: () => {
            toast.success('Periode berhasil dibuka kembali');
            queryClient.invalidateQueries({ queryKey: ['payrollDetail', periodeId] });
            queryClient.invalidateQueries({ queryKey: ['payrollPeriods'] });
            onRefresh();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal reopen periode');
        },
    });

    const isLoading = calculateMutation.isPending || closeMutation.isPending || reopenMutation.isPending;

    return (
        <>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Payroll Engine
                            </h3>
                            <p className="text-indigo-100 text-xs mt-0.5">
                                Kalkulasi otomatis PPh 21 TER · BPJS · Lembur · THR
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 text-white border-0 text-[10px]">
                                <Users className="h-2.5 w-2.5 mr-1" />
                                {totalEmployees} karyawan
                            </Badge>
                            <Badge className={`border-0 text-[10px] ${isClosed
                                ? 'bg-rose-500/80 text-white'
                                : 'bg-emerald-500/80 text-white'
                                }`}>
                                {isClosed ? <Lock className="h-2.5 w-2.5 mr-1" /> : <Unlock className="h-2.5 w-2.5 mr-1" />}
                                {isClosed ? 'CLOSED' : 'OPEN'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                    {/* Status tertutup */}
                    {isClosed && (
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-400">
                            <Lock className="h-4 w-4 flex-shrink-0" />
                            <span>Periode ini sudah di-closing. Data gaji tidak dapat diubah.</span>
                        </div>
                    )}

                    {/* Aksi */}
                    <div className="flex flex-wrap gap-2">
                        {/* Run Payroll */}
                        {!isClosed && canCalculate && (
                            <Button
                                onClick={() => {
                                    if (!confirm(`Jalankan kalkulasi payroll untuk ${totalEmployees} karyawan?\n\nProses ini akan menghitung ulang semua gaji berdasarkan data absensi, lembur, dan aturan yang berlaku.`)) return;
                                    calculateMutation.mutate();
                                }}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm shadow-emerald-500/20 h-9 text-xs font-bold"
                            >
                                {calculateMutation.isPending ? (
                                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Memproses...</>
                                ) : (
                                    <><Play className="h-3.5 w-3.5 mr-1.5" />Run Payroll</>
                                )}
                            </Button>
                        )}

                        {/* Closing */}
                        {!isClosed && canClose && (
                            <Button
                                onClick={() => {
                                    if (!confirm('Closing periode akan mengunci semua data gaji. Lanjutkan?')) return;
                                    closeMutation.mutate();
                                }}
                                disabled={isLoading}
                                variant="outline"
                                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/20 h-9 text-xs"
                            >
                                {closeMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                ) : (
                                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                Closing Periode
                            </Button>
                        )}

                        {/* Reopen */}
                        {isClosed && canReopen && (
                            <Button
                                onClick={() => {
                                    if (!confirm('Membuka kembali periode yang sudah di-closing. Yakin?')) return;
                                    reopenMutation.mutate();
                                }}
                                disabled={isLoading}
                                variant="outline"
                                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/20 h-9 text-xs"
                            >
                                {reopenMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                ) : (
                                    <Unlock className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                Reopen Periode
                            </Button>
                        )}
                    </div>

                    {/* Loading progress indicator */}
                    {calculateMutation.isPending && (
                        <div className="space-y-2 animate-in fade-in">
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
                                <span>Menghitung gaji {totalEmployees} karyawan...</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse w-full" />
                            </div>
                            <p className="text-[10px] text-slate-400">
                                Memproses: PPh 21 TER · BPJS TK & Kesehatan · Lembur · Pro-rata upah
                            </p>
                        </div>
                    )}

                    {/* Hasil Kalkulasi */}
                    {result && !calculateMutation.isPending && (
                        <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                            {/* Summary stats */}
                            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
                                <div className="p-3 text-center">
                                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{result.berhasil}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />Berhasil
                                    </div>
                                </div>
                                <div className="p-3 text-center">
                                    <div className="text-lg font-black text-rose-600 dark:text-rose-400">{result.gagal}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                                        <AlertCircle className="h-2.5 w-2.5 text-rose-500" />Gagal
                                    </div>
                                </div>
                                <div className="p-3 text-center">
                                    <div className="text-lg font-black text-slate-900 dark:text-white">{result.total}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                                        <Users className="h-2.5 w-2.5 text-slate-400" />Total
                                    </div>
                                </div>
                            </div>

                            {/* Error list */}
                            {result.errors && result.errors.length > 0 && (
                                <div className="border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => setShowErrors(!showErrors)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <AlertTriangle className="h-3 w-3" />
                                            {result.errors.length} karyawan bermasalah
                                        </span>
                                        {showErrors ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </button>
                                    {showErrors && (
                                        <div className="px-3 pb-3 space-y-1.5 max-h-48 overflow-y-auto">
                                            {result.errors.map((err, i) => (
                                                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-xs">
                                                    <AlertCircle className="h-3 w-3 text-rose-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-medium text-rose-700 dark:text-rose-400">
                                                            {err.nama || err.emplId}
                                                        </span>
                                                        <p className="text-rose-600/80 dark:text-rose-400/70">{err.error}</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="ml-auto h-6 px-1.5 text-[10px] text-rose-600"
                                                        onClick={() => setPreviewEmplId(err.emplId)}
                                                    >
                                                        <Eye className="h-2.5 w-2.5 mr-1" />Preview
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            {previewEmplId && (
                <EmployeePreviewModal
                    periodeId={periodeId}
                    emplId={previewEmplId}
                    onClose={() => setPreviewEmplId(null)}
                />
            )}
        </>
    );
}
