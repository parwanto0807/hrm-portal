"use client";

import React from 'react';
import {
    LayoutDashboard,
    FileText,
    ChevronRight
} from 'lucide-react';
import HeaderCard from '@/components/ui/header-card';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RequestForm } from '@/components/requests/RequestForm';
import { useRouter } from 'next/navigation';

export default function RequestLeavePage() {
    const router = useRouter();

    return (
        <div className="p-2 md:p-6 space-y-4 md:space-y-6 pb-24 animate-in fade-in duration-500">
            {/* Breadcrumb Section */}
            <div className="mb-2 md:mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">
                                <Badge variant="outline" className="text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <LayoutDashboard className="h-3 w-3 mr-2" />
                                    Dashboard
                                </Badge>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/leaves">
                                <Badge variant="outline" className="text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <FileText className="h-3 w-3 mr-2" />
                                    Pengajuan
                                </Badge>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>
                                <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md shadow-blue-500/20">
                                    Buat Pengajuan
                                </Badge>
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Header Card */}
            <HeaderCard
                title="Form Pengajuan"
                description="Ajukan cuti, izin, sakit, atau dinas luar dengan mudah."
                icon={<FileText className="h-6 w-6 text-white" />}
                gradientFrom="from-blue-600"
                gradientTo="to-cyan-600"
                patternText="Request Form"
                showActionArea={false}
            />

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">
                                Formulir Pengajuan
                            </CardTitle>
                            <CardDescription>
                                Silakan lengkapi data di bawah ini untuk memproses pengajuan Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RequestForm
                                onSuccess={() => router.push('/dashboard/leaves')}
                                onCancel={() => router.back()}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-black uppercase tracking-tight text-blue-700 dark:text-blue-400">
                                Informasi Penting
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-slate-600 dark:text-slate-400 space-y-3">
                            <p>
                                <strong>Cuti Tahunan:</strong> Pastikan Anda memiliki sisa kuota cuti yang cukup sebelum mengajukan.
                            </p>
                            <p>
                                <strong>Sakit:</strong> Wajib melampirkan surat keterangan dokter untuk ijin sakit lebih dari 1 hari.
                            </p>
                            <p>
                                <strong>Persetujuan:</strong> Pengajuan Anda akan diproses oleh atasan langsung dan HRD. Cek status secara berkala.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
