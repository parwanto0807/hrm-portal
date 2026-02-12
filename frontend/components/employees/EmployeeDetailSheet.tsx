// components/employees/EmployeeDetailSheet.tsx
"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Employee } from '@/types/employee';
import { cn, formatDate } from '@/lib/utils';
import {
    User, Briefcase, Calendar,
    CreditCard, Banknote, AlertTriangle, FileText, Phone, MapPin
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmployeeDetailSheetProps {
    employee: Employee | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailSheet({ employee, open, onOpenChange }: EmployeeDetailSheetProps) {
    if (!open || !employee) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative z-50 w-full sm:max-w-2xl h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">

                {/* Header */}
                <div className="flex-none p-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
                                {employee.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{employee.nama}</h2>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-tighter">{employee.emplId}</span>
                                    {employee.nik && (
                                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-tighter">NIK: {employee.nik}</span>
                                    )}
                                    <Badge className={cn(
                                        "text-[10px] uppercase font-black px-1.5 py-0.5 border-none",
                                        employee.kdSts === 'AKTIF' ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-slate-400 hover:bg-slate-500 text-white"
                                    )}>
                                        {employee.kdSts === 'AKTIF' ? 'Active Employee' : 'Inactive'}
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

                {/* Scrollable Content */}
                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-8 pb-10">
                        {/* 1. PERSONAL DETAILS */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <User className="h-4 w-4" />
                                </div>
                                <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Personal Data</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 px-1">
                                <InfoItem label="Full Name" value={employee.nama} />
                                <InfoItem label="Place of Birth" value={employee.tmpLhr} />
                                <InfoItem label="Date of Birth" value={formatDate(employee.tglLhr)} />
                                <InfoItem label="Gender" value={employee.kdSex === 'LAKILAKI' ? 'Male' : 'Female'} />
                                <InfoItem label="Religion" value={employee.agama?.nmAgm} />
                                <InfoItem label="Marital Status" value={employee.pkt?.nmPkt} />
                                <InfoItem label="Number of Children" value={employee.jmlAnak?.toString()} />
                            </div>
                        </section>

                        <Separator className="bg-slate-100 dark:bg-slate-800" />

                        {/* 2. CONTACT & ADDRESS */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Contact & Address</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 px-1">
                                <InfoItem label="Mobile Phone" value={employee.handphone} copyable icon={<Phone className="h-3 w-3" />} />
                                <InfoItem label="Home Phone" value={employee.telpon} />
                                <InfoItem label="Email Address" value={employee.email} copyable lowercase />
                                <div className="col-span-full">
                                    <InfoItem label="Current Address" value={employee.alamat1} />
                                    <div className="flex gap-4 mt-1 text-xs text-slate-500">
                                        <span>City: <strong className="text-slate-700 dark:text-slate-300">{employee.kota || '-'}</strong></span>
                                        <span>Post Code: <strong className="text-slate-700 dark:text-slate-300">{employee.kdPos || '-'}</strong></span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Separator className="bg-slate-100 dark:bg-slate-800" />

                        {/* 3. EMPLOYMENT INFORMATION */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                    <Briefcase className="h-4 w-4" />
                                </div>
                                <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Employment Details</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 px-1">
                                <InfoItem label="Company" value={employee.company?.company || employee.kdCmpy} />
                                <InfoItem label="Employment Status" value={employee.kdJns} isBadge />
                                <InfoItem label="Position" value={employee.jabatan?.nmJab} fontBold />
                                <InfoItem label="Department" value={employee.dept?.nmDept} />
                                <InfoItem label="Division/Bagian" value={employee.bag?.nmBag} />
                                <InfoItem label="Section/Seksi" value={employee.sie?.nmSeksie} />
                                <InfoItem label="Factory/Location" value={employee.fact?.nmFact} />
                                <InfoItem label="Join Date" value={formatDate(employee.tglMsk)} />
                                <InfoItem label="Direct Supervisor" value={employee.superiorId} />
                                <InfoItem label="Manager" value={employee.superior2Id} />
                            </div>
                        </section>

                        <Separator className="bg-slate-100 dark:bg-slate-800" />

                        {/* 4. DOCUMENTS & IDs */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Documents & IDs</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 px-1">
                                <InfoItem label="NIK (KTP)" value={employee.ktpNo || employee.nik} fontMono />
                                <InfoItem label="NPWP" value={employee.npwp} fontMono />
                                <InfoItem label="BPJS Ketenagakerjaan" value={employee.noBpjsTk} fontMono />
                                <InfoItem label="BPJS Kesehatan" value={employee.noBpjsKes} fontMono />
                                <InfoItem label="Fingerprint ID" value={employee.idAbsen} fontMono />
                            </div>
                        </section>

                        <Separator className="bg-slate-100 dark:bg-slate-800" />

                        {/* 5. PAYROLL & BANK */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                    <Banknote className="h-4 w-4" />
                                </div>
                                <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Payroll & Bank</h3>
                            </div>

                            {/* Bank Details Card */}
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Bank Name" value={employee.bank?.bankNama || employee.bankCode} />
                                    <InfoItem label="Branch Unit" value={employee.bankUnit} />
                                    <InfoItem label="Account Number" value={employee.bankRekNo} fontMono fontBold size="lg" />
                                    <InfoItem label="Account Name" value={employee.bankRekName} />
                                </div>
                            </div>

                            {/* Salary settings (simplified view) */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Base Salary</span>
                                    <span className="font-black text-xl text-slate-900 dark:text-white">{formatCurrency(Number(employee.pokokBln))}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <AllowanceBadge label="Transport" value={employee.tTransport} active={!!employee.kdTransp} formatCurrency={formatCurrency} />
                                    <AllowanceBadge label="Meal" value={employee.tMakan} active={!!employee.kdMakan} formatCurrency={formatCurrency} />
                                    <AllowanceBadge label="Position" value={employee.tJabatan} active={Number(employee.tJabatan) > 0} formatCurrency={formatCurrency} />
                                    <AllowanceBadge label="Communication" value={employee.tKomunikasi} active={Number(employee.tKomunikasi) > 0} formatCurrency={formatCurrency} />
                                </div>
                            </div>
                        </section>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

// Helper Components
function InfoItem({
    label,
    value,
    fontMono = false,
    isBadge = false,
    uppercase = false,
    lowercase = false,
    fontBold = false,
    copyable = false,
    size = 'md',
    icon
}: {
    label: string;
    value: React.ReactNode;
    fontMono?: boolean;
    isBadge?: boolean;
    uppercase?: boolean;
    lowercase?: boolean;
    fontBold?: boolean;
    copyable?: boolean;
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
}) {
    if (!value) return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-sm text-slate-300 dark:text-slate-700 font-medium">-</p>
        </div>
    );

    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</p>
            <div className="flex items-center gap-2">
                {icon && <span className="text-slate-400">{icon}</span>}
                {isBadge ? (
                    <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none">
                        {value}
                    </Badge>
                ) : (
                    <p className={cn(
                        "text-slate-900 dark:text-slate-100 leading-tight break-all",
                        fontMono && "font-mono tracking-tighter",
                        uppercase && "uppercase",
                        lowercase && "lowercase",
                        fontBold && "font-bold",
                        size === 'lg' ? "text-lg" : "text-sm font-medium"
                    )}>
                        {value}
                    </p>
                )}
            </div>
        </div>
    );
}

function AllowanceBadge({ label, value, active, formatCurrency }: { label: string; value: number | string | null; active: boolean; formatCurrency: (v: number) => string }) {
    const numValue = Number(value || 0);
    return (
        <div className={cn(
            "flex justify-between items-center p-2.5 rounded-lg border",
            active
                ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50 grayscale opacity-60"
        )}>
            <span className="text-[10px] font-bold text-slate-500">{label}</span>
            <span className={cn("text-xs font-bold", active ? "text-slate-900 dark:text-white" : "text-slate-400")}>{formatCurrency(numValue)}</span>
        </div>
    )
}
