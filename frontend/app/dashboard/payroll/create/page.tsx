"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    Calendar,
    Save,
    ArrowLeft,
    Info,
    CheckCircle2,
    Home
} from 'lucide-react';

import Link from 'next/link';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { api } from '@/lib/api';

const payrollFormSchema = z.object({
    name: z.string().min(1, 'Nama periode wajib diisi'),
    startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
    endDate: z.string().min(1, 'Tanggal akhir wajib diisi'),
    notes: z.string().optional(),
});

type PayrollFormValues = z.infer<typeof payrollFormSchema>;

export default function CreatePayrollPage() {
    const router = useRouter();

    const form = useForm<PayrollFormValues>({
        resolver: zodResolver(payrollFormSchema),
        defaultValues: {
            name: '',
            startDate: format(new Date(), 'yyyy-MM-01'), // Default to first day of current month
            endDate: format(new Date(), 'yyyy-MM-dd'),
            notes: '',
        }
    });

    const onSubmit = async (values: PayrollFormValues) => {
        try {
            await api.post('/payroll/periods', values);
            toast.success('Periode payroll berhasil dibuat');
            router.push('/dashboard/payroll');
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error(error);
            toast.error(err.response?.data?.message || 'Gagal membuat periode payroll');
        }
    };

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-2 lg:p-2 mx-auto w-full max-w-4xl pb-20">
            {/* Breadcrumb Section */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard" className="flex items-center gap-1">
                                <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Home className="h-3 w-3 mr-1" />
                                    Dashboard
                                </Badge>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard/payroll">
                                <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Payroll</Badge>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white border-transparent">
                                Tambah Periode
                            </Badge>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Button
                variant="ghost"
                className="w-fit text-muted-foreground hover:text-foreground pl-0 h-8 text-xs mb-[-8px]"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Kembali ke Daftar Payroll
            </Button>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Buat Periode Payroll Baru</h1>
                    <p className="text-muted-foreground mb-6">
                        Mulai siklus payroll baru. Ini akan membuat entri untuk semua karyawan aktif berdasarkan periode yang ditentukan.
                    </p>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <Card className="border-l-4 border-l-blue-600 shadow-md">
                                <CardHeader>
                                    <CardTitle>Detail Periode</CardTitle>
                                    <CardDescription>
                                        Tentukan rentang waktu untuk perhitungan payroll ini.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Periode</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="contoh: Payroll Januari 2026" {...field} className="text-lg font-medium" />
                                                </FormControl>
                                                <FormDescription>
                                                    Nama unik untuk mengidentifikasi periode payroll ini.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tanggal Mulai</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input type="date" className="pl-9" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tanggal Akhir</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input type="date" className="pl-9" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Catatan (Opsional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Informasi tambahan mengenai periode ini..."
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <>
                                            <span className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Buat Payroll
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

                {/* Sidebar Info */}
                <div className="w-full md:w-80 space-y-4">
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Catatan Penting
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-blue-700">
                            Membuat periode baru akan secara otomatis menghitung gaji pokok untuk semua karyawan aktif. Anda dapat menyesuaikan tunjangan dan potongan individu nanti di tampilan detail.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Daftar Periksa Sebelum Pembuatan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                    <span>Pastikan semua data karyawan sudah terbaru</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                    <span>Periksa catatan kehadiran untuk periode tersebut</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                    <span>Pastikan tarif pajak sudah sesuai</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
