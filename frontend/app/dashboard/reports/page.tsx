"use client";

import React from 'react';
import Link from 'next/link';
import {
    FileSpreadsheet, CalendarCheck, TrendingUp, BarChart3,
    ChevronRight, FileText, Clock, Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import HeaderCard from '@/components/ui/header-card';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from 'lucide-react';

type ReportCardType = {
    title: string;
    desc: string;
    href: string;
    icon: React.ElementType;
    color: string;
    badge: string;
    badgeColor: string;
    tags: string[];
    coming?: boolean;
};

const REPORT_CARDS: ReportCardType[] = [
    {
        title: 'Rekap Laporan Payroll',
        desc: 'Ringkasan gaji kotor, potongan BPJS, PPh 21, dan THP per periode. Export ke Excel multi-sheet.',
        href: '/dashboard/reports/payroll-summary',
        icon: FileSpreadsheet,
        color: 'from-emerald-600 to-teal-600',
        badge: 'Tersedia',
        badgeColor: 'bg-emerald-100 text-emerald-700',
        tags: ['Payroll', 'Excel', 'BPJS', 'PPh 21'],
    },
    {
        title: 'Rekap Laporan Absensi',
        desc: 'Ringkasan hadir, alpha, izin, sakit, cuti, lembur, dan keterlambatan per periode per karyawan.',
        href: '/dashboard/reports/attendance-summary',
        icon: CalendarCheck,
        color: 'from-blue-600 to-indigo-600',
        badge: 'Tersedia',
        badgeColor: 'bg-blue-100 text-blue-700',
        tags: ['Absensi', 'Lembur', 'Excel'],
    },
    {
        title: 'Laporan Kinerja KPI',
        desc: 'Evaluasi KPI karyawan per periode penilaian — grafik pencapaian dan skor per departemen.',
        href: '/dashboard/reports/kpi-summary',
        icon: TrendingUp,
        color: 'from-violet-600 to-purple-600',
        badge: 'Tersedia',
        badgeColor: 'bg-violet-100 text-violet-700',
        tags: ['KPI', 'Kinerja'],
    },
    {
        title: 'Laporan PPh 21 Tahunan',
        desc: 'Rekap pajak penghasilan pasal 21 tahunan per karyawan untuk keperluan pelaporan SPT.',
        href: '/dashboard/reports/pph21-annual',
        icon: FileText,
        color: 'from-amber-600 to-orange-600',
        badge: 'Tersedia',
        badgeColor: 'bg-amber-100 text-amber-700',
        tags: ['PPh 21', 'SPT', 'Pajak'],
    },
    {
        title: 'Laporan Lembur',
        desc: 'Detail jam lembur per periode — per karyawan, per departemen, total biaya lembur.',
        href: '/dashboard/reports/overtime-summary',
        icon: Clock,
        color: 'from-rose-600 to-pink-600',
        badge: 'Tersedia',
        badgeColor: 'bg-rose-100 text-rose-700',
        tags: ['Lembur', 'Overtime'],
    },
    {
        title: 'Dashboard Analitik SDM',
        desc: 'Visualisasi interaktif — turnover, headcount, komposisi usia, dan tren absensi.',
        href: '/dashboard/reports/hr-analytics',
        icon: BarChart3,
        color: 'from-slate-700 to-slate-800',
        badge: 'Tersedia',
        badgeColor: 'bg-slate-100 text-slate-700',
        tags: ['Analitik', 'Grafik', 'SDM'],
    },
];

export default function ReportsPage() {
    return (
        <div className="flex flex-col gap-4 md:gap-6 p-2 md:p-6 pb-24">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">
                                <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Home className="h-3 w-3 mr-1" />Dashboard
                                </Badge>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            <Badge className="bg-violet-600 hover:bg-violet-700 text-white border-transparent">
                                <BarChart3 className="h-3 w-3 mr-1" />Laporan & Analitik
                            </Badge>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="Pusat Laporan & Analitik"
                description="Akses semua laporan payroll, absensi, KPI, dan analitik SDM dari satu tempat. Export ke Excel & PDF."
                icon={<BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                gradientFrom="from-violet-600"
                gradientTo="to-indigo-600"
                patternText="HRM REPORTS & ANALYTICS"
            />

            {/* Report Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {REPORT_CARDS.map((card) => {
                    const Icon = card.icon;
                    const Wrapper = card.coming ? 'div' : Link;
                    const wrapperProps = card.coming ? {} : { href: card.href };

                    return (
                        <Wrapper
                            key={card.title}
                            {...(wrapperProps as any)}
                            className={`group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all duration-200 ${card.coming ? 'opacity-70' : 'hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer'}`}
                        >
                            {/* Gradient top bar */}
                            <div className={`h-1.5 bg-gradient-to-r ${card.color} w-full`} />

                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Badge className={`text-[10px] border-0 ${card.badgeColor}`}>
                                            {card.coming && <Zap className="h-2.5 w-2.5 mr-0.5" />}
                                            {card.badge}
                                        </Badge>
                                    </div>
                                </div>

                                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                                    {card.desc}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {card.tags.map(tag => (
                                        <span key={tag} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {!card.coming && (
                                    <div className="flex items-center justify-end text-xs text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                        <span>Buka Laporan</span>
                                        <ChevronRight className="h-3.5 w-3.5 ml-0.5 transform group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                )}
                            </div>
                        </Wrapper>
                    );
                })}
            </div>

            {/* Quick links */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 p-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Akses Cepat — Halaman Terkait
                </h3>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'Daftar Payroll', href: '/dashboard/payroll' },
                        { label: 'Monitor Kontrak PKWT', href: '/dashboard/employees/contracts' },
                        { label: 'Data Absensi', href: '/dashboard/attendance' },
                        { label: 'Tarif TER PPh 21', href: '/dashboard/settings/master/tarif-pph' },
                        { label: 'Konfigurasi BPJS', href: '/dashboard/settings/master/bpjs-config' },
                        { label: 'Skala Upah', href: '/dashboard/settings/master/skala-upah' },
                    ].map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-400 transition-all"
                        >
                            {link.label}
                            <ChevronRight className="h-3 w-3" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
