"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
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
    ChevronUp,
    FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PayrollPeriod, PayrollDetail } from '@/types/payroll';
import { PayrollPasswordDialog } from './PayrollPasswordDialog';
import { PayrollSlipDetail } from './PayrollSlipDetail';

interface PayrollHistoryRowProps {
    period: PayrollPeriod;
    showAmount: boolean;
    isEmployee: boolean;
}

export function PayrollHistoryRow({ period, showAmount, isEmployee }: PayrollHistoryRowProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);

    const handleDetailClick = () => {
        if (isEmployee) {
            setIsPasswordOpen(true);
        } else {
            router.push(`/dashboard/payroll/${period.id}`);
        }
    };

    const handlePasswordSuccess = () => {
        setIsPasswordOpen(false);
        router.push(`/dashboard/payroll/${period.id}`);
    };

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
                <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                        {isEmployee && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleExpandToggle();
                                }}
                                className="h-6 w-6 p-0 -ml-1 mr-0.5 hover:bg-slate-200 rounded-full shrink-0"
                            >
                                {isExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                                ) : (
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                                )}
                            </Button>
                        )}
                        <div className={cn(
                            "rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                            isEmployee
                                ? "h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border border-indigo-400/20"
                                : "h-9 w-9 bg-blue-50 text-blue-600 border border-blue-100"
                        )}>
                            <Calendar className={cn(isEmployee ? "h-5 w-5" : "h-4.5 w-4.5")} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {(() => {
                                    const displayName = String(period.name || period.id || '');
                                    if (!displayName) return '-';

                                    const match = displayName.match(/(\d{4})(\d{2})/);
                                    if (match) {
                                        const year = parseInt(match[1]);
                                        const month = parseInt(match[2]);
                                        return format(new Date(year, month - 1), 'MMM-yyyy', { locale: localeId });
                                    }

                                    const date = new Date(displayName);
                                    if (!isNaN(date.getTime())) {
                                        return format(date, 'MMM-yyyy', { locale: localeId });
                                    }
                                    return displayName;
                                })()}
                            </div>
                            {!isEmployee && <div className="text-[10px] text-muted-foreground dark:text-slate-400 uppercase">ID: #{period.id}</div>}
                        </div>
                    </div>
                </TableCell>
                {!isEmployee && (
                    <TableCell className="py-2.5 text-center">
                        <Badge variant="outline" className="text-[10px] font-semibold border-slate-200 px-2 py-0 h-5">
                            {period.totalEmployees} Karyawan
                        </Badge>
                    </TableCell>
                )}
                {!isEmployee && (
                    <TableCell className="py-2.5 text-right font-black text-slate-800 dark:text-white text-sm">
                        {showAmount ? formatCurrency(period.totalAmount) : 'Rp XX.XXX.XXX'}
                    </TableCell>
                )}
                <TableCell className="py-2.5 text-center">
                    <Badge variant="secondary" className={cn(
                        `text-[10px] font-bold px-2 py-0 h-5`,
                        isEmployee ? "bg-slate-50 border-slate-200" : getStatusColor(period.status)
                    )}>
                        {getStatusText(period.status)}
                    </Badge>
                </TableCell>
                <TableCell className="py-2.5">
                    <Button
                        size="sm"
                        variant={isEmployee ? "default" : "ghost"}
                        className={cn(
                            "h-8 transition-all",
                            !isEmployee
                                ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 group-hover:translate-x-1"
                                : "bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 gap-1.5 shadow-sm rounded-lg"
                        )}
                        onClick={handleDetailClick}
                    >
                        {isEmployee ? (
                            <>
                                <FileText className="h-3.5 w-3.5" />
                                <span className="text-xs">Detail</span>
                            </>
                        ) : (
                            <ArrowRight className="h-4 w-4" />
                        )}
                    </Button>
                </TableCell>
            </TableRow>
            {isEmployee && (
                <PayrollPasswordDialog
                    isOpen={isPasswordOpen}
                    onClose={() => setIsPasswordOpen(false)}
                    onSuccess={handlePasswordSuccess}
                />
            )}
            {isExpanded && isEmployee && (
                isLoading ? (
                    <TableRow>
                        <TableCell colSpan={isEmployee ? 3 : 5} className="p-0 border-0">
                            <div className="p-8 text-center text-slate-500 animate-pulse bg-slate-50">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
                                    <span className="text-xs">Memuat detail slip gaji...</span>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : myDetail ? (
                    <PayrollSlipDetail detail={myDetail} colSpan={isEmployee ? 3 : 5} />
                ) : (
                    <TableRow>
                        <TableCell colSpan={isEmployee ? 3 : 5} className="p-0 border-0">
                            <div className="p-8 text-center text-red-500 bg-red-50 text-xs">
                                Gagal memuat detail data. Silakan coba lagi.
                            </div>
                        </TableCell>
                    </TableRow>
                )
            )}

        </>
    );
}
