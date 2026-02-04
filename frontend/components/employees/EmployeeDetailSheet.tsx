// components/employees/EmployeeDetailSheet.tsx
"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Employee } from '@/types/employee';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
    User, Briefcase, Calendar,
    CreditCard, Banknote, AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface PayrollHistoryRecord {
    id: string;
    periodName: string;
    processDate: string;
    takeHomePay: number;
}

interface EmployeeDetailSheetProps {
    employee: Employee | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailSheet({ employee, open, onOpenChange }: EmployeeDetailSheetProps) {
    const [activeTab, setActiveTab] = React.useState("profile");

    // Reset tab when sheet opens
    React.useEffect(() => {
        if (open) setActiveTab("profile");
    }, [open]);

    // Handle ESC key
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange(false);
        };
        if (open) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open, onOpenChange]);

    const { data: history, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['payrollHistory', employee?.id],
        queryFn: async () => {
            if (!employee?.id) return [];
            const res = await api.get(`/employees/${employee.id}/history`);
            return res.data.data;
        },
        enabled: open && !!employee?.id
    });

    if (!open || !employee) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const totalSalary =
        Number(employee.pokokBln || 0) +
        (employee.kdTransp ? Number(employee.tTransport || 0) : 0) +
        (employee.kdMakan ? Number(employee.tMakan || 0) : 0) +
        Number(employee.tJabatan || 0) +
        Number(employee.tKeluarga || 0) +
        Number(employee.tKomunikasi || 0) +
        Number(employee.tKhusus || 0) +
        Number(employee.tLmbtetap || 0) +
        Number(employee.fixOther || 0);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={() => onOpenChange(false)}
            />

            {/* Sheet Content */}
            <div className="relative z-50 w-full sm:max-w-xl h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                                {employee.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{employee.nama}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-tighter">{employee.emplId}</span>
                                    <Badge className={cn(
                                        "text-[10px] uppercase font-black px-1.5 py-0",
                                        employee.kdSts === 'AKTIF' ? "bg-emerald-500" : "bg-slate-400"
                                    )}>
                                        {employee.kdSts}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid w-full grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-8">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`px-3 py-2 text-xs font-black rounded-lg transition-all ${activeTab === "profile"
                                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                }`}
                        >
                            PROFILE & INFO
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-3 py-2 text-xs font-black rounded-lg transition-all ${activeTab === "history"
                                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                }`}
                        >
                            PAYROLL HISTORY
                        </button>
                    </div>

                    {activeTab === "profile" && (
                        <div className="space-y-8 pb-10">
                            {/* Personal Information */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 group">
                                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Personal Information</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 px-1">
                                    <InfoItem label="Full Name" value={employee.nama} />
                                    <InfoItem label="NIK / KTP" value={employee.nik || '-'} fontMono />
                                    <InfoItem label="Gender" value={employee.kdSex === 'LAKILAKI' ? 'Male' : 'Female'} />
                                    <InfoItem label="Birth Date" value={employee.tglLhr ? format(new Date(employee.tglLhr), 'dd MMMM yyyy', { locale: localeId }) : '-'} />
                                    <InfoItem label="Phone" value={employee.handphone || '-'} copyable />
                                    <InfoItem label="Email" value={employee.email || '-'} copyable />
                                </div>
                            </section>

                            <Separator className="bg-slate-100 dark:bg-slate-800" />

                            {/* Employment Details */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 group">
                                    <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <Briefcase className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Employment Details</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 px-1">
                                    <InfoItem label="Position" value={employee.jabatan?.nmJab || '-'} isBadge />
                                    <InfoItem label="Department" value={employee.dept?.nmDept || '-'} />
                                    <InfoItem label="Division" value={employee.bag?.nmBag || '-'} />
                                    <InfoItem label="Factory" value={employee.fact?.nmFact || '-'} />
                                    <InfoItem label="Employment Type" value={employee.kdJns} isBadge />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Status</p>
                                        <Badge variant={employee.kdSts === 'AKTIF' ? 'default' : 'secondary'} className={cn(
                                            "mt-1 font-black px-2 py-0.5 text-[10px]",
                                            employee.kdSts === 'AKTIF' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                        )}>
                                            {employee.kdSts}
                                        </Badge>
                                    </div>
                                </div>
                            </section>

                            <Separator className="bg-slate-100 dark:bg-slate-800" />

                            {/* Salary Settings */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 group">
                                    <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-all">
                                        <Banknote className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Salary Settings</h3>
                                </div>

                                {totalSalary === 0 && (
                                    <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl mb-6">
                                        <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-black text-rose-900 dark:text-rose-400 text-xs uppercase tracking-tight">Attention Required</p>
                                            <p className="text-rose-700 dark:text-rose-500/80 text-xs mt-0.5 font-medium leading-relaxed">Total salary is configured as 0. Please verify the base salary or employee status mapping.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl group hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Base Monthly Salary</span>
                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Regular base pay</p>
                                        </div>
                                        <span className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">{formatCurrency(Number(employee.pokokBln))}</span>
                                    </div>

                                    <div className="p-5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Standard Allowances</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <AllowanceRow label="Transport" value={Number(employee.tTransport)} active={!!employee.kdTransp} />
                                            <AllowanceRow label="Meal Cost" value={Number(employee.tMakan)} active={!!employee.kdMakan} />
                                            <AllowanceRow label="Position T." value={Number(employee.tJabatan)} active={true} />
                                            <AllowanceRow label="Family T." value={Number(employee.tKeluarga)} active={true} />
                                            <AllowanceRow label="Communication" value={Number(employee.tKomunikasi)} active={true} />
                                            <AllowanceRow label="Special T." value={Number(employee.tKhusus)} active={true} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <Separator className="bg-slate-100 dark:bg-slate-800" />

                            {/* Bank Information */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 group">
                                    <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <CreditCard className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Bank Information</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 px-1">
                                    <InfoItem label="Bank Name" value={employee.bank?.bankNama || '-'} uppercase />
                                    <InfoItem label="Branch" value={employee.bankUnit || '-'} />
                                    <div className="col-span-full sm:col-span-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Account Number</p>
                                        <p className="font-black font-mono text-lg text-slate-900 dark:text-white tracking-widest">{employee.bankRekNo || '-'}</p>
                                    </div>
                                    <div className="col-span-full sm:col-span-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Account Name</p>
                                        <p className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">{employee.bankRekName || '-'}</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="pb-10">
                            {isLoadingHistory ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="h-10 w-10 animate-spin rounded-xl border-4 border-blue-500 border-t-transparent shadow-lg shadow-blue-500/20"></div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Records...</p>
                                </div>
                            ) : !history || history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl group bg-slate-50/50 dark:bg-slate-900/30">
                                    <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Calendar className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No payroll history recorded</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map((record: PayrollHistoryRecord) => (
                                        <div key={record.id} className="group relative flex items-center justify-between p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-200 dark:hover:border-blue-900 transition-all hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-none overflow-hidden">
                                            <div className="absolute left-0 top-0 w-1 h-full bg-blue-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                                                    <Banknote className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{record.periodName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">PROCESSED</span>
                                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{format(new Date(record.processDate), 'dd MMM yyyy')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-lg text-emerald-600 dark:text-emerald-400 tracking-tighter">{formatCurrency(record.takeHomePay)}</p>
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Net Take Home</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Internal Helper Components for consistent styling
function InfoItem({ label, value, fontMono = false, isBadge = false, uppercase = false }: {
    label: string;
    value: React.ReactNode;
    fontMono?: boolean;
    copyable?: boolean;
    isBadge?: boolean;
    uppercase?: boolean;
}) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</p>
            {isBadge ? (
                <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-black">
                    {value}
                </div>
            ) : (
                <p className={cn(
                    "font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight",
                    fontMono && "font-mono tracking-tighter",
                    uppercase && "uppercase"
                )}>
                    {value}
                </p>
            )}
        </div>
    );
}

function AllowanceRow({ label, value, active }: { label: string; value: number; active: boolean }) {
    const formatCurrency = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
    return (
        <div className={cn(
            "flex flex-col p-2.5 rounded-xl border transition-all",
            active ? "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800" : "opacity-40 grayscale border-dashed border-slate-200 dark:border-slate-800"
        )}>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{label}</span>
            <div className="flex items-center justify-between">
                <span className={cn(
                    "text-xs font-black",
                    active ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-600 line-through"
                )}>
                    {formatCurrency(value)}
                </span>
                {!active && <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />}
            </div>
        </div>
    );
}
