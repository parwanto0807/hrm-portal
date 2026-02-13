"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Employee } from "@/types/employee";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User, Mail, Phone, Smartphone, MapPin, Hash, Clock, Building, Users,
    Briefcase, FileText, CreditCard, Cake, Star, Heart, ShieldCheck,
    Landmark, Building2, GitFork, BadgeCheck, Home, Edit, Calendar,
    Wallet, UserCircle, AlertCircle, IdCard, Banknote
} from "lucide-react";
import HeaderCard from "@/components/ui/header-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { ProfilePasswordDialog } from "@/components/profile/ProfilePasswordDialog";
import { AlertTriangle, Lock } from "lucide-react";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AxonLoader } from "@/components/ui/AxonLoader";

// Info Item Component with smaller fonts
function InfoItem({
    label,
    value,
    icon: Icon,
    color = "blue",
    className = ""
}: {
    label: string;
    value: string | null | undefined;
    icon?: React.ElementType;
    color?: string;
    className?: string;
}) {
    const colorStyles: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
        green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20",
        red: "bg-red-50 text-red-600 dark:bg-red-900/20",
        pink: "bg-pink-50 text-pink-600 dark:bg-pink-900/20",
        cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20",
        slate: "bg-slate-100 text-slate-600 dark:bg-slate-800",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20",
    };

    return (
        <div className={cn("flex items-start gap-2 py-2", className)}>
            {Icon && (
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorStyles[color] || colorStyles.blue}`}>
                    <Icon className="h-3.5 w-3.5" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-tight mb-0.5">{label}</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 break-words">
                    {value || '-'}
                </p>
            </div>
        </div>
    );
}

// Section Header Component
function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
    return (
        <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Icon className="h-4 w-4 text-blue-600" />
                {title}
            </CardTitle>
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </CardHeader>
    );
}

export default function ProfilePage() {
    const { getUser } = useAuth();
    const [mounted, setMounted] = useState(false);
    const user = getUser();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [showVerificationDialog, setShowVerificationDialog] = useState(true);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const { data: employeeData, isLoading, refetch } = useQuery({
        queryKey: ['employeeProfile', user?.email],
        queryFn: async () => {
            const res = await api.get('/users/me');
            return res.data.employee as Employee;
        },
        enabled: mounted && !!user?.email,
        retry: 1
    });

    if (!mounted || isLoading) {
        return <AxonLoader />;
    }

    const formatDate = (date: string | Date | null | undefined) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatCurrency = (amount: number | string | null | undefined) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
    };

    return (
        <div className="w-full p-2 md:p-6 space-y-4 pb-24 md:pb-6">
            {/* Header */}
            <HeaderCard
                title="Profil Karyawan"
                description={employeeData?.nama || "Data Kepegawaian"}
                icon={<User className="h-6 w-6 text-white" />}
                gradientFrom="from-blue-600"
                gradientTo="to-indigo-600"
                patternText="PT. Grafindo Mitrasemesta"
            />

            {/* Security Warning Banner */}
            <div className="bg-amber-50/50 dark:bg-amber-950/10 backdrop-blur-sm border border-amber-200/50 dark:border-amber-900/30 rounded-lg p-2 flex items-center gap-2.5 shadow-xs">
                <div className="bg-amber-100 dark:bg-amber-900/40 p-1.5 rounded-md text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">PEMBERITAHUAN KEAMANAN</span>
                        <div className="h-1 w-1 rounded-full bg-amber-300 dark:bg-amber-700"></div>
                        <span className="text-[8px] font-medium text-amber-600/80 dark:text-amber-400/80 uppercase">Confidential Personnel Data</span>
                    </div>
                    <ul className="text-[8px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium max-w-2xl font-inter list-none space-y-0.5">
                        <li className="flex items-start gap-1.5">
                            <span className="shrink-0 mt-1 h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                            <span>Data profil mengandung informasi sensitif (NIK, NPWP, alamat, rekening bank, gaji) yang dilindungi kebijakan privasi perusahaan.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="shrink-0 mt-1 h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                            <span>Verifikasi tanggal lahir diperlukan untuk akses. Jangan bagikan data pribadi Anda kepada pihak yang tidak berwenang.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {!employeeData ? (
                <Card className="border-none shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Tidak Ditemukan</h3>
                        <p className="text-xs text-slate-500 mt-2">
                            Akun Anda belum terhubung dengan data karyawan.
                        </p>
                    </CardContent>
                </Card>
            ) : !isVerified ? (
                <Card className="border-none shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mb-4">
                            <Lock className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Data Terlindungi</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                            Profil Anda mengandung informasi sensitif yang dilindungi.
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Silakan verifikasi tanggal lahir Anda untuk melanjutkan.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {/* Profile Card with Photo */}
                    <Card className="border-none shadow-lg overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <CardContent className="relative pt-0 pb-4">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12 md:-mt-16">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
                                    {user?.image ? (
                                        <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="h-12 w-12 md:h-16 md:w-16 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1 text-center md:text-left pb-2">
                                    <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                                        {employeeData.nama}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {employeeData.jabatan?.nmJab || 'Karyawan'} • {employeeData.dept?.nmDept || '-'}
                                    </p>
                                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                        <Badge variant="outline" className="text-[10px]">
                                            {employeeData.emplId}
                                        </Badge>
                                        <Badge className={cn(
                                            "text-[10px]",
                                            employeeData.kdSts === 'AKTIF' ? 'bg-green-500' : 'bg-slate-400'
                                        )}>
                                            {employeeData.kdSts || 'AKTIF'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={() => setEditDialogOpen(true)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profil
                        </Button>
                    </div>

                    {/* Data Pribadi & Identitas */}
                    <Card className="border-none shadow-lg">
                        <SectionHeader icon={UserCircle} title="Data Pribadi & Identitas" />
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <InfoItem icon={IdCard} color="blue" label="NIK (KTP)" value={employeeData.nik || employeeData.ktpNo} />
                            <InfoItem icon={Calendar} color="green" label="Berlaku Hingga KTP" value={formatDate(employeeData.validKtp)} />
                            <InfoItem icon={CreditCard} color="orange" label="NPWP" value={employeeData.npwp} />
                            <InfoItem icon={Cake} color="pink" label="Tempat Lahir" value={employeeData.tmpLhr} />
                            <InfoItem icon={Calendar} color="purple" label="Tanggal Lahir" value={formatDate(employeeData.tglLhr)} />
                            <InfoItem icon={Users} color="cyan" label="Jenis Kelamin" value={employeeData.kdSex === 'LAKILAKI' ? 'Laki-laki' : 'Perempuan'} />
                            <InfoItem icon={Star} color="purple" label="Agama" value={employeeData.agama?.nmAgm} />
                            <InfoItem icon={Heart} color="red" label="Status Pernikahan" value={employeeData.tglNikah ? `Menikah (${formatDate(employeeData.tglNikah)})` : 'Belum Menikah'} />
                            <InfoItem icon={Users} color="pink" label="Jumlah Anak" value={employeeData.jmlAnak?.toString()} />
                            <InfoItem icon={User} color="slate" label="Nama Ibu Kandung" value={employeeData.ibuKandung} />
                            <InfoItem icon={IdCard} color="amber" label="No. KK" value={employeeData.kkNo} />
                            <InfoItem icon={FileText} color="indigo" label="Golongan Darah" value={employeeData.glDarah} />
                        </CardContent>
                    </Card>

                    {/* Kontak & Alamat */}
                    <Card className="border-none shadow-lg">
                        <SectionHeader icon={Mail} title="Kontak & Alamat" />
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <InfoItem icon={Mail} color="blue" label="Email" value={employeeData.email} />
                            <InfoItem icon={Smartphone} color="cyan" label="No. Handphone" value={employeeData.handphone} />
                            <InfoItem icon={Phone} color="indigo" label="Telepon Rumah" value={employeeData.telpon} />
                            <InfoItem icon={Home} color="orange" label="Alamat KTP" value={employeeData.alamat1} className="md:col-span-2 lg:col-span-3" />
                            <InfoItem icon={MapPin} color="red" label="Alamat Domisili" value={employeeData.alamatDom1} className="md:col-span-2 lg:col-span-3" />
                            <InfoItem icon={MapPin} color="slate" label="Kota" value={employeeData.kota} />
                            <InfoItem icon={Hash} color="slate" label="Kode Pos" value={employeeData.kdPos} />
                        </CardContent>
                    </Card>

                    {/* Data Kepegawaian */}
                    <Card className="border-none shadow-lg">
                        <SectionHeader icon={Briefcase} title="Data Kepegawaian" />
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <InfoItem icon={Hash} color="slate" label="Employee ID" value={employeeData.emplId} />
                            <InfoItem icon={Clock} color="indigo" label="Nomor Absen" value={employeeData.idAbsen} />
                            <InfoItem icon={Building2} color="blue" label="Perusahaan" value={employeeData.company?.company || employeeData.kdCmpy} />
                            <InfoItem icon={Building} color="purple" label="Pabrik" value={employeeData.fact?.nmFact} />
                            <InfoItem icon={GitFork} color="purple" label="Divisi (Bagian)" value={employeeData.bag?.nmBag} />
                            <InfoItem icon={Building} color="violet" label="Departemen" value={employeeData.dept?.nmDept} />
                            <InfoItem icon={Users} color="pink" label="Section (Seksi)" value={employeeData.sie?.nmSeksie} />
                            <InfoItem icon={BadgeCheck} color="amber" label="Jabatan" value={employeeData.jabatan?.nmJab} />
                            <InfoItem icon={BadgeCheck} color="orange" label="Golongan / Pangkat" value={employeeData.pkt?.nmPkt} />
                            <InfoItem icon={Calendar} color="green" label="Tanggal Bergabung" value={formatDate(employeeData.tglMsk)} />
                            <InfoItem icon={Calendar} color="blue" label="Tanggal Pengangkatan" value={formatDate(employeeData.tglAngkat)} />
                            <InfoItem icon={Badge} color="cyan" label="Status Karyawan" value={employeeData.kdJns} />
                            <InfoItem icon={Clock} color="slate" label="Hari Kerja" value={employeeData.hariKerja?.toString()} />
                            <InfoItem icon={Clock} color="indigo" label="Group Shift" value={employeeData.groupShift?.groupName || employeeData.groupShift?.groupShift} />
                        </CardContent>
                    </Card>

                    {/* BPJS & Asuransi */}
                    <Card className="border-none shadow-lg">
                        <SectionHeader icon={ShieldCheck} title="BPJS & Asuransi" />
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <InfoItem icon={ShieldCheck} color="green" label="No. BPJS Ketenagakerjaan" value={employeeData.noBpjsTk} />
                            <InfoItem icon={Badge} color="green" label="Status BPJS TK" value={employeeData.kdBpjsTk ? 'Aktif' : 'Tidak Aktif'} />
                            <InfoItem icon={ShieldCheck} color="blue" label="No. BPJS Kesehatan" value={employeeData.noBpjsKes} />
                            <InfoItem icon={Badge} color="blue" label="Status BPJS Kesehatan" value={employeeData.kdBpjsKes ? 'Aktif' : 'Tidak Aktif'} />
                            <InfoItem icon={Calendar} color="purple" label="Tanggal Astek" value={formatDate(employeeData.tglAstek)} />
                        </CardContent>
                    </Card>

                    {/* Data Rekening Bank */}
                    <Card className="border-none shadow-lg">
                        <SectionHeader
                            icon={Landmark}
                            title="Data Rekening Bank"
                            description="Informasi rekening untuk pembayaran gaji (Payroll)"
                        />
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <InfoItem icon={Landmark} color="green" label="Nama Bank" value={employeeData.bank?.bankNama || employeeData.bankCode} />
                            <InfoItem icon={CreditCard} color="slate" label="Nomor Rekening" value={employeeData.bankRekNo} />
                            <InfoItem icon={User} color="blue" label="Atas Nama" value={employeeData.bankRekName} />
                            <InfoItem icon={GitFork} color="orange" label="Cabang / Unit" value={employeeData.bankUnit} />
                        </CardContent>
                    </Card>

                    {/* Komponen Gaji */}
                    <Card className="border-none shadow-lg">
                        <SectionHeader icon={Banknote} title="Komponen Gaji" description="Informasi gaji pokok dan tunjangan tetap" />
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <InfoItem icon={Wallet} color="green" label="Gaji Pokok" value={formatCurrency(employeeData.pokokBln)} />
                            <InfoItem icon={Banknote} color="blue" label="Tunjangan Transport" value={formatCurrency(employeeData.tTransport)} />
                            <InfoItem icon={Banknote} color="cyan" label="Tunjangan Makan" value={formatCurrency(employeeData.tMakan)} />
                            <InfoItem icon={Banknote} color="purple" label="Tunjangan Jabatan" value={formatCurrency(employeeData.tJabatan)} />
                            <InfoItem icon={Banknote} color="pink" label="Tunjangan Keluarga" value={formatCurrency(employeeData.tKeluarga)} />
                            <InfoItem icon={Banknote} color="orange" label="Tunjangan Komunikasi" value={formatCurrency(employeeData.tKomunikasi)} />
                            <InfoItem icon={Banknote} color="amber" label="Tunjangan Khusus" value={formatCurrency(employeeData.tKhusus)} />
                            <InfoItem icon={Banknote} color="indigo" label="Tunjangan Lembur Tetap" value={formatCurrency(employeeData.tLmbtetap)} />
                        </CardContent>
                    </Card>

                    {/* Kontak Darurat */}
                    <Card className="border-none shadow-lg">
                        <SectionHeader icon={Phone} title="Kontak Darurat" />
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <InfoItem icon={User} color="blue" label="Nama" value={employeeData.nmTeman} />
                            <InfoItem icon={Users} color="purple" label="Hubungan" value={employeeData.hubTeman} />
                            <InfoItem icon={Phone} color="cyan" label="No. Telepon" value={employeeData.tlpTeman} />
                            <InfoItem icon={MapPin} color="orange" label="Alamat" value={employeeData.almTeman} className="md:col-span-2 lg:col-span-3" />
                        </CardContent>
                    </Card>

                    {/* Dokumen & Identitas Lainnya */}
                    <Card className="border-none shadow-lg">
                        <SectionHeader icon={FileText} title="Dokumen & Identitas Lainnya" />
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <InfoItem icon={CreditCard} color="blue" label="Tipe SIM" value={employeeData.typeSim} />
                            <InfoItem icon={Hash} color="cyan" label="No. SIM" value={employeeData.noSim} />
                            <InfoItem icon={Calendar} color="green" label="Berlaku Hingga SIM" value={formatDate(employeeData.validSim)} />
                            <InfoItem icon={FileText} color="purple" label="No. Paspor" value={employeeData.pasportNo} />
                            <InfoItem icon={FileText} color="orange" label="No. KITAS" value={employeeData.kitasNo} />
                            <InfoItem icon={Calendar} color="red" label="Berlaku Hingga KITAS" value={formatDate(employeeData.validKitas)} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Edit Dialog */}
            {employeeData && (
                <ProfileEditDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    employeeData={employeeData}
                    onSuccess={() => {
                        refetch();
                        setEditDialogOpen(false);
                    }}
                />
            )}

            {/* Password Verification Dialog */}
            <ProfilePasswordDialog
                isOpen={showVerificationDialog && !isVerified}
                onClose={() => {
                    setShowVerificationDialog(false);
                    // Redirect back if user cancels
                    window.history.back();
                }}
                onSuccess={() => {
                    setIsVerified(true);
                    setShowVerificationDialog(false);
                }}
            />
        </div>
    );
}
