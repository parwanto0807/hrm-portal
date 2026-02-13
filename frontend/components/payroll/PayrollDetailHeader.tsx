"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    DollarSign,
    Users,
    Download,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { PayrollSummary } from '@/types/payroll';

interface PayrollDetailHeaderProps {
    summary: PayrollSummary;
    onExport: () => void;
    exportLabel?: string;
    showAmount: boolean;
    onToggleShowAmount: (show: boolean) => void;
}

export function PayrollDetailHeader({
    summary,
    onExport,
    exportLabel = "Download Report",
    showAmount,
    onToggleShowAmount
}: PayrollDetailHeaderProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="col-span-2 md:col-span-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 text-white border-none overflow-hidden ring-1 ring-white/10">
                <CardContent className="p-4 md:p-6 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="w-full md:w-auto">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px] md:text-xs">
                                    {summary.period.status}
                                </Badge>
                                <span className="text-blue-100 dark:text-blue-200 text-[10px] md:text-sm">
                                    Period ID: #{summary.period.id}
                                </span>
                            </div>
                            <h1 className="text-lg md:text-3xl font-semibold md:font-bold mb-1 truncate text-white">
                                {(() => {
                                    const displayName = String(summary.period.name || summary.period.id || '');
                                    if (!displayName) return '-';

                                    const match = displayName.match(/(\d{4})(\d{2})/);
                                    if (match) {
                                        return format(new Date(parseInt(match[1]), parseInt(match[2]) - 1), 'MMM-yyyy', { locale: localeId });
                                    }

                                    const date = new Date(displayName);
                                    if (!isNaN(date.getTime())) {
                                        return format(date, 'MMM-yyyy', { locale: localeId });
                                    }
                                    return displayName;
                                })()}
                            </h1>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 md:p-3 flex items-center gap-2 md:gap-3 border border-white/10 w-full md:w-auto justify-between md:justify-start">
                                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-blue-50">Tampilkan Gaji</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={showAmount}
                                        onChange={(e) => onToggleShowAmount(e.target.checked)}
                                    />
                                    <div className="w-9 h-5 md:w-11 md:h-6 bg-blue-900/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                            <Button
                                className="w-full md:w-auto bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-100 dark:text-blue-800 dark:hover:bg-white shadow-lg text-xs md:text-sm h-9 md:h-10"
                                onClick={onExport}
                            >
                                <Download className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                                {exportLabel}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm bg-card">
                <CardContent className="p-3 md:p-6 flex flex-col gap-1">
                    <span className="text-[10px] md:text-sm font-medium text-muted-foreground dark:text-slate-400 flex items-center gap-1.5">
                        <Users className="h-3 w-3 md:h-4 md:w-4 text-slate-400 dark:text-slate-300" />
                        Total Karyawan
                    </span>
                    <span className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{summary.employeeCount}</span>
                    <span className="text-[10px] text-muted-foreground hidden md:inline">Karyawan diproses</span>
                </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm bg-card">
                <CardContent className="p-3 md:p-6 flex flex-col gap-1">
                    <span className="text-[10px] md:text-sm font-medium text-muted-foreground dark:text-slate-400 flex items-center gap-1.5">
                        <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-emerald-400 dark:text-emerald-300" />
                        Total Gaji Bersih
                    </span>
                    <span className="text-lg md:text-2xl font-black text-emerald-600 dark:text-emerald-300">
                        {showAmount ? formatCurrency(summary.totalNetSalary) : 'Rp XX.XXX.XXX'}
                    </span>
                    <span className="text-[10px] text-muted-foreground hidden md:inline">Gaji Bersih (THP)</span>
                </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm bg-card">
                <CardContent className="p-3 md:p-6 flex flex-col gap-1">
                    <span className="text-[10px] md:text-sm font-medium text-muted-foreground dark:text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-rose-400 dark:text-rose-300" />
                        Total Potongan
                    </span>
                    <span className="text-lg md:text-2xl font-black text-rose-600 dark:text-rose-300">
                        {showAmount ? formatCurrency(summary.totalDeductions) : 'Rp XX.XXX.XXX'}
                    </span>
                    <span className="text-[10px] text-muted-foreground hidden md:inline">Pajak & BPJS</span>
                </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm bg-card">
                <CardContent className="p-3 md:p-6 flex flex-col gap-1">
                    <span className="text-[10px] md:text-sm font-medium text-muted-foreground dark:text-slate-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-blue-400 dark:text-blue-300" />
                        Total Tunjangan
                    </span>
                    <span className="text-lg md:text-2xl font-black text-blue-600 dark:text-blue-300">
                        {showAmount ? formatCurrency(summary.totalAllowances) : 'Rp XX.XXX.XXX'}
                    </span>
                    <span className="text-[10px] text-muted-foreground hidden md:inline">Lembur & Benefit</span>
                </CardContent>
            </Card>
        </div>
    );
}
