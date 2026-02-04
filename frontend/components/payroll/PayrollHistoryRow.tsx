"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    TableCell,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    ArrowRight,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PayrollPeriod, PayrollDetail } from '@/types/payroll';
import { PayrollSlipDetail } from './PayrollSlipDetail';

interface PayrollHistoryRowProps {
    period: PayrollPeriod;
    showAmount: boolean;
    isEmployee: boolean;
}

export function PayrollHistoryRow({ period, showAmount, isEmployee }: PayrollHistoryRowProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    // Only fetch details if we are expanded AND we are an employee (for slip view)
    // If not employee, expansion might check generic details or we just don't support it inline yet?
    // Plan said: "Handle isEmployee check... ensure we only try to show personal slip details for employees."
    const { data: detailData, isLoading } = useQuery({
        queryKey: ['payrollDetail', period.id, 'my'],
        queryFn: async () => {
            // For employee, this likely returns a structure containing 'employees' array with 1 item
            const res = await api.get(`/payroll/periods/${period.id}/details`);
            return res.data.data;
        },
        enabled: isExpanded && isEmployee,
        staleTime: 5 * 60 * 1000,
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

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
            case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'Open': return 'bg-green-100 text-green-700 border-green-200';
            case 'Draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const handleExpandToggle = () => {
        // If employee, toggle expand
        if (isEmployee) {
            setIsExpanded(!isExpanded);
        } else {
            // Admin navigate to detail
            router.push(`/dashboard/payroll/${period.id}`);
        }
    };

    const myDetail: PayrollDetail | undefined = detailData?.employees?.[0];

    return (
        <>
            <TableRow className="hover:bg-slate-50/50 transition-colors group">
                <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        {isEmployee && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleExpandToggle();
                                }}
                                className="h-7 w-7 p-0 -ml-1 mr-1 hover:bg-slate-200 rounded-full"
                            >
                                {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-slate-500" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                )}
                            </Button>
                        )}
                        <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Calendar className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{period.name}</div>
                            <div className="text-[10px] text-muted-foreground dark:text-slate-400 uppercase">ID: #{period.id}</div>
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col text-xs">
                        <span className="text-slate-600 dark:text-slate-300">
                            {format(new Date(period.startDate), 'dd MMM yyyy', { locale: localeId })}
                        </span>
                        <span className="text-[10px] text-muted-foreground dark:text-slate-400 uppercase font-medium">sampai {format(new Date(period.endDate), 'dd MMM yyyy', { locale: localeId })}</span>
                    </div>
                </TableCell>
                <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px] font-semibold border-slate-200 px-2 py-0 h-5">
                        {period.totalEmployees} Karyawan
                    </Badge>
                </TableCell>
                <TableCell className="text-right font-black text-slate-800 dark:text-white text-sm">
                    {showAmount ? formatCurrency(period.totalAmount) : 'Rp XX.XXX.XXX'}
                </TableCell>
                <TableCell className="text-center">
                    <Badge variant="secondary" className={`text-[10px] font-bold px-2 py-0 h-5 ${getStatusColor(period.status)}`}>
                        {getStatusText(period.status)}
                    </Badge>
                </TableCell>
                <TableCell>
                    {!isEmployee ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 h-8 group-hover:translate-x-1 transition-transform"
                            onClick={() => router.push(`/dashboard/payroll/${period.id}`)}
                        >
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        // For employee, maybe an explicit "Detail" button if they prefer that over clicking expand?
                        // Let's keep the arrow but link it to the full page view just in case they want to print, etc.
                        // Or maybe make the arrow toggle expand? 
                        // Let's stick to arrow -> full page, caret -> inline expand.
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 h-8"
                            onClick={() => router.push(`/dashboard/payroll/${period.id}`)}
                        >
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}
                </TableCell>
            </TableRow>
            {isExpanded && isEmployee && (
                isLoading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="p-0 border-0">
                            <div className="p-8 text-center text-slate-500 animate-pulse bg-slate-50">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
                                    <span className="text-xs">Memuat detail slip gaji...</span>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : myDetail ? (
                    <PayrollSlipDetail detail={myDetail} colSpan={6} />
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="p-0 border-0">
                            <div className="p-8 text-center text-red-500 bg-red-50 text-xs">
                                Gagal memuat detail data. Silakan coba lagi.
                            </div>
                        </TableCell>
                    </TableRow>
                )
            )}
            {/* 
                CORRECTION: 
                If `PayrollSlipDetail` renders a `TableRow`, I cannot wrap it in `TableCell`.
                I should conditionally render it.
                Also I need to fix the colSpan issue.
            */}
        </>
    );
}
