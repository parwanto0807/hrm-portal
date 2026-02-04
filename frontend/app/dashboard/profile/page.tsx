"use client";

import React from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    User, Briefcase, Mail, MapPin, Hash, Phone, FileText,
    CreditCard, Building, Cake, Users, Star, Heart, ShieldCheck,
    Smartphone, Clock, Building2, GitFork, Landmark, CalendarCheck,
    BadgeCheck, Home
} from "lucide-react";
import HeaderCard from "@/components/ui/header-card";
import { Skeleton } from "@/components/ui/skeleton";

// Validator Helper
const validateData = (label: string, value: string | null | undefined) => {
    if (!value) return null; // Empty is handled by the "Kosong" dot

    switch (label) {
        case 'NIK (KTP)':
            return value.length < 16 ? 'NIK harus 16 digit' : null;
        case 'NPWP':
            return value.length < 15 ? 'NPWP minimal 15 digit' : null;
        case 'Email':
            return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Format email tidak valid' : null;
        case 'No. Handphone':
        case 'Telepon Rumah':
            return value.length < 10 ? 'Nomor telepon terlalu pendek' : null;
        case 'Nomor Rekening':
            return value.length < 10 ? 'Cek ulang nomor rekening' : null;
        default:
            return null;
    }
};

// Helper for Sections with Dynamic Colors
function InfoItem({ label, value, icon: Icon, color = "blue" }: { label: string, value: string | null | undefined, icon?: React.ElementType, color?: string }) {
    const warning = validateData(label, value);

    const colorStyles: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
        red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        pink: "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
        cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400",
        slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    };

    return (
        <div className="flex items-center gap-3 text-sm p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group relative">
            {Icon && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorStyles[color] || colorStyles.blue}`}>
                    <Icon className="h-4 w-4" />
                </div>
            )}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">{label}</p>
                    {warning && (
                        <Badge variant="destructive" className="h-4 px-1 text-[9px] uppercase tracking-wider">
                            Invalid
                        </Badge>
                    )}
                </div>
                <p className={`font-medium ${warning ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {value || '-'}
                </p>
                {warning && (
                    <p className="text-[10px] text-red-500 mt-0.5">{warning}</p>
                )}
            </div>

            {value ? (
                warning ? (
                    <div className="w-2 h-2 rounded-full bg-red-500" title={warning}></div>
                ) : (
                    <div className="w-2 h-2 rounded-full bg-green-500" title="Valid"></div>
                )
            ) : (
                <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" title="Kosong"></div>
            )}
        </div>
    );
}

const calculateCompleteness = (data: Employee | null | undefined) => {
    if (!data) return 0;

    const fields = [
        // Identity
        data.nik, data.npwp, data.tmpLhr, data.tglLhr, data.kdSex, data.agama,
        data.noBpjsTk, data.noBpjsKes,
        // Contact
        data.email, data.handphone, data.alamat1, data.kota,
        // Employment
        data.emplId, data.kdCmpy, data.tglMsk, data.kdJab, data.kdDept, data.kdSeksie, data.pkt,
        // Bank
        data.bankCode, data.bankRekNo, data.bankRekName
    ];

    const filled = fields.filter(f => f !== null && f !== undefined && f !== '').length;
    return Math.round((filled / fields.length) * 100);
};

