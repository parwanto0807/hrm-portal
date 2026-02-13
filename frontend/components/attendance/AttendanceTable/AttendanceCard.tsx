"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AttendanceActions } from "./actions";
import { cn } from "@/lib/utils";
import { Clock, Calendar, AlertCircle, Info } from "lucide-react";

interface AttendanceCardProps {
    record: any;
    onEdit: (record: any) => void;
    onView: (record: any) => void;
    isEmployee?: boolean;
}

export const AttendanceCard = ({ record, onEdit, onView, isEmployee }: AttendanceCardProps) => {
    const status = record.kdAbsen as string;
    const statusConfig: Record<string, { label: string, color: string, fullName: string }> = {
        'H': { label: 'Hadir', color: 'bg-emerald-500', fullName: 'Hadir Tepat Waktu' },
        'S': { label: 'Sakit', color: 'bg-amber-500', fullName: 'Sakit' },
        'I': { label: 'Izin', color: 'bg-blue-500', fullName: 'Izin' },
        'A': { label: 'Alpha', color: 'bg-rose-500', fullName: 'Alpha' },
        'L': { label: 'Libur', color: 'bg-slate-400', fullName: 'Libur' },
        'T': { label: 'Tugas', color: 'bg-indigo-500', fullName: 'Tugas Luar' },
        'O': { label: 'Off Schedule', color: 'bg-purple-500', fullName: 'Off Schedule' },
    };

    const currentStatus = statusConfig[status] || { label: status, color: 'bg-slate-500', fullName: 'Lainnya' };
    const date = new Date(record.tglAbsen);

    const isLate = record.lambat > 0;
    const isEarly = record.cepat > 0;

    return (
        <Card className="mb-3 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
            <CardContent className="p-0">
                {/* Top Header - Date and Status */}
                <div className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-w-[44px]">
                            <span className="text-[10px] font-bold text-rose-500 leading-none uppercase tracking-tighter">
                                {format(date, 'MMM', { locale: id })}
                            </span>
                            <span className="text-base font-black text-slate-800 dark:text-slate-100 leading-none mt-0.5">
                                {format(date, 'dd')}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                {format(date, 'EEEE', { locale: id })}
                            </span>
                            <span className="text-[10px] text-muted-foreground dark:text-slate-400 font-medium">
                                {record.emplId}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                        <Badge className={cn(
                            "border-none text-white text-[10px] font-bold px-2 py-0.5 h-6 rounded-full shadow-sm",
                            currentStatus.color
                        )}>
                            {currentStatus.fullName}
                        </Badge>
                        <AttendanceActions record={record} onEdit={onEdit} onView={onView} isEmployee={isEmployee} />
                    </div>
                </div>

                {/* Middle - Employee Info (if not in employee mode) */}
                {!isEmployee && (
                    <div className="px-3 pt-3 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-700 dark:text-sky-300 font-bold text-xs uppercase">
                            {(record.karyawan?.nama || record.nama || '?').charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                                {record.karyawan?.nama || record.nama}
                            </span>
                            <span className="text-[10px] text-muted-foreground dark:text-slate-500 font-medium uppercase mt-0.5">
                                {record.karyawan?.jabatan?.nmJab || record.karyawan?.dept?.nmDept || '-'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Comparison Section */}
                <div className="p-3 grid grid-cols-2 gap-3">
                    {/* Schedule */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                            <Clock size={10} className="text-slate-400" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">JADWAL</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-2 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{record.stdMasuk || '--:--'}</span>
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">MASUK</span>
                            </div>
                            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{record.stdKeluar || '--:--'}</span>
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-medium uppercase">KELUAR</span>
                            </div>
                        </div>
                    </div>

                    {/* Actual */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                            <Calendar size={10} className="text-sky-500" />
                            <span className="text-[9px] font-bold text-sky-600 uppercase tracking-wider text-[8px]">AKTUAL (LOG)</span>
                        </div>
                        <div className={cn(
                            "border rounded-xl p-2 flex items-center justify-between shadow-sm transition-all duration-300",
                            isLate
                                ? "bg-red-600 border-red-500 shadow-red-100 dark:shadow-red-950/20"
                                : "bg-emerald-600 border-emerald-500 shadow-emerald-100 dark:shadow-emerald-950/20"
                        )}>
                            <div className="flex flex-col relative">
                                <span className="text-[11px] font-black text-white">
                                    {record.realMasuk || '--:--'}
                                </span>
                                <span className="text-[7px] text-white/80 font-bold uppercase tracking-tighter">MASUK</span>
                                {isLate && (
                                    <span className="absolute -top-1 -right-2 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_8px_white]"></span>
                                    </span>
                                )}
                            </div>
                            <div className="h-5 w-[1px] bg-white/20 mx-1" />
                            <div className="flex flex-col items-end relative">
                                <span className="text-[11px] font-black text-white">
                                    {record.realKeluar || '--:--'}
                                </span>
                                <span className="text-[7px] text-white/80 font-bold uppercase tracking-tighter">KELUAR</span>
                                {isEarly && (
                                    <span className="absolute -top-1 -right-2 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_8px_white]"></span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Badges - Late/Early Leave */}
                {(isLate || isEarly || record.totLmb > 0) && (
                    <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                        {isLate && (
                            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[9px] font-black px-2 py-0.5 border border-red-200 dark:border-red-800 rounded-full flex items-center gap-1 animate-pulse shadow-sm">
                                <AlertCircle size={10} className="animate-bounce" />
                                TERLAMBAT {record.lambat}M
                            </Badge>
                        )}
                        {isEarly && (
                            <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[9px] font-black px-2 py-0.5 border border-orange-200 dark:border-orange-800 rounded-full flex items-center gap-1 shadow-sm">
                                <Info size={10} />
                                PULANG CEPAT {record.cepat}M
                            </Badge>
                        )}
                        {parseFloat(record.totLmb || "0") > 0 && (
                            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] font-black px-2 py-0.5 border border-blue-200 dark:border-blue-800 rounded-full flex items-center gap-1 shadow-sm">
                                <Clock size={10} />
                                LEMBUR {record.totLmb}M
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
