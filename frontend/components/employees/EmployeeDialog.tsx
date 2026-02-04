"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    Loader2,
    Save,
    User,
    Mail,
    Phone,
    Calendar,
    Building2,
    Briefcase,
    CreditCard,
    Wallet,
    Fingerprint,
    IdCard,
    MapPin,
    Shield
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

import { Employee, EmployeeListResponse } from '@/types/employee';
import { api } from '@/lib/api';
import { employeeFormSchema, EmployeeFormValues } from '@/lib/validations/employee';

interface EmployeeDialogProps {
    employee: Employee | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EmployeeDialog({ employee, open, onOpenChange, onSuccess }: EmployeeDialogProps) {
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
        resolver: zodResolver(employeeFormSchema),
        defaultValues: {
            emplId: '',
            nik: '',
            idAbsen: '',
            nama: '',
            kdSex: 'LAKILAKI',
            email: '',
            handphone: '',
            tglLhr: '',
            tglMsk: '',
            tglOut: '',
            kdSts: 'AKTIF',
            kdJns: 'TETAP',
            kdDept: '',
            kdJab: '',
            kdCmpy: '',
            kdFact: '',
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
            kdTransp: false,
            kdMakan: false,
            kdOut: false,
            superiorId: '',
            superior2Id: '',
        }
    });

    // Reset Form when opening/closing or switching employee
    useEffect(() => {
        if (open) {
            if (employee) {
                // Formatting dates for input type="date"
                const formatDate = (date: Date | string | null | undefined) => {
                    if (!date) return '';
                    return new Date(date).toISOString().split('T')[0];
                };

                form.reset({
                    emplId: employee.emplId,
                    nik: employee.nik || '',
                    idAbsen: employee.idAbsen || '',
                    nama: employee.nama,
                    kdSex: employee.kdSex,
                    email: employee.email || '',
                    handphone: employee.handphone || '',
                    tglLhr: formatDate(employee.tglLhr),
                    tglMsk: formatDate(employee.tglMsk),
                    tglOut: formatDate(employee.tglOut),
                    kdSts: employee.kdSts,
                    kdJns: employee.kdJns,
                    kdDept: employee.kdDept || '',
                    kdJab: employee.kdJab || '',
                    kdCmpy: employee.kdCmpy || '',
                    kdFact: employee.kdFact || '',
                    bankCode: employee.bankCode || '',
                    bankUnit: employee.bankUnit || '',
                    bankRekNo: employee.bankRekNo || '',
                    bankRekName: employee.bankRekName || '',
                    pokokBln: Number(employee.pokokBln) || 0,
                    tTransport: Number(employee.tTransport) || 0,
                    tMakan: Number(employee.tMakan) || 0,
                    tJabatan: Number(employee.tJabatan) || 0,
                    tKeluarga: Number(employee.tKeluarga) || 0,
                    tKomunikasi: Number(employee.tKomunikasi) || 0,
                    tKhusus: Number(employee.tKhusus) || 0,
                    tLmbtetap: Number(employee.tLmbtetap) || 0,
                    fixOther: Number(employee.fixOther) || 0,
                    kdTransp: Boolean(employee.kdTransp),
                    kdMakan: Boolean(employee.kdMakan),
                    kdOut: Boolean(employee.kdOut),
                    superiorId: employee.superiorId || '',
                    superior2Id: employee.superior2Id || '',
                });
            } else {
                form.reset({
                    emplId: '',
                    nik: '',
                    idAbsen: '',
                    nama: '',
                    kdSex: 'LAKILAKI',
                    email: '',
                    handphone: '',
                    tglLhr: '',
                    tglMsk: '',
                    tglOut: '',
                    kdSts: 'AKTIF',
                    kdJns: 'TETAP',
                    kdDept: '',
                    kdJab: '',
                    kdCmpy: '',
                    kdFact: '',
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
                    kdTransp: false,
                    kdMakan: false,
                    kdOut: false,
                    superiorId: '',
                    superior2Id: '',
                });
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

    // Submit Handler
    const onSubmit = async (values: EmployeeFormValues) => {
        try {
            console.log('Submitting values:', values);
            if (employee) {
                await api.put(`/employees/${employee.id}`, values);
                toast.success('Employee updated successfully');
            } else {
                await api.post('/employees', values);
                toast.success('Employee created successfully');
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; error?: string } } };
            console.error('Submission error:', error);
            if (err.response?.data) {
                console.error('Error response data:', err.response.data);
                toast.error(err.response.data.message || err.response.data.error || 'Failed to save employee');
            } else {
                toast.error('Failed to save employee. Please check your connection.');
            }
        }
    };

    const onError = (errors: unknown) => {
        console.error('Validation errors:', errors);
        toast.error('Please check the form for errors');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95vw] sm:w-full h-[95vh] sm:h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent uppercase tracking-tight">
                        {employee ? 'Edit Employee Data' : 'Initialize New Employee'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex-1 flex flex-col overflow-hidden">
                        <Tabs defaultValue="personal" className="flex-1 overflow-hidden flex flex-col">
                            <TabsList className="grid w-full grid-cols-3 mx-6 h-11 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
                                <TabsTrigger value="personal" className="rounded-lg font-bold text-xs uppercase tracking-tighter data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 flex items-center gap-2">
                                    <User className="h-3.5 w-3.5" />
                                    <span>Personal</span>
                                </TabsTrigger>
                                <TabsTrigger value="employment" className="rounded-lg font-bold text-xs uppercase tracking-tighter data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 flex items-center gap-2">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    <span>Employment</span>
                                </TabsTrigger>
                                <TabsTrigger value="payroll" className="rounded-lg font-bold text-xs uppercase tracking-tighter data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 flex items-center gap-2">
                                    <Wallet className="h-3.5 w-3.5" />
                                    <span>Finance</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* SCROLLABLE CONTENT AREA */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                                {/* TAB 1: PERSONAL */}
                                <TabsContent value="personal" className="space-y-6 mt-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="emplId"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <IdCard className="h-3 w-3" />
                                                        Employee ID *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="E.g. EMP001" {...field} disabled={!!employee} className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-mono font-bold" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="nik"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <Shield className="h-3 w-3" />
                                                        NIK (National ID)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="16-digit identity number" {...field} value={field.value || ''} className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-medium" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="idAbsen"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <Fingerprint className="h-3 w-3" />
                                                        Attendance ID
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="System ID" {...field} value={field.value || ''} className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-mono" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="nama"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                    <User className="h-3 w-3" />
                                                    Full Legal Name *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-black text-slate-900 dark:text-white" />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <Mail className="h-3 w-3" />
                                                        Work Email
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="email@company.com" {...field} value={field.value || ''} className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-medium" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="handphone"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <Phone className="h-3 w-3" />
                                                        Mobile Phone
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="08123456789" {...field} value={field.value || ''} className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-medium" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="kdSex"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <User className="h-3 w-3" />
                                                        Biological Gender
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold">
                                                                <SelectValue placeholder="Select Gender" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                            <SelectItem value="LAKILAKI" className="font-bold">Male</SelectItem>
                                                            <SelectItem value="PEREMPUAN" className="font-bold">Female</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tglLhr"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <Calendar className="h-3 w-3" />
                                                        Birth Date
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </TabsContent>

                                {/* TAB 2: EMPLOYMENT */}
                                <TabsContent value="employment" className="space-y-6 mt-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="superiorId"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                                        <User className="h-3 w-3" />
                                                        Superior ID / Manager (Atasan 1)
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 font-bold">
                                                                <SelectValue placeholder="Select Superior" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                            <SelectItem value="none" className="font-bold text-slate-400 italic">No Superior (Top Level)</SelectItem>
                                                            {employeesList.filter(e => e.emplId !== employee?.emplId).map((emp) => (
                                                                <SelectItem key={emp.emplId} value={emp.emplId} className="font-bold">
                                                                    {emp.nama} ({emp.emplId})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="superior2Id"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                                        <User className="h-3 w-3" />
                                                        Second Superior (Atasan 2 / Manager)
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 font-bold">
                                                                <SelectValue placeholder="Select Second Superior" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                            <SelectItem value="none" className="font-bold text-slate-400 italic">No Second Superior</SelectItem>
                                                            {employeesList.filter(e => e.emplId !== employee?.emplId && e.emplId !== form.watch('superiorId')).map((emp) => (
                                                                <SelectItem key={emp.emplId} value={emp.emplId} className="font-bold">
                                                                    {emp.nama} ({emp.emplId})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="kdCmpy"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <Building2 className="h-3 w-3" />
                                                        Company Instance
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="E.g. CMPY01" {...field} value={field.value || ''} className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="kdFact"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <MapPin className="h-3 w-3" />
                                                        Factory / Site Location
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="E.g. FACT01" {...field} value={field.value || ''} className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="kdDept"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <Building2 className="h-3 w-3" />
                                                        Assigned Department
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold">
                                                                <SelectValue placeholder="Select Department" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                            {departments?.map((d: { kdDept: string; nmDept: string }) => (
                                                                <SelectItem key={d.kdDept} value={d.kdDept} className="font-bold">{d.nmDept}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="kdJab"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <Briefcase className="h-3 w-3" />
                                                        Job Title / Position
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold">
                                                                <SelectValue placeholder="Select Position" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                            {positions?.map((p: { kdJab: string; nmJab: string }) => (
                                                                <SelectItem key={p.kdJab} value={p.kdJab} className="font-bold">{p.nmJab}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="tglMsk"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <Calendar className="h-3 w-3" />
                                                        Join Date
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold text-blue-600 dark:text-blue-400" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tglOut"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                        <Calendar className="h-3 w-3" />
                                                        Termination Date
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold text-rose-600 dark:text-rose-400" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="kdSts"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Working Status</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800 font-bold">
                                                            <SelectItem value="AKTIF" className="font-bold text-emerald-600 dark:text-emerald-400">Active</SelectItem>
                                                            <SelectItem value="TIDAK_AKTIF" className="font-bold text-rose-600 dark:text-rose-400">Inactive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="kdJns"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Contract Type</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800 font-bold">
                                                            <SelectItem value="TETAP" className="font-bold">Permanent</SelectItem>
                                                            <SelectItem value="KONTRAK" className="font-bold">Contract</SelectItem>
                                                            <SelectItem value="HARIAN" className="font-bold">Daily</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </TabsContent>

                                {/* TAB 3: PAYROLL */}
                                <TabsContent value="payroll" className="space-y-6 mt-0">
                                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500" />
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Monthly Fixed Income</h3>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="pokokBln"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Basic Monthly Salary (IDR)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">Rp</span>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                                className="h-10 pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-black text-lg text-blue-600 dark:text-blue-400"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="tTransport"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Transport</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 bg-white dark:bg-slate-950 dark:border-slate-800 font-bold" /></FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tMakan"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Meal</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 bg-white dark:bg-slate-950 dark:border-slate-800 font-bold" /></FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tJabatan"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Position</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 bg-white dark:bg-slate-950 dark:border-slate-800 font-bold" /></FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tKeluarga"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Family</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 bg-white dark:bg-slate-950 dark:border-slate-800 font-bold" /></FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tKomunikasi"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Communication</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 bg-white dark:bg-slate-950 dark:border-slate-800 font-bold" /></FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tKhusus"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Special</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 bg-white dark:bg-slate-950 dark:border-slate-800 font-bold" /></FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tLmbtetap"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Fixed Overtime</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 bg-white dark:bg-slate-950 dark:border-slate-800 font-bold" /></FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="fixOther"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Other Adjustments</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 bg-white dark:bg-slate-950 dark:border-slate-800 font-bold" /></FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="mt-8 p-5 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-300">Bank Disbursement Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="bankCode"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-500">Bank Name / Code</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="E.g. BCA" {...field} value={field.value || ''} className="h-10 bg-white dark:bg-slate-950 dark:border-slate-800 font-bold" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="bankUnit"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-500">Bank Branch / Unit</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Branch name" {...field} value={field.value || ''} className="h-10 bg-white dark:bg-slate-950 dark:border-slate-800 font-bold" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="bankRekNo"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-500">Account Number</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Account number" {...field} value={field.value || ''} className="h-10 bg-white dark:bg-slate-950 dark:border-slate-800 font-black tracking-widest" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="bankRekName"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-500">Account Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Name on account" {...field} value={field.value || ''} className="h-10 bg-white dark:bg-slate-950 dark:border-slate-800 font-bold uppercase" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>

                            {/* FOOTER ACTIONS */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="order-2 sm:order-1 font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                                    Discard Changes
                                </Button>
                                <Button type="submit" disabled={form.formState.isSubmitting} className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] h-11 px-8 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">
                                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> : <Save className="mr-2 h-4 w-4 text-white" />}
                                    Commit Employee Data
                                </Button>
                            </div>
                        </Tabs>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