export default function ProfilePage() {
    const { getUser } = useAuth();
    const [mounted, setMounted] = React.useState(false);
    const user = getUser();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const { data: employeeData, isLoading } = useQuery({
        queryKey: ['employeeProfile', user?.email],
        queryFn: async () => {
            try {
                const res = await api.get('/users/me');
                console.log('✅ Profile API Success:', res.data);
                return res.data.employee as Employee;
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } }; message: string };
                console.error('❌ Profile API Error:', err.response?.data || err.message);
                throw error;
            }
        },
        enabled: mounted && !!user?.email,
        retry: 1
    });

    const completeness = React.useMemo(() => calculateCompleteness(employeeData), [employeeData]);

    if (!mounted || isLoading) {
        return (
            <div className="p-4 space-y-6">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 md:p-6 space-y-6 pb-24 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HeaderCard
                title="Profil Pengguna"
                description={`Kelengkapan Data: ${completeness}%`}
                icon={<User className="h-6 w-6 text-white" />}
                gradientFrom="from-blue-600"
                gradientTo="to-indigo-600"
                patternText="PT. Grafindo Mitrasemesta"
            />

            {!employeeData ? (
                // EMPTY STATE
                <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                            <Hash className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Kepegawaian Belum Tertaut</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                            Akun Anda belum terhubung dengan data karyawan. Silakan hubungi admin HR untuk sinkronisasi data menggunakan <b>{user?.email}</b>.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: IDENTITY & CONTACT */}
                    <div className="space-y-6 xl:col-span-1">
                        {/* PHOTO CARD */}
                        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900 overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                            <CardContent className="relative pt-0 text-center">
                                <div className="inline-block relative -mt-16 mb-4">
                                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-lg">
                                        {user?.image ? (
                                            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-16 w-16 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0">
                                        <Badge className={`
                                            ${completeness === 100 ? 'bg-green-500' : completeness >= 80 ? 'bg-blue-500' : 'bg-orange-500'} 
                                            hover:bg-blue-600 border-2 border-white dark:border-slate-800 shadow-sm
                                        `}>
                                            {completeness}%
                                        </Badge>
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white px-4">
                                    {employeeData.nama}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    {employeeData.jabatan?.nmJab || 'Karyawan'} • {employeeData.dept?.nmDept || '-'}
                                </p>

                                {/* Progress Bar in Card */}
                                <div className="px-6 pb-2">
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-1 overflow-hidden">
                                        <div
                                            className={`h-2.5 rounded-full transition-all duration-1000 ${completeness === 100 ? 'bg-green-500' : completeness >= 70 ? 'bg-blue-500' : 'bg-orange-500'}`}
                                            style={{ width: `${completeness}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-slate-400">Kelengkapan Data Profil</p>
                                </div>

                            </CardContent>
                        </Card>

                        {/* CONTACT INFO */}
                        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-md font-bold">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    Kontak & Alamat
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <InfoItem icon={Mail} color="blue" label="Email" value={employeeData.email} />
                                <InfoItem icon={Smartphone} color="cyan" label="No. Handphone" value={employeeData.handphone} />
                                <InfoItem icon={Phone} color="indigo" label="Telepon Rumah" value={employeeData.telpon} />
                                <InfoItem icon={Home} color="orange" label="Alamat Domisili" value={employeeData.alamat1} />
                                <InfoItem icon={MapPin} color="red" label="Kota / Kode Pos" value={`${employeeData.kota || '-'} ${employeeData.kdPos ? `(${employeeData.kdPos})` : ''}`} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: DETAILS */}
                    <div className="space-y-6 xl:col-span-2">
                        {/* EMPLOYMENT DETAILS */}
                        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-md font-bold">
                                    <Briefcase className="h-4 w-4 text-blue-600" />
                                    Data Kepegawaian
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                                <InfoItem icon={Hash} color="slate" label="Employee ID" value={employeeData.emplId} />
                                <InfoItem icon={Clock} color="indigo" label="Nomor Absen" value={employeeData.idAbsen} />
                                <InfoItem icon={Building2} color="blue" label="Perusahaan" value={employeeData.company?.company || employeeData.kdCmpy} />
                                <InfoItem icon={CalendarCheck} color="green" label="Tanggal Bergabung" value={employeeData.tglMsk ? new Date(employeeData.tglMsk).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'} />
                                <InfoItem icon={GitFork} color="purple" label="Divisi (Bagian)" value={employeeData.bag?.nmBag} />
                                <InfoItem icon={Building} color="violet" label="Departemen" value={employeeData.dept?.nmDept} />
                                <InfoItem icon={Users} color="pink" label="Section (Seksi)" value={employeeData.sie?.nmSeksie} />
                                <InfoItem icon={BadgeCheck} color="amber" label="Golongan / Pangkat" value={employeeData.pkt?.nmPkt} />
                            </CardContent>
                        </Card>

                        {/* PERSONAL & IDENTITY */}
                        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-md font-bold">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    Data Pribadi & Identitas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                                <InfoItem icon={BadgeCheck} color="emerald" label="NIK (KTP)" value={employeeData.nik || employeeData.ktpNo} />
                                <InfoItem icon={CreditCard} color="orange" label="NPWP" value={employeeData.npwp} />
                                <InfoItem icon={Cake} color="pink" label="Tempat, Tanggal Lahir" value={`${employeeData.tmpLhr || '-'}, ${employeeData.tglLhr ? new Date(employeeData.tglLhr).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}`} />
                                <InfoItem icon={Users} color="cyan" label="Jenis Kelamin" value={employeeData.kdSex === 'LAKILAKI' ? 'Laki-laki' : 'Perempuan'} />
                                <InfoItem icon={Star} color="purple" label="Agama" value={employeeData.agama?.nmAgm} />
                                <InfoItem icon={Heart} color="red" label="Status Pernikahan" value={employeeData.jmlAnak !== undefined ? `Anak: ${employeeData.jmlAnak}` : '-'} />
                                <InfoItem icon={ShieldCheck} color="green" label="BPJS Ketenagakerjaan" value={employeeData.noBpjsTk} />
                                <InfoItem icon={ShieldCheck} color="green" label="BPJS Kesehatan" value={employeeData.noBpjsKes} />
                            </CardContent>
                        </Card>

                        {/* BANK INFO */}
                        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-md font-bold">
                                    <Building className="h-4 w-4 text-blue-600" />
                                    Data Rekening Bank
                                </CardTitle>
                                <CardDescription>Informasi rekening untuk pembayaran gaji (Payroll)</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                                <InfoItem icon={Landmark} color="green" label="Nama Bank" value={employeeData.bank?.bankNama || employeeData.bankCode} />
                                <InfoItem icon={CreditCard} color="slate" label="Nomor Rekening" value={employeeData.bankRekNo} />
                                <InfoItem icon={User} color="blue" label="Atas Nama" value={employeeData.bankRekName} />
                                <InfoItem icon={GitFork} color="orange" label="Cabang" value={employeeData.bankUnit} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
