"use client";

import React from "react";
import Link from "next/link";
import {
    Building2, Factory,
    Briefcase, GraduationCap, Landmark, Settings2,
    CalendarDays, CalendarRange, UserCog,
    ChevronRight, Cpu, Shield, Database,
    Globe, Bell, Key, Mail, Users2,
    Zap, HardDrive, RefreshCcw,
    BookOpen, Info,
    AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MysqlOldDialog } from "@/components/settings/MysqlOldDialog";
import { PayrollImportDialog } from "@/components/settings/PayrollImportDialog";

// Data shortcut untuk semua item dengan model yang sama
const shortcutItems = [
    // Master Data Items
    {
        title: 'Company',
        description: 'Data perusahaan',
        icon: Building2,
        color: 'bg-blue-500 text-white',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        category: 'master',
        href: '/dashboard/settings/master/company'
    },
    {
        title: 'Factory',
        description: 'Data pabrik',
        icon: Factory,
        color: 'bg-orange-500 text-white',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        category: 'master',
        href: '/dashboard/settings/master/factory'
    },
    {
        title: 'Struktur Organisasi',
        description: 'Struktur perusahaan',
        icon: UserCog,
        color: 'bg-indigo-500 text-white',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        borderColor: 'border-indigo-200 dark:border-indigo-800',
        category: 'master',
        href: '/dashboard/settings/master/organization-structure'
    },
    {
        title: 'Jabatan',
        description: 'Posisi dan role',
        icon: Briefcase,
        color: 'bg-slate-500 text-white',
        bgColor: 'bg-slate-50 dark:bg-slate-900/20',
        borderColor: 'border-slate-200 dark:border-slate-700',
        category: 'master',
        href: '/dashboard/settings/master/position'
    },
    {
        title: 'Level Karyawan',
        description: 'Tingkatan karyawan',
        icon: GraduationCap,
        color: 'bg-cyan-500 text-white',
        bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
        borderColor: 'border-cyan-200 dark:border-cyan-800',
        category: 'master',
        href: '/dashboard/settings/master/employee-level'
    },
    {
        title: 'Data Bank/Payroll',
        description: 'Informasi bank & gaji',
        icon: Landmark,
        color: 'bg-amber-500 text-white',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        category: 'master',
        href: '/dashboard/settings/master/bank-payroll'
    },

    // Parameter & Konfigurasi Items
    {
        title: 'Configurasi System',
        description: 'Pengaturan sistem',
        icon: Settings2,
        color: 'bg-rose-500 text-white',
        bgColor: 'bg-rose-50 dark:bg-rose-900/20',
        borderColor: 'border-rose-200 dark:border-rose-800',
        category: 'config',
        href: '/dashboard/settings/config/system'
    },
    {
        title: 'Periode Payroll & Absensi',
        description: 'Periode perhitungan',
        icon: CalendarRange,
        color: 'bg-green-500 text-white',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        category: 'config',
        href: '/dashboard/settings/config/payroll-period'
    },
    {
        title: 'Referensi Bulan',
        description: 'Kalender referensi',
        icon: CalendarDays,
        color: 'bg-purple-500 text-white',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        category: 'config',
        href: '/dashboard/settings/config/month-reference'
    },

    // System Items
    {
        title: 'Performance',
        description: 'Optimize system speed',
        icon: Zap,
        color: 'bg-yellow-500 text-white',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        category: 'system',
        href: '/dashboard/settings/system/performance'
    },
    {
        title: 'Security',
        description: 'Firewall & protection',
        icon: Shield,
        color: 'bg-red-500 text-white',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        category: 'system',
        href: '/dashboard/settings/system/security'
    },
    {
        title: 'Database',
        description: 'Backup & restore',
        icon: Database,
        color: 'bg-green-500 text-white',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        category: 'system',
        href: '/dashboard/settings/system/database'
    },
    {
        title: 'Network',
        description: 'Connectivity settings',
        icon: Globe,
        color: 'bg-cyan-500 text-white',
        bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
        borderColor: 'border-cyan-200 dark:border-cyan-800',
        category: 'system',
        href: '/dashboard/settings/system/network'
    },
    {
        title: 'Notifications',
        description: 'Alerts & reminders',
        icon: Bell,
        color: 'bg-pink-500 text-white',
        bgColor: 'bg-pink-50 dark:bg-pink-900/20',
        borderColor: 'border-pink-200 dark:border-pink-800',
        category: 'system',
        href: '/dashboard/settings/system/notifications'
    },
    {
        title: 'API Keys',
        description: 'Integration tokens',
        icon: Key,
        color: 'bg-violet-500 text-white',
        bgColor: 'bg-violet-50 dark:bg-violet-900/20',
        borderColor: 'border-violet-200 dark:border-violet-800',
        category: 'system',
        href: '/dashboard/settings/system/api-keys'
    },
    {
        title: 'Email',
        description: 'SMTP configuration',
        icon: Mail,
        color: 'bg-orange-500 text-white',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        category: 'system',
        href: '/dashboard/settings/system/email'
    },
    {
        title: 'User Roles',
        description: 'Permissions & access',
        icon: Users2,
        color: 'bg-slate-500 text-white',
        bgColor: 'bg-slate-50 dark:bg-slate-900/20',
        borderColor: 'border-slate-200 dark:border-slate-700',
        category: 'system',
        href: '/dashboard/settings/system/user-roles'
    },
    {
        title: 'Mysql Database Old',
        description: 'Legacy data explorer',
        icon: HardDrive,
        color: 'bg-indigo-600 text-white',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        borderColor: 'border-indigo-200 dark:border-indigo-800',
        category: 'system',
        href: '#mysql-old',
        isModal: true
    },
    {
        title: 'Workflow',
        description: 'Legacy data migration tools',
        icon: RefreshCcw,
        color: 'bg-teal-600 text-white',
        bgColor: 'bg-teal-50 dark:bg-teal-900/20',
        borderColor: 'border-teal-200 dark:border-teal-800',
        category: 'system',
        href: '#workflow',
        isModal: true
    }
];

