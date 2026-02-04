"use client";

import React from "react";
import Link from "next/link";
import {
    BookOpen,
    ChevronLeft,
    Database,
    Users2,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    Info,
    RefreshCcw,
    Building2,
    CalendarRange,
    FileText,
    ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DocumentationPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/dashboard/settings">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            <h1 className="font-bold text-lg">Dokumentasi Sistem</h1>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                        v1.0.0
                    </Badge>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
                {/* Introduction */}
                <section className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">Pusat Dokumentasi & Panduan</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-3xl">
                        Selamat datang di pusat panduan teknis Axon HRM. Gunakan dokumentasi ini untuk memahami konfigurasi sistem,
                        prosedur migrasi data, dan manajemen infrastruktur.
                    </p>
                </section>

                <Separator />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="md:col-span-1 space-y-1">
                        <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Navigasi</h3>
                        <Button variant="secondary" className="w-full justify-start gap-2 text-sm font-medium">
                            <Database className="h-4 w-4" /> Migrasi Data
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2 text-sm font-medium text-slate-500">
                            <ShieldCheck className="h-4 w-4" /> Keamanan & Role
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2 text-sm font-medium text-slate-500">
                            <FileText className="h-4 w-4" /> Struktur API
                        </Button>
                    </aside>

                    {/* Documentation Content */}
                    <div className="md:col-span-3 space-y-10">
                        {/* Migration Guide Section */}
                        <section id="migration" className="space-y-6">
                            <div className="flex items-center gap-2">
                                <RefreshCcw className="h-6 w-6 text-blue-500" />
                                <h3 className="text-2xl font-bold">Panduan Migrasi Data Legacy</h3>
                            </div>

                            <Card className="border-2 border-blue-100 dark:border-blue-900/30 overflow-hidden">
                                <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        Prakata Penting
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Sistem HRM baru menggunakan database PostgreSQL dengan relasi data (Foreign Key) yang sangat ketat untuk menjamin integritas data.
                                        Proses import harus dilakukan sesuai urutan yang ditentukan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-8">
                                    {/* Prerequisites */}
                                    <div className="space-y-4">
                                        <h4 className="font-bold flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            Persiapan Sebelum Eksekusi
                                        </h4>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                                "Database MySQL Lama Status Online",
                                                "Konfigurasi IP & Port MySQL Benar",
                                                "Backup Database Postgres Saat Ini",
                                                "Mapping EMPL_ID & NIK Sudah Valid"
                                            ].map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 p-2 rounded bg-slate-100/50 dark:bg-slate-800/50">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Workflow Stepper */}
                                    <div className="space-y-6">
                                        <h4 className="font-bold flex items-center gap-2">
                                            <ArrowRight className="h-4 w-4 text-blue-500" />
                                            Urutan Import (Critical Flow)
                                        </h4>
                                        <div className="space-y-4 pl-8 border-l-2 border-slate-200 dark:border-slate-800">
                                            {/* Phase 1 */}
                                            <div className="relative">
                                                <div className="absolute -left-[2.6rem] top-0 p-1.5 bg-blue-500 text-white rounded-full">
                                                    <Building2 className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm">Tahap 1: Master Organisasi</p>
                                                    <p className="text-xs text-muted-foreground">Import Company, Factory, Bagian, Dept, Seksie. Tanpa ini, karyawan tidak punya &apos;rumah&apos;.</p>
                                                </div>
                                            </div>

                                            {/* Phase 2 */}
                                            <div className="relative">
                                                <div className="absolute -left-[2.6rem] top-0 p-1.5 bg-emerald-500 text-white rounded-full">
                                                    <Users2 className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm">Tahap 2: Data Karyawan</p>
                                                    <p className="text-xs text-muted-foreground">Import seluruh data personal karyawan. Gunakan tool &quot;Sync Karyawan&quot; di menu master.</p>
                                                </div>
                                            </div>

                                            {/* Phase 3 */}
                                            <div className="relative">
                                                <div className="absolute -left-[2.6rem] top-0 p-1.5 bg-violet-500 text-white rounded-full">
                                                    <CalendarRange className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm">Tahap 3: Periode & Parameter</p>
                                                    <p className="text-xs text-muted-foreground">Setup Periode Aktif dan master Jenis Potongan/Tunjangan.</p>
                                                </div>
                                            </div>

                                            {/* Phase 4 */}
                                            <div className="relative">
                                                <div className="absolute -left-[2.6rem] top-0 p-1.5 bg-rose-500 text-white rounded-full ring-4 ring-rose-500/20">
                                                    <RefreshCcw className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm text-rose-600 dark:text-rose-400">Tahap Akhir: Payroll Import</p>
                                                    <p className="text-xs text-muted-foreground font-medium">Eksekusi Gaji, Potongan, Tunjangan, dan Rapel.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Warnings */}
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                                        <div className="flex gap-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                                            <div className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                                                <p className="font-bold mb-1">Catatan Penting:</p>
                                                <ul className="list-disc pl-4 space-y-1">
                                                    <li>Logic import menggunakan metode <strong>Upsert</strong> (Update or Insert). Data lama dengan Periode & ID yang sama akan diperbarui.</li>
                                                    <li>Pastikan Nilai Pokok Bulan pada data Karyawan sudah disinkronkan sebelum import transaksi payroll.</li>
                                                    <li>Jangan menutup browser saat proses import sedang berjalan untuk menghindari data parsial.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Additional Info */}
                        <section className="p-8 border-2 border-dashed rounded-3xl text-center space-y-4">
                            <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                <Info className="h-6 w-6 text-slate-400" />
                            </div>
                            <h4 className="font-bold">Butuh bantuan lebih lanjut?</h4>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                Jika Anda menemukan kendala saat migrasi, silakan hubungi tim IT Administrator melalui kanal internal perusahaan.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
