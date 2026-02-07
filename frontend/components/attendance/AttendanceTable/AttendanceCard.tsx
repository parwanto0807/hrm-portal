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
        <Card className="mb-3 border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-0">
                {/* Top Header - Date and Status */}
                <div className="flex items-center justify-between p-3 bg-slate-50/80 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[44px]">
                            <span className="text-[10px] font-bold text-rose-500 leading-none uppercase tracking-tighter">
                                {format(date, 'MMM', { locale: id })}
                            </span>
                            <span className="text-base font-black text-slate-800 leading-none leading-none mt-0.5">
                                {format(date, 'dd')}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 leading-tight">
                                {format(date, 'EEEE', { locale: id })}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium">
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
                        <AttendanceActions record={record} onEdit={onEdit} onView={onView} />
                    </div>
                </div>

                {/* Middle - Employee Info (if not in employee mode) */}
                {!isEmployee && (
                    <div className="px-3 pt-3 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs uppercase">
                            {(record.karyawan?.nama || record.nama || '?').charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 leading-none">
                                {record.karyawan?.nama || record.nama}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
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
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-700">{record.stdMasuk || '--:--'}</span>
                                <span className="text-[8px] text-slate-400 font-medium">MASUK</span>
                            </div>
                            <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-slate-700">{record.stdKeluar || '--:--'}</span>
                                <span className="text-[8px] text-slate-400 font-medium uppercase">KELUAR</span>
                            </div>
                        </div>
                    </div>

                    {/* Actual */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                            <Calendar size={10} className="text-sky-500" />
                            <span className="text-[9px] font-bold text-sky-600 uppercase tracking-wider">AKTUAL (LOG)</span>
                        </div>
                        <div className={cn(
                            "border rounded-lg p-2 flex items-center justify-between",
                            isLate ? "bg-rose-50/50 border-rose-200" : "bg-emerald-50/50 border-emerald-200"
                        )}>
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-[10px] font-bold",
                                    isLate ? "text-rose-600" : "text-emerald-600"
                                )}>
                                    {record.realMasuk || '--:--'}
                                </span>
                                <span className="text-[8px] text-slate-400 font-medium">MASUK</span>
                            </div>
                            <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-blue-600">
                                    {record.realKeluar || '--:--'}
                                </span>
                                <span className="text-[8px] text-slate-400 font-medium">KELUAR</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Badges - Late/Early Leave */}
                {(isLate || isEarly || record.totLmb > 0) && (
                    <div className="px-3 pb-3 flex flex-wrap gap-2">
                        {isLate && (
                            <div className="flex items-center gap-1 bg-rose-50 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-100">
                                <AlertCircle size={10} />
                                Terlambat {record.lambat}m
                            </div>
                        )}
                        {isEarly && (
                            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-100">
                                <Info size={10} />
                                Pulang Cepat {record.cepat}m
                            </div>
                        )}
                        {parseFloat(record.totLmb || "0") > 0 && (
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-100">
                                <Clock size={10} />
                                Lembur {record.totLmb}m
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
