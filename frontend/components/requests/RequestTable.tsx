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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Import locale ID
import { Pengajuan, RequestStatus } from "@/types/request";
import {
    Calendar,
    CheckCircle2,
    Clock,
    Plane,
    FileText,
    User,
    CalendarDays,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface RequestTableProps {
    requests: Pengajuan[];
    isLoading: boolean;
    onAction?: (request: Pengajuan, action: 'APPROVE' | 'REJECT') => void;
    onCancel?: (request: Pengajuan) => void;
    onView?: (request: Pengajuan) => void;
    isApprovalView?: boolean;
}

export function RequestTable({ requests, isLoading, onAction, onCancel, onView, isApprovalView }: RequestTableProps) {
    const getStatusBadge = (status: RequestStatus) => {
        switch (status) {
            case 'APPROVED':
                return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-200 border-none px-3 font-bold">Disetujui</Badge>;
            case 'PENDING':
                return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-200 border-none px-3 font-bold">Menunggu</Badge>;
            case 'IN_PROGRESS':
                return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-200 border-none px-3 font-bold">Diproses</Badge>;
            case 'REJECTED':
                return <Badge className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-200 border-none px-3 font-bold">Ditolak</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'CUTI': return <Calendar className="h-4 w-4 text-blue-500" />;
            case 'IJIN': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'PULANG_CEPAT': return <Clock className="h-4 w-4 text-orange-500" />;
            case 'DINAS_LUAR': return <Plane className="h-4 w-4 text-purple-500" />;
            case 'SAKIT': return <FileText className="h-4 w-4 text-red-500" />;
            default: return null;
        }
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case 'CUTI': return 'Cuti';
            case 'IJIN': return 'Ijin';
            case 'PULANG_CEPAT': return 'Pulang Cepat';
            case 'DINAS_LUAR': return 'Dinas Luar';
            case 'SAKIT': return 'Sakit';
            default: return type.replace('_', ' ');
        }
    };

    const getStepBadge = (step: number) => {
        switch (step) {
            case 1:
                return <Badge variant="outline" className="text-[10px] font-black border-blue-200 text-blue-600 dark:border-blue-900/50 dark:text-blue-400 uppercase tracking-tighter">Atasan 1</Badge>;
            case 2:
                return <Badge variant="outline" className="text-[10px] font-black border-indigo-200 text-indigo-600 dark:border-indigo-900/50 dark:text-indigo-400 uppercase tracking-tighter">Atasan 2</Badge>;
            case 3:
                return <Badge variant="outline" className="text-[10px] font-black border-rose-200 text-rose-600 dark:border-rose-900/50 dark:text-rose-400 uppercase tracking-tighter">HRD Manager</Badge>;
            default:
                return null;
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Memuat pengajuan...</div>;
    }

    if (requests.length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                <FileText className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Tidak ada data pengajuan</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Desktop View (Table) */}
            <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                            {isApprovalView && <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 h-auto">Karyawan</TableHead>}
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 h-auto">Tipe</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 h-auto">Periode</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 h-auto">Tahap</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 h-auto">Alasan</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 h-auto">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 h-auto text-right pr-6">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id} className="border-slate-100 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                {isApprovalView && (
                                    <TableCell className="py-4">
                                        <div className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-xs">{request.karyawan?.nama}</div>
                                        <div className="text-[10px] font-medium text-slate-400">{request.emplId}</div>
                                    </TableCell>
                                )}
                                <TableCell className="py-4 font-bold flex items-center gap-2">
                                    {getTypeIcon(request.type)}
                                    <span className="text-xs uppercase tracking-tight">{getTypeName(request.type)}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {format(new Date(request.startDate), 'dd MMM yyyy', { locale: id })}
                                        {request.endDate && ` - ${format(new Date(request.endDate), 'dd MMM yyyy', { locale: id })}`}
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    {getStepBadge(request.currentStep)}
                                </TableCell>
                                <TableCell className="py-4 max-w-[200px]">
                                    <p className="text-xs text-slate-500 line-clamp-1 font-medium italic">{request.reason}</p>
                                </TableCell>
                                <TableCell className="py-4">
                                    {getStatusBadge(request.status)}
                                </TableCell>
                                <TableCell className="py-4 text-right pr-6">
                                    <ActionButtons
                                        request={request}
                                        isApprovalView={isApprovalView}
                                        onAction={onAction}
                                        onCancel={onCancel}
                                        onView={onView}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-3">
                {requests.map((request) => (
                    <div key={request.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
                        {/* Status Stripe */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${request.status === 'APPROVED' ? 'bg-emerald-500' :
                            request.status === 'REJECTED' ? 'bg-red-500' :
                                request.status === 'PENDING' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />

                        <div className="pl-3 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    {isApprovalView && (
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <User className="h-3 w-3 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{request.karyawan?.nama}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(request.type)}
                                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-tight">{getTypeName(request.type)}</span>
                                    </div>
                                </div>
                                {getStatusBadge(request.status)}
                            </div>

                            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                    <span>
                                        {format(new Date(request.startDate), 'dd MMM yyyy', { locale: id })}
                                        {request.endDate && ` - ${format(new Date(request.endDate), 'dd MMM yyyy', { locale: id })}`}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                        <span>Tahap</span>
                                        <span>Alasan</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        {getStepBadge(request.currentStep)}
                                        <p className="flex-1 text-right italic line-clamp-2">{request.reason}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 mt-1 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                <ActionButtons
                                    request={request}
                                    isApprovalView={isApprovalView}
                                    onAction={onAction}
                                    onCancel={onCancel}
                                    onView={onView}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface ActionButtonsProps {
    request: Pengajuan;
    isApprovalView?: boolean;
    onAction?: (request: Pengajuan, action: 'APPROVE' | 'REJECT') => void;
    onCancel?: (request: Pengajuan) => void;
    onView?: (request: Pengajuan) => void;
}

// Sub-component for Action Keys to reduce duplication
function ActionButtons({ request, isApprovalView, onAction, onCancel, onView }: ActionButtonsProps) {
    return (
        <TooltipProvider>
            {isApprovalView && (request.status === 'PENDING' || request.status === 'IN_PROGRESS') ? (
                <div className="flex justify-end gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] font-black uppercase text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-3"
                                onClick={() => onAction?.(request, 'REJECT')}
                            >
                                Tolak
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Tolak Pengajuan</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                className="h-8 text-[10px] font-black uppercase bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/10 rounded-lg px-3"
                                onClick={() => onAction?.(request, 'APPROVE')}
                            >
                                Setujui
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Setujui Pengajuan</TooltipContent>
                    </Tooltip>
                </div>
            ) : (
                <div className="flex justify-end gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                onClick={() => onView?.(request)}
                            >
                                <FileText className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Detail Pengajuan</TooltipContent>
                    </Tooltip>

                    {!isApprovalView && request.status === 'PENDING' && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                                    onClick={() => onCancel?.(request)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Batalkan Pengajuan</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            )}
        </TooltipProvider>
    );
}
