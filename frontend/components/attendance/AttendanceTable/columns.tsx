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
                <span className="font-bold text-slate-900 dark:text-slate-100 leading-tight text-[11px] sm:text-xs">
                    {row.original.karyawan?.nama || row.original.nama}
                </span>
                <div className="flex flex-col gap-0 mt-0.5">
                    <span className="text-[9px] text-muted-foreground dark:text-slate-400 uppercase font-bold tracking-tighter truncate max-w-[140px]">
                        {row.original.karyawan?.jabatan?.nmJab || row.original.jabatan || '-'}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[140px] hidden sm:inline">
                        {row.original.karyawan?.dept?.nmDept || '-'}
                    </span>
                </div>
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
                        "text-[11px] sm:text-xs font-bold",
                        holiday ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-100"
                    )}>
                        {format(date, 'dd MMM', { locale: id })}
                    </span>
                    <span className="text-[9px] text-muted-foreground dark:text-slate-400 font-medium">
                        {format(date, 'EEEE', { locale: id })}
                    </span>
                    {holiday && (
                        <Badge variant="outline" className="mt-1 w-fit border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-rose-600 dark:text-rose-400 text-[8px] px-1 py-0 h-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
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
            <div className="hidden sm:flex items-center gap-1 text-[10px]">
                <Badge variant="outline" className="font-semibold bg-slate-50/50 dark:bg-slate-900/50 px-1 py-0 h-4 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    {row.original.stdMasuk || '--:--'}
                </Badge>
                <span className="text-slate-300 dark:text-slate-700">-</span>
                <Badge variant="outline" className="font-semibold bg-slate-50/50 dark:bg-slate-900/50 px-1 py-0 h-4 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    {row.original.stdKeluar || '--:--'}
                </Badge>
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
                <div className="flex items-center gap-1.5 text-[10px]">
                    {/* IN TIME */}
                    <div className="group relative flex items-center gap-1">
                        <Badge className={cn(
                            "font-black px-1.5 py-0 h-4.5 transition-all duration-300 border flex items-center gap-1 shadow-sm",
                            isLate
                                ? "bg-red-600 hover:bg-red-700 text-white border-red-500 shadow-red-200 dark:shadow-red-900/20"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-200 dark:shadow-emerald-900/20"
                        )}>
                            {realMasuk || '--:--'}
                            {isLate && <span className="text-[8px] opacity-90">({row.original.lambat}m)</span>}
                        </Badge>
                        {isLate && (
                            <span className="flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
                            </span>
                        )}
                    </div>

                    <span className="text-slate-300 dark:text-slate-700 font-bold">/</span>

                    {/* OUT TIME */}
                    <div className="group relative flex items-center gap-1">
                        <Badge className={cn(
                            "font-black px-1.5 py-0 h-4.5 transition-all duration-300 border flex items-center gap-1 shadow-sm",
                            isEarlyOut
                                ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-500 shadow-orange-200 dark:shadow-orange-900/20"
                                : "bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-blue-200 dark:shadow-blue-900/20"
                        )}>
                            {realKeluar || '--:--'}
                            {isEarlyOut && <span className="text-[8px] opacity-90">({row.original.cepat}m)</span>}
                        </Badge>
                        {isEarlyOut && (
                            <span className="flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.8)]"></span>
                            </span>
                        )}
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
                <div className="flex justify-center sm:justify-start">
                    <Badge className={cn(
                        item.color,
                        "text-white hover:opacity-90 border-none text-[8px] sm:text-[9px] font-black h-4.5 px-2 flex items-center justify-center rounded-full shadow-sm transition-all",
                        status === 'A' && "animate-pulse"
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
                    "text-[10px] font-bold hidden md:inline",
                    ot > 0 ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground dark:text-slate-500"
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
