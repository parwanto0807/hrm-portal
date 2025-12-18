"use client";

import React from "react";
import Link from "next/link";
import {
    Building2, Factory, Network, Layers,
    Briefcase, GraduationCap, Landmark, Settings2,
    CalendarDays, CalendarRange, UserCog, Boxes,
    ChevronRight, Cpu, Shield, Database,
    Globe, Bell, Key, Mail, Users2,
    Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        href: '/dashboard/settings/master/company' // Tambahkan href
    },
    {
        title: 'Factory',
        description: 'Data pabrik',
        icon: Factory,
        color: 'bg-orange-500 text-white',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        category: 'master',
        href: '/dashboard/settings/master/factory' // Sesuaikan dengan route Anda
    },
    {
        title: 'Bagian',
        description: 'Pengelolaan bagian',
        icon: Boxes,
        color: 'bg-emerald-500 text-white',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        category: 'master',
        href: '/dashboard/settings/master/bagian'
    },
    {
        title: 'Departement',
        description: 'Struktur departemen',
        icon: Network,
        color: 'bg-violet-500 text-white',
        bgColor: 'bg-violet-50 dark:bg-violet-900/20',
        borderColor: 'border-violet-200 dark:border-violet-800',
        category: 'master',
        href: '/dashboard/settings/master/department'
    },
    {
        title: 'Section',
        description: 'Pengaturan section',
        icon: Layers,
        color: 'bg-pink-500 text-white',
        bgColor: 'bg-pink-50 dark:bg-pink-900/20',
        borderColor: 'border-pink-200 dark:border-pink-800',
        category: 'master',
        href: '/dashboard/settings/master/section'
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
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
            <div className="max-w-full mx-auto p-6 space-y-8 w-full">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                                Pengaturan Sistem
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Kelola konfigurasi sistem dan data master organisasi Anda secara terpusat
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                        >
                            {shortcutItems.length} Modul
                        </Badge>
                    </div>
                    <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
                </div>

                {/* Tabs untuk Shortcuts */}
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="all">Semua</TabsTrigger>
                        <TabsTrigger value="master">Master Data</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
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
                                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-blue-500' :
                                                    idx === 1 ? 'bg-green-500' :
                                                        'bg-red-500'
                                                    }`}></div>
                                                {group.group}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
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
                                        {group.items.map((item, itemIdx) => (
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
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* Master Data Tab */}
                    <TabsContent value="master" className="space-y-6">
                        <Card className="border shadow-sm overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Master Data</CardTitle>
                                <p className="text-sm text-muted-foreground">Pengelolaan data entitas utama perusahaan</p>
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
                                <CardTitle className="text-xl font-semibold">System Settings</CardTitle>
                                <p className="text-sm text-muted-foreground">Pengaturan sistem dan infrastruktur</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                    {shortcutItems
                                        .filter(item => item.category === 'system')
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
        </div>
    );
}