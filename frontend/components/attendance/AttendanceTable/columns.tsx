"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AttendanceActions } from "./actions";

export const getColumns = (onEdit: (record: any) => void, onView: (record: any) => void, holidays: any[] = []): ColumnDef<any>[] => [
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
                <div className="flex items-center gap-1 text-[10px]">
                    {/* IN TIME */}
                    <div className="group relative">
                        <Badge className={cn(
                            "font-bold px-1 py-0 h-4 transition-all duration-200 border",
                            isLate
                                ? "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-600 hover:text-white hover:border-rose-600"
                                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                        )}>
                            {realMasuk || '--:--'}
                        </Badge>
                        {isLate && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                        )}
                    </div>

                    <span className="text-slate-300 dark:text-slate-700">-</span>

                    {/* OUT TIME */}
                    <div className="group relative">
                        <Badge className={cn(
                            "font-bold px-1 py-0 h-4 transition-all duration-200 border",
                            isEarlyOut
                                ? "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-600 hover:text-white hover:border-rose-600"
                                : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                        )}>
                            {realKeluar || '--:--'}
                        </Badge>
                        {isEarlyOut && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "kdAbsen",
        header: "Sts",
        cell: ({ row }: { row: any }) => {
            const status = row.getValue("kdAbsen") as string;
            const config: Record<string, { label: string, color: string }> = {
                'H': { label: 'Hadir', color: 'bg-emerald-500' },
                'S': { label: 'Sakit', color: 'bg-amber-500' },
                'I': { label: 'Izin', color: 'bg-blue-500' },
                'A': { label: 'Alpha', color: 'bg-rose-500' },
                'L': { label: 'Libur', color: 'bg-slate-400' },
                'T': { label: 'Tugas', color: 'bg-indigo-500' },
                'O': { label: 'Off Schedule', color: 'bg-purple-500' },
            };
            const item = config[status] || { label: status, color: 'bg-slate-500' };
            return (
                <div className="flex justify-center sm:justify-start">
                    <Badge className={`${item.color} text-white hover:${item.color} border-none text-[8px] sm:text-[9px] font-black h-4 px-1.5 flex items-center justify-center rounded-full shadow-sm`}>
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
        cell: ({ row }: { row: any }) => <AttendanceActions record={row.original} onEdit={onEdit} onView={onView} />,
    },
];

import { cn } from "@/lib/utils";
