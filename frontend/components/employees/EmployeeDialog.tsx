"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    Loader2,
    Save,
    CheckCircle2,
    ShieldCheck,
    Users2,
    Banknote,
    Fingerprint,
    IdCard,
    MapPin,
    Shield,
    GraduationCap,
    HeartPulse,
    Baby,
    Scale,
    Map,
    Stethoscope,
    Coins,
    Percent,
    User,
    Mail,
    Phone,
    Calendar,
    Building2,
    Briefcase,
    CreditCard,
    Wallet,
    Crown,
    Target,
    Award,
    Sparkles,
    BadgeCheck,
    Lock,
    Globe,
    Home,
    Cake,
    Heart,
    FileText,
    ClipboardCheck,
    TrendingUp,
    ShieldAlert,
    Calculator,
    PieChart
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/ui-switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

import { Employee, EmployeeListResponse } from '@/types/employee';
import { api } from '@/lib/api';
import { employeeFormSchema, EmployeeFormValues } from '@/lib/validations/employee';

interface EmployeeDialogProps {
    employee: Employee | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

// Gradient Icons Component
const GradientIcon = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-sm rounded-full" />
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-full">
            {children}
        </div>
    </div>
);

// Stat Card Component
const StatCard = ({ label, value, icon, color = "blue" }: { label: string; value: string; icon: React.ReactNode; color?: string }) => (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/20`}>
            <div className={`text-${color}-600 dark:text-${color}-400`}>
                {icon}
            </div>
        </div>
        <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export function EmployeeDialog({ employee, open, onOpenChange, onSuccess }: EmployeeDialogProps) {
    const queryClient = useQueryClient();

    // Fetch potential superiors
    const { data: employeesData } = useQuery<EmployeeListResponse>({
        queryKey: ['employees', 'list', 'all'],
        queryFn: async () => {
            const response = await api.get('/employees?limit=1000');
            return response.data;
        },
        enabled: open
    });
    const employeesList = employeesData?.data || [];

    // Form Setup
    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeFormSchema) as any,
        defaultValues: {
            emplId: '',
            nik: '',
            idAbsen: '',
            nama: '',
            ktpNo: '',
            npwp: '',
            tglNpwp: '',
            kdSex: 'LAKILAKI',
            email: '',
            handphone: '',
            tglLhr: '',
            tmpLhr: '',
            kdAgm: '',
            kdSkl: '',
            alamat1: '',
            alamat2: '',
            kota: '',
            kdPos: '',
            tglNikah: '',
            jmlAnak: 0,
            tglMsk: '',
            tglAngkat: '',
            tglOut: '',
            kdSts: 'AKTIF',
            kdJns: 'TETAP',
            kdDept: '',
            kdJab: '',
            kdPkt: '',
            kdCmpy: '',
            kdFact: '',
            superiorId: '',
            superior2Id: '',
            jnsJamId: '',
            groupShiftId: '',
            noBpjsTk: '',
            noBpjsKes: '',
            kdBpjsTk: true,
            kdBpjsKes: true,
            bankCode: '',
            bankUnit: '',
            bankRekNo: '',
            bankRekName: '',
            pokokBln: 0,
            tTransport: 0,
            tMakan: 0,
            tJabatan: 0,
            tKeluarga: 0,
            tKomunikasi: 0,
            tKhusus: 0,
            tLmbtetap: 0,
            fixOther: 0,
            kdPtkp: 1,
            potRumah: 0,
            noAnggota: '',
            kdTransp: true,
            kdMakan: true,
            kdOut: false,
            kdLmb: true,
            kdSpl: true,
            kdPjk: true,
            kdKoperasi: false,
            kdptRumah: false,
            kdSpsi: false,
        }
    });

    // Calculate form completion percentage
    const calculateCompletion = () => {
        const values = form.getValues();
        const totalFields = Object.keys(values).length;
        const filledFields = Object.values(values).filter(v => {
            if (typeof v === 'string') return v.trim().length > 0;
            if (typeof v === 'number') return v !== 0;
            return true;
        }).length;
        return Math.round((filledFields / totalFields) * 100);
    };

    // Reset Form when opening/closing or switching employee
    useEffect(() => {
        if (open) {
            if (employee) {
                const values: EmployeeFormValues = {
                    emplId: employee.emplId || '',
                    nik: employee.nik || '',
                    idAbsen: employee.idAbsen || '',
                    nama: employee.nama || '',
                    ktpNo: employee.ktpNo || '',
                    npwp: employee.npwp || '',
                    tglNpwp: employee.tglNpwp ? new Date(employee.tglNpwp).toISOString().split('T')[0] : '',
                    kdSex: employee.kdSex || 'LAKILAKI',
                    email: employee.email || '',
                    handphone: employee.handphone || '',
                    tglLhr: employee.tglLhr ? new Date(employee.tglLhr).toISOString().split('T')[0] : '',
                    tmpLhr: employee.tmpLhr || '',
                    kdAgm: employee.kdAgm || '',
                    kdSkl: employee.kdSkl || '',
                    alamat1: employee.alamat1 || '',
                    alamat2: employee.alamat2 || '',
                    kota: employee.kota || '',
                    kdPos: employee.kdPos || '',
                    tglNikah: employee.tglNikah ? new Date(employee.tglNikah).toISOString().split('T')[0] : '',
                    jmlAnak: employee.jmlAnak || 0,
                    tglMsk: employee.tglMsk ? new Date(employee.tglMsk).toISOString().split('T')[0] : '',
                    tglAngkat: employee.tglAngkat ? new Date(employee.tglAngkat).toISOString().split('T')[0] : '',
                    tglOut: employee.tglOut ? new Date(employee.tglOut).toISOString().split('T')[0] : '',
                    kdSts: employee.kdSts || 'AKTIF',
                    kdJns: employee.kdJns || 'KONTRAK',
                    kdDept: employee.kdDept || '',
                    kdJab: employee.kdJab || '',
                    kdPkt: employee.kdPkt || '',
                    kdCmpy: employee.kdCmpy || '',
                    kdFact: employee.kdFact || '',
                    superiorId: employee.superiorId || '',
                    superior2Id: employee.superior2Id || '',
                    jnsJamId: employee.jnsJamId || '',
                    groupShiftId: employee.groupShiftId || '',
                    noBpjsTk: employee.noBpjsTk || '',
                    noBpjsKes: employee.noBpjsKes || '',
                    kdBpjsTk: employee.kdBpjsTk ?? true,
                    kdBpjsKes: employee.kdBpjsKes ?? true,
                    bankCode: employee.bankCode || '',
                    bankUnit: employee.bankUnit || '',
                    bankRekNo: employee.bankRekNo || '',
                    bankRekName: employee.bankRekName || '',
                    pokokBln: employee.pokokBln || 0,
                    tTransport: employee.tTransport || 0,
                    tMakan: employee.tMakan || 0,
                    tJabatan: employee.tJabatan || 0,
                    tKeluarga: employee.tKeluarga || 0,
                    tKomunikasi: employee.tKomunikasi || 0,
                    tKhusus: employee.tKhusus || 0,
                    tLmbtetap: employee.tLmbtetap || 0,
                    fixOther: employee.fixOther || 0,
                    kdPtkp: employee.kdPtkp || 1,
                    potRumah: employee.potRumah || 0,
                    noAnggota: employee.noAnggota || '',
                    kdTransp: employee.kdTransp ?? true,
                    kdMakan: employee.kdMakan ?? true,
                    kdOut: employee.kdOut ?? false,
                    kdLmb: employee.kdLmb ?? true,
                    kdSpl: employee.kdSpl ?? true,
                    kdPjk: employee.kdPjk ?? true,
                    kdKoperasi: employee.kdKoperasi ?? false,
                    kdptRumah: employee.kdptRumah ?? false,
                    kdSpsi: employee.kdSpsi ?? false,
                };
                form.reset(values);
            } else {
                form.reset();
            }
        }
    }, [employee, open, form]);

    // Fetch Master Data
    const { data: departments } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => (await api.get('/org/departments')).data.data
    });

    const { data: positions } = useQuery({
        queryKey: ['positions'],
        queryFn: async () => (await api.get('/positions')).data.data
    });

    const { data: groupShifts } = useQuery({
        queryKey: ['groupShifts'],
        queryFn: async () => (await api.get('/shifts/groups')).data.data
    });

    const { data: shiftTypes } = useQuery({
        queryKey: ['shiftTypes'],
        queryFn: async () => (await api.get('/shifts/types')).data.data
    });

    // Submit Handler
    const onSubmit = async (values: EmployeeFormValues) => {
        try {
            if (employee) {
                await api.put(`/employees/${employee.id}`, values);
                toast.success(
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span>Employee updated successfully</span>
                    </div>
                );
            } else {
                await api.post('/employees', values);
                toast.success(
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                        <span>Employee created successfully</span>
                    </div>
                );
            }
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            onSuccess();
            onOpenChange(false);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; error?: string } } };
            console.error('Submission error:', error);
            if (err.response?.data) {
                toast.error(
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-rose-500" />
                        <span>{err.response.data.message || err.response.data.error || 'Failed to save employee'}</span>
                    </div>
                );
            } else {
                toast.error('Failed to save employee. Please check your connection.');
            }
        }
    };

    const onError = (errors: unknown) => {
        console.error('Validation errors:', errors);
        toast.error(
            <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <span>Please check the form for errors</span>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-[98vw] sm:w-full h-[98vh] sm:h-[95vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl border border-slate-300 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 shadow-2xl">
                <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <GradientIcon>
                                <User className="h-5 w-5 text-white" />
                            </GradientIcon>
                            <div>
                                <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent uppercase tracking-tight">
                                    {employee ? 'Edit Employee Profile' : 'Create New Employee'}
                                </DialogTitle>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {employee ? 'Update employee information and settings' : 'Initialize new employee record in the system'}
                                </p>
                            </div>
                        </div>
                        {employee && (
                            <Badge className="px-3 py-1.5 font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                                <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                Existing Profile
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="px-6 pt-4 pb-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Form Completion</span>
                        <span className="text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            {calculateCompletion()}%
                        </span>
                    </div>
                    <Progress value={calculateCompletion()} className="h-2 bg-slate-200 dark:bg-slate-800" />
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex-1 flex flex-col overflow-hidden">
                        <Tabs defaultValue="personal" className="flex-1 overflow-hidden flex flex-col">
                            {/* Enhanced Tabs */}
                            <div className="px-6 pt-4">
                                <TabsList className="grid w-full grid-cols-4 h-12 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                                    <TabsTrigger value="personal" className="rounded-lg font-bold text-xs uppercase tracking-tighter data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-900 flex items-center gap-2 transition-all duration-200">
                                        <div className="p-1.5 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                            <User className="h-3.5 w-3.5" />
                                        </div>
                                        <span>Personal</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="employment" className="rounded-lg font-bold text-xs uppercase tracking-tighter data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-emerald-200 dark:data-[state=active]:border-emerald-900 flex items-center gap-2 transition-all duration-200">
                                        <div className="p-1.5 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                                            <Briefcase className="h-3.5 w-3.5" />
                                        </div>
                                        <span>Employment</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="legal" className="rounded-lg font-bold text-xs uppercase tracking-tighter data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-purple-200 dark:data-[state=active]:border-purple-900 flex items-center gap-2 transition-all duration-200">
                                        <div className="p-1.5 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                        </div>
                                        <span>Legal & ID</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="payroll" className="rounded-lg font-bold text-xs uppercase tracking-tighter data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-amber-200 dark:data-[state=active]:border-amber-900 flex items-center gap-2 transition-all duration-200">
                                        <div className="p-1.5 rounded-md bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                                            <Wallet className="h-3.5 w-3.5" />
                                        </div>
                                        <span>Finance</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* SCROLLABLE CONTENT AREA */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-6">

                                {/* TAB 1: PERSONAL */}
                                <TabsContent value="personal" className="space-y-6 mt-0">
                                    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-900/10">
                                        <CardHeader className="py-4">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                                    <User className="h-4 w-4 text-white" />
                                                </div>
                                                <span>Basic Information</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="emplId"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                <IdCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                Employee ID *
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        placeholder="EMP001"
                                                                        {...field}
                                                                        disabled={!!employee}
                                                                        className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 font-mono font-bold pl-10 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                                                    />
                                                                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="nik"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                                NIK (National ID)
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        placeholder="16-digit identity number"
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 font-medium pl-10 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                                                                    />
                                                                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="idAbsen"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                <ClipboardCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                                Attendance ID
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="System ID"
                                                                    {...field}
                                                                    value={field.value ?? ''}
                                                                    className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 font-mono focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="nama"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                            <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                            Full Legal Name *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="John Doe"
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 font-bold text-lg focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                Work Email
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        type="email"
                                                                        placeholder="email@company.com"
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 pl-10 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                                                    />
                                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="handphone"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                Mobile Phone
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        placeholder="08123456789"
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 pl-10 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                                                                    />
                                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="kdSex"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                                                                Biological Gender
                                                            </FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-pink-500 dark:focus:border-pink-400 transition-colors">
                                                                        <SelectValue placeholder="Select Gender" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                                                    <SelectItem value="LAKILAKI" className="font-bold hover:bg-slate-100 dark:hover:bg-slate-800">Male</SelectItem>
                                                                    <SelectItem value="PEREMPUAN" className="font-bold hover:bg-slate-100 dark:hover:bg-slate-800">Female</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="tglLhr"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                <Cake className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                                Birth Date
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        type="date"
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 pl-10 focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                                                                    />
                                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="jmlAnak"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                <Baby className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                                                Number of Children
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    {...field}
                                                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                                                    className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-rose-500 dark:focus:border-rose-400 transition-colors"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Contact Information Card */}
                                    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <CardHeader className="py-4">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                                                    <Home className="h-4 w-4 text-white" />
                                                </div>
                                                <span>Contact & Address</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="alamat1"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                            Primary Address
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Street address, building, etc."
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="kota"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                City
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="City name"
                                                                    {...field}
                                                                    value={field.value ?? ''}
                                                                    className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="kdPos"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                Postal Code
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Postal code"
                                                                    {...field}
                                                                    value={field.value ?? ''}
                                                                    className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB 2: EMPLOYMENT */}
                                <TabsContent value="employment" className="space-y-6 mt-0">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Organizational Structure Card */}
                                            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <CardHeader className="py-4">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                                            <Users2 className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span>Organizational Structure</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="superiorId"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                        <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                                        Direct Superior (Atasan 1)
                                                                    </FormLabel>
                                                                    <Select onValueChange={(val) => field.onChange(val === 'unassigned' ? '' : val)} value={field.value || ''}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 transition-colors">
                                                                                <SelectValue placeholder="Select Superior" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                                                            <SelectItem value="unassigned" className="font-bold text-slate-400 italic">No Superior (Top Level)</SelectItem>
                                                                            {employeesList.filter(e => e.emplId !== employee?.emplId).map((emp) => (
                                                                                <SelectItem key={emp.emplId} value={emp.emplId} className="font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
                                                                                    {emp.nama} ({emp.emplId})
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-xs" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="superior2Id"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                        <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                                        Second Superior (Atasan 2)
                                                                    </FormLabel>
                                                                    <Select onValueChange={(val) => field.onChange(val === 'unassigned' ? '' : val)} value={field.value || ''}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 transition-colors">
                                                                                <SelectValue placeholder="Select Second Superior" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                                                            <SelectItem value="unassigned" className="font-bold text-slate-400 italic">No Second Superior</SelectItem>
                                                                            {employeesList.filter(e => e.emplId !== employee?.emplId && e.emplId !== form.watch('superiorId')).map((emp) => (
                                                                                <SelectItem key={emp.emplId} value={emp.emplId} className="font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
                                                                                    {emp.nama} ({emp.emplId})
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-xs" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="kdDept"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                        <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                        Department
                                                                    </FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors">
                                                                                <SelectValue placeholder="Select Department" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                                                            {departments?.map((d: { kdDept: string; nmDept: string }) => (
                                                                                <SelectItem key={d.kdDept} value={d.kdDept} className="font-bold hover:bg-slate-100 dark:hover:bg-slate-800">{d.nmDept}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-xs" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="kdJab"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                        <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                        Position
                                                                    </FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors">
                                                                                <SelectValue placeholder="Select Position" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                                                            {positions?.map((p: { kdJab: string; nmJab: string }) => (
                                                                                <SelectItem key={p.kdJab} value={p.kdJab} className="font-bold hover:bg-slate-100 dark:hover:bg-slate-800">{p.nmJab}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-xs" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Employment Details Card */}
                                            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <CardHeader className="py-4">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                                                            <Calendar className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span>Employment Details</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="tglMsk"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                        Join Date
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Input
                                                                                type="date"
                                                                                {...field}
                                                                                value={field.value ?? ''}
                                                                                className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 pl-10 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                                                                            />
                                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage className="text-xs" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="tglOut"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                        Termination Date
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Input
                                                                                type="date"
                                                                                {...field}
                                                                                value={field.value ?? ''}
                                                                                className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 pl-10 focus:border-rose-500 dark:focus:border-rose-400 transition-colors"
                                                                            />
                                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage className="text-xs" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="kdSts"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                        Working Status
                                                                    </FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                                                            <SelectItem value="AKTIF" className="font-bold text-emerald-600 dark:text-emerald-400">Active</SelectItem>
                                                                            <SelectItem value="TIDAK_AKTIF" className="font-bold text-rose-600 dark:text-rose-400">Inactive</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-xs" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="kdJns"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                        Contract Type
                                                                    </FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                                                            <SelectItem value="TETAP" className="font-bold">Permanent</SelectItem>
                                                                            <SelectItem value="KONTRAK" className="font-bold">Contract</SelectItem>
                                                                            <SelectItem value="HARIAN" className="font-bold">Daily</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-xs" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Company & Shift Stats Sidebar */}
                                        <div className="space-y-6">
                                            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <CardHeader className="py-4">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
                                                            <Target className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span>Company Details</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="kdCmpy"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                    Company Code
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="CMPY01"
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 font-bold"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="kdFact"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                    Factory Code
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="FACT01"
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 font-bold"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </CardContent>
                                            </Card>

                                            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <CardHeader className="py-4">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                                                            <Clock className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span>Shift Configuration</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="groupShiftId"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                    Group Shift
                                                                </FormLabel>
                                                                <Select onValueChange={(val) => field.onChange(val === 'unassigned' ? '' : val)} value={field.value || ''}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700">
                                                                            <SelectValue placeholder="Select Group" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                                                        <SelectItem value="unassigned" className="italic text-slate-400">No Group</SelectItem>
                                                                        {groupShifts?.map((g: any) => (
                                                                            <SelectItem key={g.id} value={String(g.id)}>{g.groupName} ({g.groupShift})</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage className="text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="jnsJamId"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                    Shift Type
                                                                </FormLabel>
                                                                <Select onValueChange={(val) => field.onChange(val === 'unassigned' ? '' : val)} value={field.value || ''}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700">
                                                                            <SelectValue placeholder="Select Shift" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                                                        <SelectItem value="unassigned" className="italic text-slate-400">No Shift</SelectItem>
                                                                        {shiftTypes?.map((s: any) => (
                                                                            <SelectItem key={s.id} value={String(s.id)}>{s.jnsJam || s.kdJam} ({s.kdJam})</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage className="text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </CardContent>
                                            </Card>

                                            {/* Quick Stats */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <StatCard
                                                    label="Total Salary"
                                                    value={`Rp ${form.watch('pokokBln')?.toLocaleString() || '0'}`}
                                                    icon={<Coins className="h-4 w-4" />}
                                                    color="amber"
                                                />
                                                <StatCard
                                                    label="Status"
                                                    value={form.watch('kdSts') === 'AKTIF' ? 'Active' : 'Inactive'}
                                                    icon={form.watch('kdSts') === 'AKTIF' ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                                    color={form.watch('kdSts') === 'AKTIF' ? 'emerald' : 'rose'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* TAB 3: LEGAL & ID */}
                                <TabsContent value="legal" className="space-y-6 mt-0">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Identity Documents Card */}
                                        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <CardHeader className="py-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                                        <FileText className="h-4 w-4 text-white" />
                                                    </div>
                                                    <span>Identity Documents</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-6">
                                                <FormField
                                                    control={form.control}
                                                    name="ktpNo"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                <IdCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                KTP Number
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        placeholder="32xxxxxxxxxxxxxx"
                                                                        className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 pl-10 font-mono"
                                                                    />
                                                                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="npwp"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                    <Scale className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                                    NPWP Number
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <Input
                                                                            {...field}
                                                                            value={field.value ?? ''}
                                                                            placeholder="00.000.000.0-000.000"
                                                                            className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 pl-10 font-mono"
                                                                        />
                                                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage className="text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="tglNpwp"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                    NPWP Registration Date
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <Input
                                                                            {...field}
                                                                            value={field.value ?? ''}
                                                                            type="date"
                                                                            className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 pl-10"
                                                                        />
                                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage className="text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Social Security Card */}
                                        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <CardHeader className="py-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                                                        <ShieldCheck className="h-4 w-4 text-white" />
                                                    </div>
                                                    <span>Social Security (BPJS)</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/30 dark:from-blue-900/10 dark:to-blue-800/5 rounded-xl border border-blue-200 dark:border-blue-800">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-sm">BPJS Ketenagakerjaan</h4>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">Employment Social Security</p>
                                                            </div>
                                                        </div>
                                                        <FormField
                                                            control={form.control}
                                                            name="kdBpjsTk"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Switch
                                                                            checked={field.value}
                                                                            onCheckedChange={field.onChange}
                                                                            className="data-[state=checked]:bg-blue-600"
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name="noBpjsTk"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                    BPJS TK Number
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        disabled={!form.watch('kdBpjsTk')}
                                                                        className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 disabled:opacity-50"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/30 dark:from-emerald-900/10 dark:to-emerald-800/5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                                                <HeartPulse className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-sm">BPJS Kesehatan</h4>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">Health Social Security</p>
                                                            </div>
                                                        </div>
                                                        <FormField
                                                            control={form.control}
                                                            name="kdBpjsKes"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Switch
                                                                            checked={field.value}
                                                                            onCheckedChange={field.onChange}
                                                                            className="data-[state=checked]:bg-emerald-600"
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name="noBpjsKes"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                    BPJS Kesehatan Number
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        disabled={!form.watch('kdBpjsKes')}
                                                                        className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 disabled:opacity-50"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Deductions & Memberships Card */}
                                    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <CardHeader className="py-4 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                                                    <Users2 className="h-4 w-4 text-white" />
                                                </div>
                                                <span>Deductions & Memberships</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="kdKoperasi"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                    className="mb-2 data-[state=checked]:bg-blue-600"
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-xs font-bold text-center cursor-pointer">
                                                                <Building2 className="h-5 w-5 mx-auto mb-1 text-slate-600 dark:text-slate-400" />
                                                                Koperasi
                                                            </FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="kdSpsi"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 transition-colors">
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                    className="mb-2 data-[state=checked]:bg-red-600"
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-xs font-bold text-center cursor-pointer">
                                                                <Users2 className="h-5 w-5 mx-auto mb-1 text-slate-600 dark:text-slate-400" />
                                                                SPSI
                                                            </FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="kdptRumah"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-colors">
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                    className="mb-2 data-[state=checked]:bg-amber-600"
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-xs font-bold text-center cursor-pointer">
                                                                <Home className="h-5 w-5 mx-auto mb-1 text-slate-600 dark:text-slate-400" />
                                                                Rumah
                                                            </FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="kdPjk"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-green-500 dark:hover:border-green-500 transition-colors">
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                    className="mb-2 data-[state=checked]:bg-green-600"
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-xs font-bold text-center cursor-pointer">
                                                                <Scale className="h-5 w-5 mx-auto mb-1 text-slate-600 dark:text-slate-400" />
                                                                Pajak
                                                            </FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="noAnggota"
                                                    render={({ field }) => (
                                                        <FormItem className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                Member Number
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    value={field.value ?? ''}
                                                                    placeholder="KOP-XXXX"
                                                                    className="h-11 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB 4: PAYROLL */}
                                <TabsContent value="payroll" className="space-y-6 mt-0">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Salary Structure Card */}
                                            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <CardHeader className="py-4 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                                                            <Coins className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span>Monthly Salary Structure</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    <div className="space-y-6">
                                                        {/* Basic Salary */}
                                                        <FormField
                                                            control={form.control}
                                                            name="pokokBln"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                        <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                                        Basic Monthly Salary
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-600">Rp</div>
                                                                            <Input
                                                                                type="number"
                                                                                {...field}
                                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                                                className="h-12 pl-12 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-800 text-lg font-black text-amber-700 dark:text-amber-400"
                                                                            />
                                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/month</div>
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage className="text-xs" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Allowances Grid */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <FormField
                                                                control={form.control}
                                                                name="tTransport"
                                                                render={({ field }) => (
                                                                    <FormItem className="space-y-2">
                                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                                            <Car className="h-3.5 w-3.5 text-blue-500" />
                                                                            Transport
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rp</div>
                                                                                <Input
                                                                                    type="number"
                                                                                    {...field}
                                                                                    onChange={e => field.onChange(Number(e.target.value))}
                                                                                    className="h-10 pl-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                                                                                />
                                                                            </div>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="tMakan"
                                                                render={({ field }) => (
                                                                    <FormItem className="space-y-2">
                                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                                            <Utensils className="h-3.5 w-3.5 text-emerald-500" />
                                                                            Meal
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rp</div>
                                                                                <Input
                                                                                    type="number"
                                                                                    {...field}
                                                                                    onChange={e => field.onChange(Number(e.target.value))}
                                                                                    className="h-10 pl-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                                                                                />
                                                                            </div>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="tJabatan"
                                                                render={({ field }) => (
                                                                    <FormItem className="space-y-2">
                                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                                            <Award className="h-3.5 w-3.5 text-purple-500" />
                                                                            Position
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rp</div>
                                                                                <Input
                                                                                    type="number"
                                                                                    {...field}
                                                                                    onChange={e => field.onChange(Number(e.target.value))}
                                                                                    className="h-10 pl-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                                                                                />
                                                                            </div>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="tKeluarga"
                                                                render={({ field }) => (
                                                                    <FormItem className="space-y-2">
                                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                                            <Users2 className="h-3.5 w-3.5 text-pink-500" />
                                                                            Family
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rp</div>
                                                                                <Input
                                                                                    type="number"
                                                                                    {...field}
                                                                                    onChange={e => field.onChange(Number(e.target.value))}
                                                                                    className="h-10 pl-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                                                                                />
                                                                            </div>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="tKomunikasi"
                                                                render={({ field }) => (
                                                                    <FormItem className="space-y-2">
                                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                                            <Phone className="h-3.5 w-3.5 text-sky-500" />
                                                                            Communication
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rp</div>
                                                                                <Input
                                                                                    type="number"
                                                                                    {...field}
                                                                                    onChange={e => field.onChange(Number(e.target.value))}
                                                                                    className="h-10 pl-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                                                                                />
                                                                            </div>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="tKhusus"
                                                                render={({ field }) => (
                                                                    <FormItem className="space-y-2">
                                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                                                            Special
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rp</div>
                                                                                <Input
                                                                                    type="number"
                                                                                    {...field}
                                                                                    onChange={e => field.onChange(Number(e.target.value))}
                                                                                    className="h-10 pl-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                                                                                />
                                                                            </div>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Bank Details Card */}
                                            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <CardHeader className="py-4 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/10">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
                                                            <CreditCard className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span>Bank Disbursement Details</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="bankCode"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                                                        Bank Code
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="BCA"
                                                                            {...field}
                                                                            value={field.value ?? ''}
                                                                            className="h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="bankUnit"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                                                        Branch Unit
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Main Branch"
                                                                            {...field}
                                                                            value={field.value ?? ''}
                                                                            className="h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="bankRekNo"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                                                        Account Number
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="1234567890"
                                                                            {...field}
                                                                            value={field.value ?? ''}
                                                                            className="h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="bankRekName"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                                                        Account Name
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="JOHN DOE"
                                                                            {...field}
                                                                            value={field.value ?? ''}
                                                                            className="h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold uppercase"
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Control Panel Sidebar */}
                                        <div className="space-y-6">
                                            {/* Tax & Deductions Card */}
                                            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <CardHeader className="py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700">
                                                            <Calculator className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span>Tax & Deductions</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6 space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="kdPtkp"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                                    PTKP Status
                                                                </FormLabel>
                                                                <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value.toString()}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                                                                        <SelectItem value="1">TK/0 - Single</SelectItem>
                                                                        <SelectItem value="2">K/0 - Married, 0 children</SelectItem>
                                                                        <SelectItem value="3">K/1 - Married, 1 child</SelectItem>
                                                                        <SelectItem value="4">K/2 - Married, 2 children</SelectItem>
                                                                        <SelectItem value="5">K/3 - Married, 3+ children</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="potRumah"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                                                    Housing Deduction
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rp</div>
                                                                        <Input
                                                                            type="number"
                                                                            {...field}
                                                                            onChange={e => field.onChange(Number(e.target.value))}
                                                                            className="h-10 pl-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </CardContent>
                                            </Card>

                                            {/* Allowance Controls Card */}
                                            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <CardHeader className="py-4">
                                                    <CardTitle className="text-sm font-bold">Allowance Controls</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <FormField
                                                                control={form.control}
                                                                name="kdPjk"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                                                        <FormLabel className="text-xs font-medium cursor-pointer">
                                                                            Income Tax
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Switch
                                                                                checked={field.value}
                                                                                onCheckedChange={field.onChange}
                                                                                className="data-[state=checked]:bg-blue-600"
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="kdLmb"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                                                        <FormLabel className="text-xs font-medium cursor-pointer">
                                                                            Overtime
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Switch
                                                                                checked={field.value}
                                                                                onCheckedChange={field.onChange}
                                                                                className="data-[state=checked]:bg-emerald-600"
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="kdTransp"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                                                        <FormLabel className="text-xs font-medium cursor-pointer">
                                                                            Transport
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Switch
                                                                                checked={field.value}
                                                                                onCheckedChange={field.onChange}
                                                                                className="data-[state=checked]:bg-blue-600"
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="kdMakan"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                                                        <FormLabel className="text-xs font-medium cursor-pointer">
                                                                            Meal
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Switch
                                                                                checked={field.value}
                                                                                onCheckedChange={field.onChange}
                                                                                className="data-[state=checked]:bg-emerald-600"
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Salary Summary */}
                                            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <CardHeader className="py-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                                                            <PieChart className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span>Salary Summary</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-slate-600 dark:text-slate-400">Basic Salary</span>
                                                            <span className="font-bold">Rp {(Number(form.watch('pokokBln')) || 0).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-slate-600 dark:text-slate-400">Total Allowances</span>
                                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                                Rp {(
                                                                    (Number(form.watch('tTransport')) || 0) +
                                                                    (Number(form.watch('tMakan')) || 0) +
                                                                    (Number(form.watch('tJabatan')) || 0) +
                                                                    (Number(form.watch('tKeluarga')) || 0) +
                                                                    (Number(form.watch('tKomunikasi')) || 0) +
                                                                    (Number(form.watch('tKhusus')) || 0)
                                                                ).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <Separator />
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-bold">Gross Salary</span>
                                                            <span className="font-black text-lg text-blue-600 dark:text-blue-400">
                                                                Rp {(
                                                                    (Number(form.watch('pokokBln')) || 0) +
                                                                    (Number(form.watch('tTransport')) || 0) +
                                                                    (Number(form.watch('tMakan')) || 0) +
                                                                    (Number(form.watch('tJabatan')) || 0) +
                                                                    (Number(form.watch('tKeluarga')) || 0) +
                                                                    (Number(form.watch('tKomunikasi')) || 0) +
                                                                    (Number(form.watch('tKhusus')) || 0)
                                                                ).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>

                            {/* FOOTER ACTIONS */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-t border-slate-300 dark:border-slate-800 backdrop-blur-sm">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <BadgeCheck className="h-4 w-4 text-emerald-500" />
                                    <span>Form completion: <span className="font-bold">{calculateCompletion()}%</span></span>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        className="font-bold border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all"
                                    >
                                        Discard Changes
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.formState.isSubmitting}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold uppercase tracking-wider text-sm h-12 px-8 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200"
                                    >
                                        {form.formState.isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                {employee ? 'Update Employee' : 'Create Employee'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Tabs>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

// Additional missing icons
const Car = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const Utensils = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const Clock = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);