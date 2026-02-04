"use client";

import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Pengajuan, RequestStatus } from "@/types/request";
import {
    Calendar,
    Clock,
    FileText,
    User,
    MapPin,
    CheckCircle2,
    XCircle,
    Info,
    History as HistoryIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RequestDetailSheetProps {
    request: Pengajuan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RequestDetailSheet({ request, open, onOpenChange }: RequestDetailSheetProps) {
    if (!request) return null;

    const getStatusBadge = (status: RequestStatus) => {
        switch (status) {
            case 'APPROVED':
                return <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 font-bold">Approved</Badge>;
            case 'PENDING':
                return <Badge className="bg-amber-100 text-amber-700 border-none px-3 font-bold">Pending Approval</Badge>;
            case 'IN_PROGRESS':
                return <Badge className="bg-blue-100 text-blue-700 border-none px-3 font-bold">In Progress</Badge>;
            case 'REJECTED':
                return <Badge className="bg-red-100 text-red-700 border-none px-3 font-bold">Rejected</Badge>;
            case 'CANCELLED':
                return <Badge className="bg-slate-100 text-slate-700 border-none px-3 font-bold">Cancelled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md border-l dark:border-slate-800 bg-white dark:bg-slate-950 p-0 overflow-hidden flex flex-col">
                <SheetHeader className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        {getStatusBadge(request.status)}
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            STEP {request.currentStep} OF 3
                        </span>
                    </div>
                    <SheetTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        {request.type.replace('_', ' ')}
                    </SheetTitle>
                    <SheetDescription className="text-xs font-medium text-slate-500">
                        Application ID: {request.id.slice(0, 8).toUpperCase()}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-8">
                        {/* Requester Info */}
                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                <User className="h-3 w-3" />
                                Requester Details
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black text-lg">
                                    {request.karyawan?.nama?.[0] || 'U'}
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 dark:text-white uppercase leading-none text-sm mb-1">{request.karyawan?.nama}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{request.emplId} • {request.karyawan?.kdDept || 'No Dept'}</div>
                                </div>
                            </div>
                        </section>

                        <Separator className="bg-slate-100 dark:bg-slate-800" />

                        {/* Request Details */}
                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                Schedule Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Start Date</label>
                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {format(new Date(request.startDate), 'EEEE, dd MMM yyyy')}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">End Date</label>
                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {request.endDate ? format(new Date(request.endDate), 'EEEE, dd MMM yyyy') : '-'}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1 pt-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Reason / Description</label>
                                <div className="text-xs font-medium italic text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    "{request.reason}"
                                </div>
                            </div>
                        </section>

                        <Separator className="bg-slate-100 dark:bg-slate-800" />

                        {/* Approval Timeline */}
                        <section className="space-y-4 pb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                <HistoryIcon className="h-3 w-3" />
                                Approval Timeline
                            </h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((step) => {
                                    const log = request.approvals?.find(l => l.level === step);
                                    let stepName = step === 1 ? 'Atasan 1' : step === 2 ? 'Atasan 2' : 'HRD Manager';

                                    return (
                                        <div key={step} className="relative pl-6">
                                            {/* Connector line */}
                                            {step < 3 && <div className="absolute left-[9px] top-6 bottom-[-20px] w-0.5 bg-slate-100 dark:bg-slate-800" />}

                                            {/* Step dot */}
                                            <div className={`absolute left-0 top-1.5 h-5 w-5 rounded-full border-4 flex items-center justify-center bg-white dark:bg-slate-950 z-10 
                                                ${log ? (log.status === 'APPROVED' ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500') :
                                                    (request.currentStep === step ? 'border-blue-500 animate-pulse' : 'border-slate-200 dark:border-slate-800')}`}
                                            >
                                                {log ? (log.status === 'APPROVED' ? <CheckCircle2 className="h-2 w-2" /> : <XCircle className="h-2 w-2" />) : <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="font-black uppercase tracking-tight text-xs text-slate-900 dark:text-white">
                                                        {stepName}
                                                    </div>
                                                    {log && (
                                                        <span className="text-[9px] font-bold text-slate-400">
                                                            {format(new Date(log.actionDate), 'dd MMM HH:mm')}
                                                        </span>
                                                    )}
                                                </div>

                                                {log ? (
                                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black">
                                                                {log.approver.nama[0]}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                                                                {log.approver.nama}
                                                            </div>
                                                        </div>
                                                        {log.remarks && (
                                                            <div className="text-[10px] font-medium text-slate-500 italic">
                                                                “{log.remarks}”
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] font-bold text-slate-400 italic">
                                                        {request.currentStep === step ? (request.status === 'CANCELLED' ? 'Request cancelled' : 'Waiting for approval...') : 'Pending previous step'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
