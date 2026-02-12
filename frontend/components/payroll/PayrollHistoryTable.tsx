"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Calendar,
    Search,
    Filter,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { id as localeId } from 'date-fns/locale';
import { PayrollPeriod } from '@/types/payroll';
import { PayrollHistoryRow } from './PayrollHistoryRow';
import { PayrollPasswordDialog } from './PayrollPasswordDialog';

interface PayrollHistoryTableProps {
    data: PayrollPeriod[];
    isLoading: boolean;
    showAllStatus?: boolean;
    showAmount?: boolean;
    isEmployee?: boolean;
}

export function PayrollHistoryTable({ data, isLoading, showAllStatus = true, showAmount = false, isEmployee = false }: PayrollHistoryTableProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

    const handleMobileDetailClick = (periodId: string) => {
        if (isEmployee) {
            setSelectedPeriodId(periodId);
            setIsPasswordOpen(true);
        } else {
            router.push(`/dashboard/payroll/${periodId}`);
        }
    };

    const handlePasswordSuccess = () => {
        setIsPasswordOpen(false);
        if (selectedPeriodId) {
            router.push(`/dashboard/payroll/${selectedPeriodId}`);
        }
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const filteredData = data.filter(period => {
        const matchesSearch = (period.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || period.status === statusFilter;
        return (showAllStatus ? matchesSearch : true) && matchesStatus;
    });

    // Limit to 12 records for employees to match '12 month' history requirement
    const displayData = !showAllStatus ? filteredData.slice(0, 12) : filteredData;

    // Pagination Logic
    const totalPages = Math.ceil(displayData.length / itemsPerPage);
    const paginatedData = displayData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Closed': return 'Selesai';
            case 'Open': return 'Aktif';
            case 'Draft': return 'Draf';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200'; // Finalized
            case 'Open': return 'bg-green-100 text-green-700 border-green-200'; // Active
            case 'Draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Preparation
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="h-10 w-64 bg-slate-100 rounded-md animate-pulse" />
                    <div className="h-10 w-32 bg-slate-100 rounded-md animate-pulse" />
                </div>
                <div className="border rounded-xl overflow-hidden">
                    <div className="h-12 bg-slate-50 border-b" />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 border-b bg-white dark:bg-slate-900/30 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900/50 p-3 md:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-1">
                        {showAllStatus && (
                            <div className="relative flex-1 sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Cari periode..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-9 h-9 md:h-10 text-xs md:text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all rounded-lg"
                                />
                            </div>
                        )}
                        {showAllStatus && (
                            <Select
                                value={statusFilter}
                                onValueChange={(val) => {
                                    setStatusFilter(val);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-9 md:h-10 w-full sm:w-[140px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">Semua Status</SelectItem>
                                    <SelectItem value="Open" className="text-xs text-green-600">Aktif</SelectItem>
                                    <SelectItem value="Closed" className="text-xs text-slate-600">Selesai</SelectItem>
                                    <SelectItem value="Draft" className="text-xs text-yellow-600">Draf</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    {showAllStatus && (
                        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
                            <Filter className="h-3.5 w-3.5" />
                            <span>{displayData.length} data ditemukan</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900">
                        <TableRow>
                            <TableHead className="w-[280px] text-xs uppercase font-semibold dark:text-slate-400">Nama Periode</TableHead>
                            {!isEmployee && <TableHead className="text-center text-xs uppercase font-semibold dark:text-slate-400">Karyawan</TableHead>}
                            {!isEmployee && <TableHead className="text-right text-xs uppercase font-semibold dark:text-slate-400">Total Gaji</TableHead>}
                            <TableHead className="text-center text-xs uppercase font-semibold dark:text-slate-400">Status</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isEmployee ? 3 : 6} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Calendar className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-sm">Tidak ada periode payroll ditemukan</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((period) => (
                                <PayrollHistoryRow
                                    key={period.id}
                                    period={period}
                                    showAmount={showAmount}
                                    isEmployee={isEmployee}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
                {displayData.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900/50 p-12 rounded-xl border dark:border-slate-800 border-dashed text-center text-slate-400 dark:text-slate-500 text-sm">
                        Data tidak ditemukan.
                    </div>
                ) : (
                    paginatedData.map((period) => (
                        <div
                            key={period.id}
                            className={cn(
                                "bg-white rounded-xl border border-slate-200 shadow-sm active:bg-slate-50 transition-colors overflow-hidden",
                                isEmployee ? "p-3" : "p-4 space-y-4"
                            )}
                            onClick={() => handleMobileDetailClick(String(period.id))}
                        >
                            {isEmployee ? (
                                /* Ultra-Compact Row Style for Employees */
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm border border-indigo-400/20">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <div className="text-sm font-bold text-slate-900 leading-tight truncate uppercase">
                                                {(() => {
                                                    const match = period.name?.match(/(\d{4})(\d{2})/);
                                                    if (match) {
                                                        const year = parseInt(match[1]);
                                                        const month = parseInt(match[2]);
                                                        return format(new Date(year, month - 1), 'MMMM yyyy', { locale: localeId });
                                                    }
                                                    return period.name || '-';
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge variant="secondary" className="text-[8px] font-bold px-1.5 h-4 bg-slate-50 border-slate-200">
                                            {getStatusText(period.status)}
                                        </Badge>
                                        <Button
                                            size="sm"
                                            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg px-3 flex items-center gap-1 shadow-sm"
                                        >
                                            <span className="text-[11px]">Detail</span>
                                            <ArrowRight className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* Standard Card Style for Admin */
                                <>
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight uppercase">
                                                    {(() => {
                                                        const match = period.name?.match(/(\d{4})(\d{2})/);
                                                        if (match) {
                                                            const year = parseInt(match[1]);
                                                            const month = parseInt(match[2]);
                                                            return format(new Date(year, month - 1), 'MMMM yyyy', { locale: localeId });
                                                        }
                                                        return period.name || '-';
                                                    })()}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground dark:text-slate-400 uppercase mt-0.5 tracking-wider">ID: #{period.id}</div>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className={`text-[9px] font-bold px-1.5 h-5 ${getStatusColor(period.status)}`}>
                                            {getStatusText(period.status)}
                                        </Badge>
                                    </div>


                                    <div className="flex items-center justify-between pt-2">
                                        {!isEmployee ? (
                                            <div className="flex flex-col">
                                                <div className="text-[9px] text-slate-400 dark:text-slate-400 font-bold uppercase">Total Gaji</div>
                                                <div className="text-sm font-black text-slate-900 dark:text-white">
                                                    {showAmount ? formatCurrency(period.totalAmount) : 'Rp XX.XXX.XXX'}
                                                </div>
                                            </div>
                                        ) : null}
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="h-8 text-xs bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold border-none rounded-lg px-4"
                                        >
                                            {isEmployee ? 'Pdc' : 'Detail'}
                                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                    <div className="text-[10px] md:text-xs text-muted-foreground order-2 md:order-1">
                        Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai{' '}
                        {Math.min(currentPage * itemsPerPage, displayData.length)} dari{' '}
                        {displayData.length} data
                    </div>
                    <div className="flex items-center gap-1.5 order-1 md:order-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="h-8 md:h-9 text-[10px] md:text-xs px-2"
                        >
                            <ChevronLeft className="h-3.5 w-3.5 md:mr-1" />
                            <span className="hidden md:inline">Sebelumnya</span>
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                .map((p, i, arr) => (
                                    <React.Fragment key={p}>
                                        {i > 0 && arr[i - 1] !== p - 1 && (
                                            <span className="px-1 text-slate-300 text-[10px]">...</span>
                                        )}
                                        <Button
                                            variant={p === currentPage ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setCurrentPage(p)}
                                            className={`h-8 w-8 md:h-9 md:w-9 text-[10px] md:text-xs p-0 ${p === currentPage ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                        >
                                            {p}
                                        </Button>
                                    </React.Fragment>
                                ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="h-8 md:h-9 text-[10px] md:text-xs px-2"
                        >
                            <span className="hidden md:inline">Selanjutnya</span>
                            <ChevronRight className="h-3.5 w-3.5 md:ml-1" />
                        </Button>
                    </div>
                </div>
            )}
            {isEmployee && (
                <PayrollPasswordDialog
                    isOpen={isPasswordOpen}
                    onClose={() => setIsPasswordOpen(false)}
                    onSuccess={handlePasswordSuccess}
                />
            )}
        </div>
    );
}
