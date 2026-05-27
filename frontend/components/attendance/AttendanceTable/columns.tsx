"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    Clock,
    UserCheck,
    UserX,
    AlertCircle,
    FileText,
    Calendar,
    X
} from "lucide-react";
import { AttendanceActions } from "./actions";

export const getColumns = (onEdit: (record: any) => void, onView: (record: any) => void, holidays: any[] = [], isEmployee: boolean = false): ColumnDef<any>[] => [
    {
        accessorKey: "emplId",
        header: () => <span className="hidden lg:inline">ID Karyawan</span>,
        cell: ({ row }: { row: any }) => <span className="font-mono text-[11px] font-semibold hidden lg:inline">{row.getValue("emplId")}</span>,
    },
    {
        accessorKey: "karyawan.nama",
        header: "Karyawan",
        cell: ({ row }: { row: any }) => (
            <div className="flex flex-col min-w-[120px]">
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {row.original.karyawan?.nama || row.original.nama}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                    {row.original.karyawan?.jabatan?.nmJab || row.original.jabatan || '-'} • {row.original.karyawan?.dept?.nmDept || '-'}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "tglAbsen",
        header: "Tanggal",
        cell: ({ row }: { row: any }) => {
            const date = new Date(row.getValue("tglAbsen"));
            const dateStr = date.toISOString().split('T')[0];
            const holiday = holidays?.find((h: any) => new Date(h.tanggal).toISOString().split('T')[0] === dateStr);

            return (
                <div className="flex flex-col">
                    <span className={cn(
                        "text-xs font-semibold",
                        holiday ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"
                    )}>
                        {format(date, 'dd MMM yyyy', { locale: id })}
                    </span>
                    <span className="text-[11px] text-slate-500">
                        {format(date, 'EEEE', { locale: id })}
                    </span>
                    {holiday && (
                        <Badge variant="outline" className="mt-1 w-fit border-red-200 bg-red-50 text-rose-600 text-[10px] px-1.5 py-0">
                            {holiday.keterangan}
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        id: "schedule",
        header: () => <span className="hidden sm:inline">Jadwal</span>,
        cell: ({ row }: { row: any }) => (
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded w-fit border border-slate-100">
                <span>{row.original.stdMasuk || '--:--'}</span>
                <span className="text-slate-400">-</span>
                <span>{row.original.stdKeluar || '--:--'}</span>
            </div>
        ),
    },
    {
        id: "actual",
        header: "Presensi",
        cell: ({ row }: { row: any }) => {
            const stdMasuk = row.original.stdMasuk;
            const realMasuk = row.original.realMasuk;
            const stdKeluar = row.original.stdKeluar;
            const realKeluar = row.original.realKeluar;
            const cepat = row.original.cepat; // Assuming 'cepat' (early out) might be in data, or we compare strings

            // Late IN Logic: Using existing 'lambat' or string comparison
            const isLate = row.original.lambat > 0 || (stdMasuk && realMasuk && realMasuk > stdMasuk);

            // Early OUT Logic: Check if realKeluar is less than stdKeluar
            // Note: Only check if both exist. 
            const isEarlyOut = (stdKeluar && realKeluar && realKeluar < stdKeluar);

            return (
                <div className="flex items-center gap-2 text-xs font-mono">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 mb-0.5 leading-none">In</span>
                        <span className={cn(
                            "font-semibold",
                            isLate ? "text-rose-600" : "text-emerald-600"
                        )}>
                            {realMasuk || '--:--'}
                            {isLate && <span className="text-[10px] ml-1 text-rose-500 font-normal">({row.original.lambat}m)</span>}
                        </span>
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-1"></div>

                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 mb-0.5 leading-none">Out</span>
                        <span className={cn(
                            "font-semibold",
                            isEarlyOut ? "text-amber-600" : "text-blue-600"
                        )}>
                            {realKeluar || '--:--'}
                            {isEarlyOut && <span className="text-[10px] ml-1 text-amber-500 font-normal">({row.original.cepat}m)</span>}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "kdAbsen",
        header: "Sts",
        cell: ({ row }: { row: any }) => {
            const status = row.getValue("kdAbsen") as string;
            const config: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
                'H': { label: 'Hadir', color: 'bg-emerald-500', icon: <UserCheck className="h-2 w-2 mr-1" /> },
                'S': { label: 'Sakit', color: 'bg-amber-500', icon: <AlertCircle className="h-2 w-2 mr-1" /> },
                'I': { label: 'Izin', color: 'bg-blue-500', icon: <FileText className="h-2 w-2 mr-1" /> },
                'A': { label: 'Alpha', color: 'bg-rose-600', icon: <UserX className="h-2 w-2 mr-1" /> },
                'L': { label: 'Libur', color: 'bg-slate-500', icon: <Calendar className="h-2 w-2 mr-1" /> },
                'T': { label: 'Tugas', color: 'bg-indigo-500', icon: <Clock className="h-2 w-2 mr-1" /> },
                'O': { label: 'Off', color: 'bg-purple-500', icon: <X className="h-2 w-2 mr-1" /> },
            };
            const item = config[status] || { label: status, color: 'bg-slate-500', icon: null };
            return (
                <div className="flex justify-start">
                    <Badge className={cn(
                        item.color,
                        "text-white border-none text-[10px] font-medium px-2 py-0.5 rounded shadow-sm"
                    )}>
                        {item.icon}
                        {item.label}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "totLmb",
        header: () => <span className="hidden md:inline">Lembur</span>,
        cell: ({ row }: { row: any }) => {
            const ot = parseFloat(row.getValue("totLmb") || "0");
            return (
                <span className={cn(
                    "text-xs font-mono hidden md:inline",
                    ot > 0 ? "text-blue-600 font-semibold" : "text-slate-400"
                )}>
                    {ot > 0 ? `${ot}m` : '-'}
                </span>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }: { row: any }) => <AttendanceActions record={row.original} onEdit={onEdit} onView={onView} isEmployee={isEmployee} />,
    },
];

import { cn } from "@/lib/utils";