// Group data untuk grouping jika diperlukan
const menuGroups = [
    {
        group: "Master Data",
        description: "Pengelolaan data entitas utama perusahaan",
        items: shortcutItems.filter(item => item.category === 'master')
    },
    {
        group: "Parameter & Konfigurasi",
        description: "Pengaturan sistem dan logika perhitungan",
        items: shortcutItems.filter(item => item.category === 'config')
    },
    {
        group: "System Settings",
        description: "Pengaturan sistem dan infrastruktur",
        items: shortcutItems.filter(item => item.category === 'system')
    }
];

export default function SettingsPage() {
    const [isMysqlOldOpen, setIsMysqlOldOpen] = React.useState(false);
    const [isWorkflowOpen, setIsWorkflowOpen] = React.useState(false);

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
            <MysqlOldDialog open={isMysqlOldOpen} onOpenChange={setIsMysqlOldOpen} />
            <PayrollImportDialog open={isWorkflowOpen} onOpenChange={setIsWorkflowOpen} />
            <div className="max-w-full mx-auto p-2 md:p-6 lg:p-6 space-y-8 w-full">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                                    Pengaturan Sistem
                                </h1>
                                <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                                >
                                    {shortcutItems.length} Modul
                                </Badge>
                            </div>
                            <p className="text-xs md:text-base text-muted-foreground mt-2">
                                Kelola konfigurasi sistem dan data master organisasi Anda secara terpusat
                            </p>

                        </div>

                    </div>
                    <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full max-w-xl grid-cols-4">
                        <TabsTrigger value="all">Semua</TabsTrigger>
                        <TabsTrigger value="master">Master Data</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                        <TabsTrigger value="guide" className="gap-2">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            Guide Import
                        </TabsTrigger>
                    </TabsList>

                    {/* All Settings Tab */}
                    <TabsContent value="all" className="space-y-10">
                        {menuGroups.map((group, idx) => (
                            <Card
                                key={idx}
                                className="border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-blue-500' :
                                                    idx === 1 ? 'bg-green-500' :
                                                        'bg-red-500'
                                                    }`}></div>
                                                {group.group}
                                            </CardTitle>
                                            <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                                {group.description}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="font-normal"
                                        >
                                            {group.items.length} item
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 w-full">
                                        {group.items.map((item, itemIdx) => {
                                            if (item.isModal) {
                                                return (
                                                    <div
                                                        key={itemIdx}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (item.href === '#mysql-old') {
                                                                setIsMysqlOldOpen(true);
                                                            } else if (item.href === '#workflow') {
                                                                setIsWorkflowOpen(true);
                                                            } else {
                                                                toast.info("Fitur Dalam Pengembangan", {
                                                                    description: "Modul ini sedang dalam tahap pengembangan.",
                                                                });
                                                            }
                                                        }}
                                                        className="block cursor-pointer"
                                                    >
                                                        <Card
                                                            className={`${item.bgColor} border ${item.borderColor} hover:shadow-md transition-all duration-300 hover:scale-[1.02] group`}
                                                        >
                                                            <CardContent className="p-4">
                                                                <div className="flex items-start gap-4">
                                                                    <div className={`p-2.5 rounded-lg ${item.color} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                                                                        <item.icon className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h3 className="font-semibold text-sm truncate group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                                                                            {item.title}
                                                                        </h3>
                                                                        <p className="text-xs text-muted-foreground truncate">
                                                                            {item.description}
                                                                        </p>
                                                                    </div>
                                                                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0 mt-1" />
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <Link
                                                    key={itemIdx}
                                                    href={item.href}
                                                    className="block"
                                                >
                                                    <Card
                                                        className={`${item.bgColor} border ${item.borderColor} hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer group`}
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start gap-4">
                                                                <div className={`p-2.5 rounded-lg ${item.color} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                                                                    <item.icon className="h-5 w-5" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-semibold text-sm truncate group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                                                                        {item.title}
                                                                    </h3>
                                                                    <p className="text-xs text-muted-foreground truncate">
                                                                        {item.description}
                                                                    </p>
                                                                </div>
                                                                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0 mt-1" />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* Master Data Tab */}
                    <TabsContent value="master" className="space-y-6">
                        <Card className="border shadow-sm overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-lg md:text-xl font-semibold">Master Data</CardTitle>
                                <p className="text-xs md:text-sm text-muted-foreground">Pengelolaan data entitas utama perusahaan</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                    {shortcutItems
                                        .filter(item => item.category === 'master')
                                        .map((item, idx) => (
                                            <Link
                                                key={idx}
                                                href={item.href}
                                                className="block"
                                            >
                                                <Card
                                                    className={`${item.bgColor} border ${item.borderColor} hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer group`}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex flex-col items-center text-center gap-3">
                                                            <div className={`p-3 rounded-lg ${item.color} transition-transform duration-300 group-hover:scale-110`}>
                                                                <item.icon className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-sm">{item.title}</h3>
                                                                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* System Tab */}
                    <TabsContent value="system" className="space-y-6">
                        <Card className="border shadow-sm overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-lg md:text-xl font-semibold">System Settings</CardTitle>
                                <p className="text-xs md:text-sm text-muted-foreground">Pengaturan sistem dan infrastruktur</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                    {shortcutItems
                                        .filter(item => item.category === 'system')
                                        .map((item, idx) => (
                                            <div
                                                key={idx}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (item.isModal && item.href === '#mysql-old') {
                                                        setIsMysqlOldOpen(true);
                                                        return;
                                                    }
                                                    toast.info("Fitur Dalam Pengembangan", {
                                                        description: "Modul ini sedang dalam tahap pengembangan.",
                                                    });
                                                }}
                                                className="block cursor-pointer"
                                            >
                                                <Card
                                                    className={`${item.bgColor} border ${item.borderColor} hover:shadow-md transition-all duration-300 hover:scale-[1.02] group`}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex flex-col items-center text-center gap-3">
                                                            <div className={`p-3 rounded-lg ${item.color} transition-transform duration-300 group-hover:scale-110`}>
                                                                <item.icon className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-sm">{item.title}</h3>
                                                                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    {/* Import Guide Tab */}
                    <TabsContent value="guide" className="space-y-6">
                        <Card className="border shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Panduan Migrasi Data Legacy</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">Langkah-langkah penting untuk migrasi data dari MySQL ke Postgres</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Column 1: Pre-requisites */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                                            <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">1</div>
                                            Persiapan Awal
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-lg border bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                                                <div className="flex items-start gap-3">
                                                    <Database className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                                    <div className="text-sm">
                                                        <p className="font-semibold">Koneksi Database</p>
                                                        <p className="text-muted-foreground text-xs mt-1">Pastikan status <strong>MySQL Database Old</strong> sudah ONLINE di menu System.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg border bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
                                                <div className="flex items-start gap-3">
                                                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                                    <div className="text-sm">
                                                        <p className="font-semibold">Relasi Data</p>
                                                        <p className="text-muted-foreground text-xs mt-1">Sistem menggunakan relasi Foreign Key yang ketat. Data master harus ada sebelum data transaksi diimport.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Logical Flow */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                                            <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">2</div>
                                            Urutan Import (Logical Flow)
                                        </div>

                                        <div className="relative space-y-4 pl-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                                            {/* Step 1 */}
                                            <div className="relative flex items-start gap-4">
                                                <div className="absolute -left-[2.35rem] p-1 bg-white dark:bg-slate-950 rounded-full border border-blue-500 z-10">
                                                    <Building2 className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <div className="flex-1 p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50">
                                                    <h4 className="text-sm font-bold flex items-center justify-between">
                                                        MASTER DATA ORGANISASI
                                                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 border-blue-200">Tahap 1</Badge>
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground mt-1">Company, Factory, Bagian, Department, Seksie.</p>
                                                </div>
                                            </div>

                                            {/* Step 2 */}
                                            <div className="relative flex items-start gap-4">
                                                <div className="absolute -left-[2.35rem] p-1 bg-white dark:bg-slate-950 rounded-full border border-emerald-500 z-10">
                                                    <Users2 className="h-4 w-4 text-emerald-500" />
                                                </div>
                                                <div className="flex-1 p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50">
                                                    <h4 className="text-sm font-bold flex items-center justify-between">
                                                        DATA KARYAWAN
                                                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 border-emerald-200">Tahap 2</Badge>
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground mt-1">Pastikan EMPL_ID & NIK sudah benar. Ini adalah anchor untuk data payroll.</p>
                                                </div>
                                            </div>

                                            {/* Step 3 */}
                                            <div className="relative flex items-start gap-4">
                                                <div className="absolute -left-[2.35rem] p-1 bg-white dark:bg-slate-950 rounded-full border border-violet-500 z-10">
                                                    <CalendarRange className="h-4 w-4 text-violet-500" />
                                                </div>
                                                <div className="flex-1 p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50">
                                                    <h4 className="text-sm font-bold flex items-center justify-between">
                                                        PERIODE & PARAMETER
                                                        <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 border-violet-200">Tahap 3</Badge>
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground mt-1">Buka Periode Payroll & Absensi. Pastikan Jenis Potongan/Tunjangan sudah sesuai.</p>
                                                </div>
                                            </div>

                                            {/* Step 4 */}
                                            <div className="relative flex items-start gap-4">
                                                <div className="absolute -left-[2.35rem] p-1 bg-white dark:bg-slate-950 rounded-full border border-rose-500 z-10">
                                                    <RefreshCcw className="h-4 w-4 text-rose-500" />
                                                </div>
                                                <div className="flex-1 p-3 rounded-lg border-2 border-rose-200/50 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-900/10 ring-2 ring-rose-500/5">
                                                    <h4 className="text-sm font-bold flex items-center justify-between text-rose-700 dark:text-rose-400">
                                                        WORKFLOW: IMPORT PAYROLL
                                                        <Badge variant="destructive">FINAL</Badge>
                                                    </h4>
                                                    <p className="text-xs mt-1">Eksekusi migrasi data Gaji, Potongan, Tunjangan, dan Rapel.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-8" />

                                <div className="p-4 rounded-xl border-dashed border-2 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                        <h4 className="font-bold text-sm">Ketentuan Re-Import (Upsert)</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-muted-foreground">
                                        <div className="space-y-2 p-3 bg-white dark:bg-slate-950 rounded border">
                                            <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">Update Data Otomatis</p>
                                            Jika Anda melakukan import ulang untuk <strong>Periode & Empl ID</strong> yang sama, sistem akan melakukan <em>Update</em> pada data yang sudah ada, bukan membuat data ganda.
                                        </div>
                                        <div className="space-y-2 p-3 bg-white dark:bg-slate-950 rounded border">
                                            <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">Integritas Data</p>
                                            Data yang sudah di-import tidak bisa di-delete melalui workflow ini. Gunakan menu Database di tab System untuk pembersihan data jika diperlukan.
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>


                {/* Footer Info */}
                <Card className="border-dashed bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Sistem Terintegrasi</p>
                                    <p className="text-xs text-muted-foreground">
                                        Semua pengaturan saling terhubung untuk konsistensi data
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                asChild
                            >
                                <Link href="/dashboard/settings/documentation">
                                    <Settings2 className="h-4 w-4 mr-2" />
                                    Dokumentasi
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}