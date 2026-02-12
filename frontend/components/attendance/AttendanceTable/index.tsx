"use client";

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AttendanceCard } from './AttendanceCard';
import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface AttendanceTableProps {
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onEdit: (record: any) => void;
    onView: (record: any) => void;
    isLoading: boolean;
    isEmployee?: boolean;
    holidays?: any[];
}

export const AttendanceTable = ({
    data,
    pagination,
    onPageChange,
    onLimitChange,
    onEdit,
    onView,
    isLoading,
    isEmployee,
    holidays = []
}: AttendanceTableProps) => {
    const columns = getColumns(onEdit, onView, holidays);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-4">
            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-1 py-2">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest w-full sm:w-auto mb-1 sm:mb-0">Legend:</span>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded shadow-sm transition-colors">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">Hadir</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded shadow-sm transition-colors">
                        <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">Sakit</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded shadow-sm transition-colors">
                        <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">Izin</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded shadow-sm transition-colors">
                        <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">Alpha</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded shadow-sm transition-colors">
                        <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">Libur</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded shadow-sm transition-colors">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">Tugas Luar</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded shadow-sm transition-colors">
                        <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.3)]" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">Off Schedule</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded shadow-sm transition-colors">
                        <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">Hari Libur Nasional</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded shadow-sm transition-colors">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">Lembur</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded shadow-sm transition-colors">
                        <div className="h-2 w-2 rounded-full bg-emerald-600" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">Pengganti Hari Libur</span>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className={cn(
                "hidden md:block",
                "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm",
                "rounded-xl md:rounded-xl transition-all duration-300"
            )}>
                <div className="relative overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            {table.getHeaderGroups().map((headerGroup: any) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                                    {headerGroup.headers.map((header: any) => (
                                        <TableHead key={header.id} className="text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest py-3 md:py-4 px-2">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <TableRow key={i}>
                                        {columns.map((_, index) => (
                                            <TableCell key={index} className="py-4">
                                                <div className="h-4 w-full bg-slate-100 animate-pulse rounded" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : data.length > 0 ? (
                                table.getRowModel().rows.map((row: any) => {
                                    // Check if row is holiday
                                    const rowDate = new Date(row.original.tglAbsen).toISOString().split('T')[0];
                                    const isHoliday = holidays?.some((h: any) =>
                                        new Date(h.tanggal).toISOString().split('T')[0] === rowDate
                                    );

                                    return (
                                        <TableRow
                                            key={row.id}
                                            className={cn(
                                                "transition-colors border-slate-100 dark:border-slate-900 group",
                                                isHoliday
                                                    ? "bg-red-50/30 dark:bg-red-950/20 hover:bg-red-50/50 dark:hover:bg-red-950/30 [background-image:radial-gradient(#fee2e2_1px,transparent_1px)] dark:[background-image:radial-gradient(#311111_1px,transparent_1px)] [background-size:16px_16px]"
                                                    : "hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                                            )}
                                        >
                                            {row.getVisibleCells().map((cell: any) => (
                                                <TableCell key={cell.id} className={cn(
                                                    "py-2.5 sm:py-3 px-2 text-[11px] sm:text-sm",
                                                    isHoliday && "text-red-700 font-medium"
                                                )}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-lg font-medium">No results found</span>
                                            <p className="text-sm">Try adjusting your filters or search terms.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
                {isLoading ? (
                    [1, 2, 3].map((i) => (
                        <Card key={i} className="border-slate-200 shadow-sm overflow-hidden p-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="h-10 w-10 bg-slate-100 animate-pulse rounded-lg" />
                                    <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-full" />
                                </div>
                                <div className="h-4 w-3/4 bg-slate-100 animate-pulse rounded" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="h-16 bg-slate-50 animate-pulse rounded-lg" />
                                    <div className="h-16 bg-slate-50 animate-pulse rounded-lg" />
                                </div>
                            </div>
                        </Card>
                    ))
                ) : data.length > 0 ? (
                    data.map((record: any) => (
                        <AttendanceCard
                            key={record.id}
                            record={record}
                            onEdit={onEdit}
                            onView={onView}
                            isEmployee={isEmployee}
                        />
                    ))
                ) : (
                    <Card className="p-8 text-center border-dashed border-2 bg-slate-50/50">
                        <div className="flex flex-col items-center gap-2">
                            <Info className="h-8 w-8 text-slate-300" />
                            <span className="text-sm font-medium text-slate-500">Tidak ada data ditemukan</span>
                        </div>
                    </Card>
                )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Rows per page</p>
                    <Select
                        value={pagination.limit.toString()}
                        onValueChange={(value) => onLimitChange(parseInt(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pagination.limit} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground ml-4">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(1)}
                        disabled={pagination.page === 1 || isLoading}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center text-sm font-medium min-w-[100px]">
                        Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages || isLoading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages || isLoading}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
