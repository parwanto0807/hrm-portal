"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Banknote, Calculator, Plus, Download } from 'lucide-react';
import HeaderCard from '@/components/ui/header-card';
import { PayrollHistoryTable } from '@/components/payroll/PayrollHistoryTable';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import { useAuth } from "@/app/hooks/useAuth";
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
import { Home } from "lucide-react";

export default function PayrollPage() {
    const router = useRouter();
    const { getUser } = useAuth();
    const user = getUser();
    const isEmployee = user?.role === 'EMPLOYEE';

    const { data: periods, isLoading } = useQuery({
        queryKey: ['payrollPeriods', isEmployee ? 'my' : 'all'],
        queryFn: async () => {
            const endpoint = isEmployee ? '/payroll/my' : '/payroll/periods';
            const res = await api.get(endpoint);
            return res.data.data;
        }
    });

    const [showAmount, setShowAmount] = React.useState(false);
    const latestPeriod = periods?.[0];

    // Helper currency formatter
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-2 lg:p-2 pb-24 md:pb-6">
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
                        <BreadcrumbPage>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white border-transparent">
                                {isEmployee ? 'Slip Gaji Saya' : 'Payroll'}
                            </Badge>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title={isEmployee ? "Riwayat Slip Gaji" : "Manajemen Payroll"}
                description={isEmployee ? "Lihat dan unduh riwayat slip gaji bulanan Anda." : "Kelola periode payroll bulanan, hitung gaji, dan pantau pembayaran."}
                icon={<Banknote className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                gradientFrom="from-emerald-600"
                gradientTo="to-teal-600"
                patternText="PT. Grafindo Mitrasemesta"
                showActionArea={!isEmployee}
                actionArea={
                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <Button
                            variant="secondary"
                            className="flex-1 md:flex-none bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs h-9"
                            onClick={() => toast.info('Fitur ekspor akan segera hadir')}
                        >
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            Ekspor
                        </Button>
                        <Button
                            className="flex-1 md:flex-none bg-white text-emerald-600 hover:bg-emerald-50 text-xs h-9 font-bold"
                            onClick={() => router.push('/dashboard/payroll/create')}
                        >
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            Tambah
                        </Button>
                    </div>
                }
            />

            {/* Total Salary Summary Card (Latest Period) */}
            {latestPeriod && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Banknote className="h-32 w-32 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-blue-100 border-blue-400/30 bg-blue-500/20 text-[10px] uppercase tracking-wider">
                                    Periode Terkini
                                </Badge>
                                <span className="text-sm font-medium text-blue-100">{latestPeriod.name}</span>
                            </div>

                            <div className="flex items-baseline gap-1 mt-1">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                                    {showAmount ? formatCurrency(latestPeriod.totalAmount) : 'Rp XX.XXX.XXX'}
                                </h2>
                            </div>
                            <p className="text-xs text-blue-100/80 mt-1">
                                Info: Angka ini adalah total gaji bersih yang dibayarkan.
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 border border-white/10">
                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-50">Tampilkan</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={showAmount}
                                    onChange={(e) => setShowAmount(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-blue-900/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            <div className="px-1">
                <PayrollHistoryTable
                    data={periods || []}
                    isLoading={isLoading}
                    showAllStatus={!isEmployee}
                    showAmount={showAmount}
                />
            </div>
        </div>
    );
}
