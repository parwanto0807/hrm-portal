"use client";

import { motion } from "framer-motion";
import {
    Clock,
    CalendarCheck,
    FileText,
    User,
    AlertCircle,
    Bell,
    ChevronRight,
    MapPin,
    Calendar,
    X,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useAuth } from "@/app/hooks/useAuth";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { id } from "date-fns/locale";

interface MockAnnouncement {
    id: number;
    title: string;
    date: string;
    preview: string;
    content: string;
    category: string;
    color: string;
}

interface RecentActivity {
    id: string;
    type: string;
    time: string;
    location: string;
    distance: number;
}

interface TodayShift {
    name: string;
    in: string;
    out: string;
}

export default function EmployeeDashboard() {
    const { getUser } = useAuth();
    const user = getUser();
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<MockAnnouncement | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [dashboardStats, setDashboardStats] = useState({
        sisaCuti: 0,
        hadir: 0,
        ijinSakit: 0,
        employee: {
            position: '',
            department: ''
        },
        todayShift: null as TodayShift | null,
        recentActivities: [] as RecentActivity[],
        periodInfo: ''
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats/employee');
                if (response.data.success) {
                    setDashboardStats(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    const formatActivityTime = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return `Hari ini, ${format(date, "HH:mm")}`;
        if (isYesterday(date)) return `Kemarin, ${format(date, "HH:mm")}`;
        return format(date, "dd MMM, HH:mm", { locale: id });
    };

    const quickActions = [
        { label: "Absensi", icon: Clock, color: "bg-blue-500", href: "/dashboard/check-in" },
        { label: "Ajukan Cuti", icon: CalendarCheck, color: "bg-emerald-500", href: "/dashboard/leaves" },
        { label: "Slip Gaji", icon: FileText, color: "bg-amber-500", href: "/dashboard/payroll" },
        { label: "Profil", icon: User, color: "bg-purple-500", href: "/dashboard/profile" },
    ];

    const stats = [
        { label: "Sisa Cuti", value: dashboardStats.sisaCuti, unit: "Hari", color: "text-emerald-600" },
        { label: "Hadir", value: dashboardStats.hadir, unit: "Hari", color: "text-blue-600" },
        { label: "Ijin/Sakit", value: dashboardStats.ijinSakit, unit: "Hari", color: "text-amber-600" },
    ];

    // Attendance Logic
    const todayLogIn = dashboardStats.recentActivities.find(log => log.type === 'Clock In' && isToday(new Date(log.time)));
    const todayLogOut = dashboardStats.recentActivities.find(log => log.type === 'Clock Out' && isToday(new Date(log.time)));

    let attendanceStatus = {
        label: "Belum Absen",
        message: "Jangan lupa untuk melakukan absen masuk hari ini!",
        color: "bg-indigo-50 text-indigo-900 border-indigo-100",
        badge: "bg-slate-200 text-slate-600",
        badgeText: "Reminder",
        actionRequired: true
    };

    if (todayLogIn) {
        // Calculate Lateness if shift info exists
        let isLate = false;
        if (dashboardStats.todayShift) {
            const [shiftH, shiftM] = dashboardStats.todayShift.in.split(':').map(Number);
            const checkInDate = new Date(todayLogIn.time);
            const shiftInDate = new Date(checkInDate);
            shiftInDate.setHours(shiftH, shiftM, 0, 0);

            if (checkInDate > shiftInDate) isLate = true;
        }

        attendanceStatus = {
            label: `Sudah Absen Masuk (${format(new Date(todayLogIn.time), "HH:mm")})`,
            message: isLate ? "Himbauan HRD: Mohon untuk lebih disiplin waktu ke depannya." : "Terima kasih telah datang tepat waktu. Semangat kerja!",
            color: isLate ? "bg-amber-50 text-amber-900 border-amber-100" : "bg-emerald-50 text-emerald-900 border-emerald-100",
            badge: isLate ? "bg-rose-500 text-white" : "bg-emerald-500 text-white",
            badgeText: isLate ? "Terlambat" : "Tepat Waktu",
            actionRequired: !todayLogOut
        };

        if (todayLogOut) {
            attendanceStatus.label = `Sudah Absen Keluar (${format(new Date(todayLogOut.time), "HH:mm")})`;
            attendanceStatus.message = "Tugas hari ini selesai. Selamat beristirahat!";
            attendanceStatus.actionRequired = false;
        }
    } else if (dashboardStats.todayShift) {
        // Check if current time is past shift start
        const [shiftH, shiftM] = dashboardStats.todayShift.in.split(':').map(Number);
        const shiftInDate = new Date();
        shiftInDate.setHours(shiftH, shiftM, 0, 0);

        if (currentTime > shiftInDate) {
            attendanceStatus.message = "Peringatan: Jam masuk sudah lewat. Segera lakukan presensi!";
            attendanceStatus.badge = "bg-rose-500 text-white";
            attendanceStatus.badgeText = "Terlambat";
            attendanceStatus.color = "bg-rose-50 text-rose-900 border-rose-100";
        }
    }

    return (
        <div className="flex flex-col gap-4 pb-20 md:pb-8 px-1 animate-in fade-in duration-500 w-full text-slate-900">

            {/* --- MOBILE HEADER / PROFILE --- */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-lg">
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden bg-white/10">
                            {user?.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name || "User profile"}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            ) : (
                                <User className="w-full h-full p-2 opacity-50" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold leading-tight">{user?.name || "Karyawan"}</h2>
                            <p className="text-[10px] opacity-80 font-medium">
                                {loadingStats ? "Loading..." : `${dashboardStats.employee.position} • ${dashboardStats.employee.department}`}
                            </p>
                        </div>
                    </div>
                    <button className="relative p-2 bg-white/10 rounded-full">
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-sky-600"></span>
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 bg-white/10 backdrop-blur-md rounded-xl p-3 min-h-[50px] items-center">
                    {loadingStats ? (
                        <div className="col-span-3 flex justify-center py-1">
                            <Loader2 className="w-4 h-4 animate-spin opacity-50" />
                        </div>
                    ) : (
                        stats.map((stat, i) => (
                            <div key={i} className="text-center border-r last:border-0 border-white/10">
                                <p className="text-[8px] uppercase tracking-wider opacity-70 mb-0.5">{stat.label}</p>
                                <p className="text-sm font-bold">
                                    {stat.value} <span className="text-[10px] font-normal opacity-80">{stat.unit}</span>
                                </p>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-2 text-center">
                    <p className="text-[9px] opacity-60 italic font-medium">
                        Periode: {dashboardStats.periodInfo}
                    </p>
                </div>

                {/* Decorative background element */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* --- TODAY STATUS CARD --- */}
            <Card className={cn("border-2 shadow-sm", attendanceStatus.color)}>
                <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center">
                                <MapPin className="text-indigo-600" size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Status Kehadiran Hari Ini</p>
                                <p className="text-sm font-black tracking-tight">{attendanceStatus.label}</p>
                            </div>
                        </div>
                        <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider", attendanceStatus.badge)}>
                            {attendanceStatus.badgeText}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-1 bg-white/40 p-2 rounded-xl border border-white/50">
                        <p className="text-[10px] font-bold leading-snug italic opacity-80 pr-2">
                            "{attendanceStatus.message}"
                        </p>
                        {attendanceStatus.actionRequired && (
                            <Link href="/dashboard/check-in" className="shrink-0">
                                <Button size="sm" className="h-7 rounded-lg text-[9px] font-black uppercase bg-indigo-600 hover:bg-indigo-700 px-3">
                                    Absen
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* --- QUICK ACTIONS GRID --- */}
            <div className="px-1">
                <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-3">Layanan Mandiri</h3>
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
                <div className="flex items-center mb-3 px-1">
                    <h3 className="font-bold uppercase text-gray-400 tracking-wider">Pengumuman</h3>
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
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-bold text-xs">Update Libur Cuti Bersama 2026</h4>
                                    <p className="text-muted-foreground leading-snug">Rincian perubahan jadwal operasional kantor selama bulan Februari...</p>
                                    <div className="flex items-center justify-between pt-1">
                                        <p className="text-[9px] text-sky-600 font-medium">01 Feb 2026</p>
                                        <Button
                                            size="sm"
                                            className="h-6 px-2 text-[10px] font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAnnouncement({
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
                                                });
                                            }}
                                        >
                                            <Eye size={12} className="mr-1" />
                                            Lihat Detail
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- RECENT ACTIVITIES --- */}
            <div className="mt-2 mb-4">
                <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-3 px-1">Aktivitas 3 Hari Terakhir</h3>
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                    {loadingStats ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 opacity-50" />
                        </div>
                    ) : dashboardStats.recentActivities.length > 0 ? (
                        dashboardStats.recentActivities.map((log) => (
                            <div key={log.id} className="flex items-center justify-between border-b last:border-0 border-dashed border-gray-200 dark:border-gray-800 pb-3 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-9 h-9 rounded-2xl flex items-center justify-center",
                                        log.type === 'Clock In' ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-600",
                                        "dark:bg-gray-800"
                                    )}>
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{log.type}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium">{log.distance}m dari lokasi</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-600 dark:text-slate-400">{formatActivityTime(log.time)}</p>
                                    <span className="text-[8px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase font-black text-slate-500">Berhasil</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-[10px] text-slate-400 italic">Belum ada aktivitas terekam.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- ANNOUNCEMENT DETAIL DIALOG --- */}
            <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
                <DialogContent className="max-w-md w-[95%] rounded-2xl p-0 overflow-hidden border-none dialog-content">
                    {selectedAnnouncement && (
                        <div className="flex flex-col max-h-[85vh]">
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

        </div>
    );
}

