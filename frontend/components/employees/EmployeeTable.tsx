// components/employees/EmployeeTable.tsx
"use client";

import React from 'react';
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Employee } from '@/types/employee';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EmployeeTableProps {
    data: Employee[];
    isLoading: boolean;
    error: Error | null;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange: (page: number) => void;
    onView: (employee: Employee) => void;
    onEdit: (employee: Employee) => void;
    onDelete: (employee: Employee) => void;
}

export function EmployeeTable({
    data,
    isLoading,
    error,
    pagination,
    onPageChange,
    onView,
    onEdit,
    onDelete
}: EmployeeTableProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
                <p className="text-red-600 font-medium">Error loading employees</p>
                <p className="text-red-500 text-sm mt-1">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-card shadow-sm transition-all duration-300">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                            <TableHead className="w-[80px] text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Photo</TableHead>
                            <TableHead className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Employee ID</TableHead>
                            <TableHead className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Name</TableHead>
                            <TableHead className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Position</TableHead>
                            <TableHead className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Department</TableHead>
                            <TableHead className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Status</TableHead>
                            <TableHead className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Join Date</TableHead>
                            <TableHead className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Base Salary</TableHead>
                            <TableHead className="text-right w-[150px] text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-slate-200 dark:border-slate-800">
                                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-20 text-slate-500 dark:text-slate-400 italic">
                                    No employees found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((employee) => (
                                <TableRow key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-slate-200 dark:border-slate-800 transition-colors group">
                                    <TableCell>
                                        <Avatar className="h-10 w-10 ring-2 ring-slate-100 dark:ring-slate-800 transition-all group-hover:ring-blue-100 dark:group-hover:ring-blue-900/30">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white font-bold text-xs">
                                                {getInitials(employee.nama)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">{employee.emplId}</span>
                                            {employee.nik && (
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">{employee.nik}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{employee.nama}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                                            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{employee.jabatan?.nmJab || '-'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{employee.dept?.nmDept || '-'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={employee.kdSts === 'AKTIF' ? 'default' : 'secondary'}
                                            className={
                                                employee.kdSts === 'AKTIF'
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/50 font-bold px-2 py-0.5'
                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-bold px-2 py-0.5'
                                            }
                                        >
                                            {employee.kdSts === 'AKTIF' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {employee.tglMsk ? (
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                {format(new Date(employee.tglMsk), 'dd MMM yyyy', { locale: localeId })}
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                                            {formatCurrency(Number(employee.pokokBln))}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => onView(employee)}
                                                className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-sm"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => onEdit(employee)}
                                                className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all shadow-sm"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => onDelete(employee)}
                                                className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View - Shown only on Mobile/Tablet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-card space-y-3 animate-pulse">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-8 rounded-lg" />
                                <Skeleton className="h-8 rounded-lg" />
                            </div>
                        </div>
                    ))
                ) : data.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                        No employees found
                    </div>
                ) : (
                    data.map((employee) => (
                        <div key={employee.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-card shadow-sm space-y-4 hover:shadow-md transition-all active:scale-[0.98]">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs">
                                            {getInitials(employee.nama)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{employee.nama}</div>
                                        <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded w-fit">{employee.emplId}</div>
                                    </div>
                                </div>
                                <Badge
                                    className={
                                        employee.kdSts === 'AKTIF'
                                            ? 'bg-emerald-500 text-white dark:bg-emerald-600 font-black text-[10px] uppercase tracking-tighter'
                                            : 'bg-slate-400 text-white dark:bg-slate-600 font-black text-[10px] uppercase tracking-tighter'
                                    }
                                >
                                    {employee.kdSts === 'AKTIF' ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-[11px] py-3 border-y border-slate-100 dark:border-slate-800/50">
                                <div>
                                    <div className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Position</div>
                                    <div className="text-slate-700 dark:text-slate-300 font-medium truncate">{employee.jabatan?.nmJab || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Salary</div>
                                    <div className="text-slate-900 dark:text-slate-100 font-black">{formatCurrency(Number(employee.pokokBln))}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 text-xs font-bold gap-2"
                                    onClick={() => onView(employee)}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    Details
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-9 w-9 p-0 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                                    onClick={() => onEdit(employee)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-9 w-9 p-0 rounded-lg bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30"
                                    onClick={() => onDelete(employee)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination - Full Width & Responsive */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 py-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 order-2 md:order-1">
                        Showing <span className="text-slate-900 dark:text-white font-bold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                        <span className="text-slate-900 dark:text-white font-bold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                        <span className="text-slate-900 dark:text-white font-bold">{pagination.total}</span> employees
                    </div>
                    <div className="flex items-center gap-1.5 order-1 md:order-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="h-8 rounded-lg dark:bg-slate-800 dark:border-slate-700"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(p => {
                                    if (pagination.totalPages <= 5) return true;
                                    return (
                                        p === 1 ||
                                        p === pagination.totalPages ||
                                        Math.abs(p - pagination.page) <= 1
                                    );
                                })
                                .map((p, i, arr) => (
                                    <React.Fragment key={p}>
                                        {i > 0 && arr[i - 1] !== p - 1 && (
                                            <span className="px-1 text-slate-400">...</span>
                                        )}
                                        <Button
                                            variant={p === pagination.page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onPageChange(p)}
                                            className={cn(
                                                "h-8 w-8 rounded-lg font-bold text-xs transition-all",
                                                p === pagination.page
                                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                                                    : "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                                            )}
                                        >
                                            {p}
                                        </Button>
                                    </React.Fragment>
                                ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="h-8 rounded-lg dark:bg-slate-800 dark:border-slate-700"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
