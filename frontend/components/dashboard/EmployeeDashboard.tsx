"use client";

import { motion } from "framer-motion";
import {
    Clock,
    CalendarCheck,
    FileText,
    User,
    LogOut,
    Briefcase,
    AlertCircle,
    Bell,
    ChevronRight,
    MapPin,
    Calendar,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useAuth } from "@/app/hooks/useAuth";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

interface MockAnnouncement {
    id: number;
    title: string;
    date: string;
    preview: string;
    content: string;
    category: string;
    color: string;
}

export default function EmployeeDashboard() {
    const { getUser } = useAuth();
    const user = getUser();
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<MockAnnouncement | null>(null);

    const quickActions = [
        { label: "Check-In", icon: Clock, color: "bg-blue-500", href: "/dashboard/attendance" },
        { label: "Ajukan Cuti", icon: CalendarCheck, color: "bg-emerald-500", href: "/dashboard/leaves" },
        { label: "Slip Gaji", icon: FileText, color: "bg-amber-500", href: "/dashboard/payroll" },
        { label: "Profil", icon: User, color: "bg-purple-500", href: "/dashboard/profile" },
    ];

    const stats = [
        { label: "Sisa Cuti", value: "12", unit: "Hari", color: "text-emerald-600" },
        { label: "Hadir", value: "18", unit: "Hari", color: "text-blue-600" },
        { label: "Ijin/Sakit", value: "1", unit: "Hari", color: "text-amber-600" },
    ];

    return (
        <div className="flex flex-col gap-4 pb-20 md:pb-8 px-1 animate-in fade-in duration-500 w-full">

            {/* --- MOBILE HEADER / PROFILE --- */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-emerald-600 p-5 text-white shadow-lg">
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden bg-white/10">
                            {user?.image ? (
                                <Image src={user.image} alt={user.name} fill className="object-cover" />
                            ) : (
                                <User className="w-full h-full p-2 opacity-50" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold leading-tight">{user?.name || "Karyawan"}</h2>
                            <p className="text-[10px] opacity-80 font-medium">Software Engineer • IT Dept</p>
                        </div>
                    </div>
                    <button className="relative p-2 bg-white/10 rounded-full">
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-sky-600"></span>
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 bg-white/10 backdrop-blur-md rounded-xl p-3">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center border-r last:border-0 border-white/10">
                            <p className="text-[8px] uppercase tracking-wider opacity-70 mb-0.5">{stat.label}</p>
                            <p className="text-sm font-bold">
                                {stat.value} <span className="text-[10px] font-normal opacity-80">{stat.unit}</span>
                            </p>
                        </div>
                    ))}
                </div>

                {/* Decorative background element */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* --- TODAY STATUS CARD --- */}
            <Card className="border-none shadow-sm bg-sky-50 dark:bg-sky-950/20">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center">
                            <MapPin className="text-sky-600" size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground font-medium">Status Kehadiran Hari Ini</p>
                            <p className="text-xs font-bold text-sky-900 dark:text-sky-100">Belum Melakukan Absen</p>
                        </div>
                    </div>
                    <Button size="sm" className="h-8 rounded-full text-[10px] bg-sky-600 hover:bg-sky-700">
                        Absen Sekarang
                    </Button>
                </CardContent>
            </Card>

            {/* --- QUICK ACTIONS GRID --- */}
            <div>
                <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-3 px-1">Layanan Mandiri</h3>
                <div className="grid grid-cols-4 gap-3">
                    {quickActions.map((action, i) => (
                        <Link key={i} href={action.href} passHref>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="flex flex-col items-center gap-2 w-full"
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md",
                                    action.color
                                )}>
                                    <action.icon size={22} />
                                </div>
                                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 text-center leading-tight">
                                    {action.label}
                                </span>
                            </motion.button>
                        </Link>
                    ))}
                </div>
            </div>

            {/* --- ANNOUNCEMENTS SECTION --- */}
            <div className="mt-2 text-[10px]">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-bold uppercase text-gray-400 tracking-wider">Pengumuman</h3>
                    <button className="text-sky-600 font-bold flex items-center">Lihat Semua <ChevronRight size={12} /></button>
                </div>

                <div className="space-y-3">
                    <Card
                        className="border-none shadow-sm overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer active:scale-[0.99]"
                        onClick={() => setSelectedAnnouncement({
                            id: 1,
                            title: "Update Libur Cuti Bersama 2026",
                            date: "01 Feb 2026",
                            preview: "Rincian perubahan jadwal operasional kantor selama bulan Februari...",
                            content: `
                                <p>Yth. Seluruh Karyawan,</p>
                                <br/>
                                <p>Menindaklanjuti Surat Keputusan Bersama (SKB) 3 Menteri tentang Hari Libur Nasional dan Cuti Bersama Tahun 2026, manajemen ingin menginformasikan perubahan jadwal operasional kantor sebagai berikut:</p>
                                <br/>
                                <ul class="list-disc pl-4 space-y-1">
                                    <li><strong>Senin, 16 Feb 2026:</strong> Libur Nasional (Tahun Baru Imlek)</li>
                                    <li><strong>Selasa, 17 Feb 2026:</strong> Cuti Bersama</li>
                                </ul>
                                <br/>
                                <p>Bagi karyawan yang memiliki tugas mendesak atau shift khusus, mohon berkoordinasi dengan atasan masing-masing. Absensi pada hari tersebut akan disesuaikan secara otomatis oleh sistem.</p>
                                <br/>
                                <p>Terima kasih atas perhatiannya.</p>
                                <br/>
                                <p class="font-bold">HRD Management</p>
                            `,
                            category: "Info HR",
                            color: "amber"
                        })}
                    >
                        <CardContent className="p-3">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="text-amber-600" size={18} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-xs">Update Libur Cuti Bersama 2026</h4>
                                    <p className="text-muted-foreground leading-snug">Rincian perubahan jadwal operasional kantor selama bulan Februari...</p>
                                    <p className="text-[9px] text-sky-600 font-medium pt-1">01 Feb 2026</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- ANNOUNCEMENT DETAIL DIALOG --- */}
            <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
                <DialogContent className="max-w-md w-[95%] rounded-2xl p-0 overflow-hidden border-none dialog-content">
                    {selectedAnnouncement && (
                        <div className="flex flex-col max-h-[85vh]">
                            {/* Header Image/Banner Area */}
                            <div className={cn(
                                "h-24 w-full relative flex items-center justify-center overflow-hidden",
                                selectedAnnouncement.color === 'amber' ? "bg-amber-100 dark:bg-amber-900/40" : "bg-sky-100"
                            )}>
                                <div className="absolute inset-0 opacity-20 pattern-grid-lg"></div>
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3",
                                    "bg-white dark:bg-slate-800"
                                )}>
                                    <AlertCircle className={cn(
                                        "w-8 h-8",
                                        selectedAnnouncement.color === 'amber' ? "text-amber-500" : "text-sky-500"
                                    )} />
                                </div>
                                <DialogClose className="absolute top-3 right-3 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 p-1.5 rounded-full transition-colors text-slate-600 dark:text-slate-300">
                                    <X size={16} />
                                </DialogClose>
                            </div>

                            {/* Content Area */}
                            <div className="p-5 overflow-y-auto custom-scrollbar">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                        {selectedAnnouncement.category}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                        <Calendar size={10} />
                                        {selectedAnnouncement.date}
                                    </span>
                                </div>

                                <DialogHeader className="mb-4">
                                    <DialogTitle className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">
                                        {selectedAnnouncement.title}
                                    </DialogTitle>
                                </DialogHeader>

                                <div
                                    className="prose prose-sm dark:prose-invert prose-p:text-sm prose-p:leading-relaxed text-slate-600 dark:text-slate-300 text-sm"
                                    dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
                                />
                            </div>

                            {/* Footer Action */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                <Button
                                    className="w-full rounded-xl font-bold text-xs"
                                    onClick={() => setSelectedAnnouncement(null)}
                                >
                                    Tutup Infomasi
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* --- RECENT ACTIVITIES --- */}
            <div className="mt-2 mb-4">
                <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-3 px-1">Aktivitas Terakhir</h3>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                    {[
                        { icon: Clock, label: "Clock Out", desc: "Kantor Pusat - Tepat Waktu", time: "Kemarin, 17:05", color: "text-blue-500", bg: "bg-blue-50" },
                        { icon: Clock, label: "Clock In", desc: "Kantor Pusat - Tepat Waktu", time: "Kemarin, 08:55", color: "text-emerald-500", bg: "bg-emerald-50" },
                        { icon: Calendar, label: "Pengajuan Cuti", desc: "Cuti Tahunan (3 Hari)", time: "30 Jan 2026", color: "text-amber-500", bg: "bg-amber-50" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between border-b last:border-0 border-dashed border-gray-200 dark:border-gray-800 pb-3 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", item.bg, "dark:bg-gray-800")}>
                                    <item.icon className={item.color} size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold">{item.label}</p>
                                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold">{item.time}</p>
                                <span className="text-[8px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded uppercase font-bold text-gray-500">Berhasil</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

