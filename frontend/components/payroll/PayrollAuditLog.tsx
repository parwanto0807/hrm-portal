"use client";

import React from 'react';
import { PayrollLog } from '@/types/payroll';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
    Clock,
    User,
    Monitor,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Lock,
    Unlock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PayrollAuditLogProps {
    logs: PayrollLog[];
    isLoading?: boolean;
}

const actionConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    CALCULATE: {
        label: 'Kalkulasi',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        icon: <RefreshCw className="h-3 w-3" />,
    },
    CLOSE: {
        label: 'Closing',
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
        icon: <Lock className="h-3 w-3" />,
    },
    REOPEN: {
        label: 'Reopen',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        icon: <Unlock className="h-3 w-3" />,
    },
    SUCCESS: {
        label: 'Sukses',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    ERROR: {
        label: 'Error',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        icon: <AlertCircle className="h-3 w-3" />,
    },
};

function getActionConfig(action: string) {
    const key = Object.keys(actionConfig).find(k => action.toUpperCase().includes(k));
    return key ? actionConfig[key] : {
        label: action,
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        icon: <Clock className="h-3 w-3" />,
    };
}

export function PayrollAuditLog({ logs, isLoading }: PayrollAuditLogProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Belum ada riwayat audit</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Log akan muncul setelah payroll diproses</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {logs.map((log) => {
                const cfg = getActionConfig(log.action);
                return (
                    <div
                        key={log.id}
                        className="group flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-150"
                    >
                        {/* Icon */}
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                            {cfg.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`text-[10px] px-1.5 py-0 ${cfg.color} border-0`}>
                                    {cfg.label}
                                </Badge>
                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{log.note || log.action}</span>
                            </div>

                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                                <span className="flex items-center gap-1">
                                    <User className="h-2.5 w-2.5" />
                                    {log.changedBy}
                                </span>
                                {log.ipAddress && (
                                    <span className="flex items-center gap-1">
                                        <Monitor className="h-2.5 w-2.5" />
                                        {log.ipAddress}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 ml-auto">
                                    <Clock className="h-2.5 w-2.5" />
                                    {format(new Date(log.changedAt), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                                </span>
                            </div>

                            {/* Before/After diff */}
                            {log.before && log.after && (
                                <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono">
                                    <span className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                                        {typeof log.before === 'object' ? JSON.stringify(log.before).slice(0, 50) : String(log.before)}
                                    </span>
                                    <ArrowRight className="h-2.5 w-2.5 text-slate-400 flex-shrink-0" />
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                                        {typeof log.after === 'object' ? JSON.stringify(log.after).slice(0, 50) : String(log.after)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
