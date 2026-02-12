"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Employee } from "@/types/employee";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Loader2, Save, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfileEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeData: Employee;
    onSuccess: () => void;
}

export function ProfileEditDialog({
    open,
    onOpenChange,
    employeeData,
    onSuccess,
}: ProfileEditDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        defaultValues: employeeData,
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            // Only send editable fields
            const editableData = {
                nama: data.nama,
                nik: data.nik,
                ktpNo: data.ktpNo,
                validKtp: data.validKtp,
                npwp: data.npwp,
                tmpLhr: data.tmpLhr,
                tglLhr: data.tglLhr,
                kdSex: data.kdSex,
                glDarah: data.glDarah,
                ibuKandung: data.ibuKandung,
                jmlAnak: data.jmlAnak,
                tglNikah: data.tglNikah,
                handphone: data.handphone,
                telpon: data.telpon,
                alamat1: data.alamat1,
                alamatDom1: data.alamatDom1,
                kota: data.kota,
                kdPos: data.kdPos,
                nmTeman: data.nmTeman,
                hubTeman: data.hubTeman,
                tlpTeman: data.tlpTeman,
                almTeman: data.almTeman,
                typeSim: data.typeSim,
                noSim: data.noSim,
                validSim: data.validSim,
                pasportNo: data.pasportNo,
                kitasNo: data.kitasNo,
                validKitas: data.validKitas,
            };

            await api.put(`/employees/${employeeData.id}`, editableData);
            toast.success("Profil berhasil diperbarui!");
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal memperbarui profil");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 transition-all duration-300">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-base sm:text-lg font-bold tracking-tight">Edit Profil Saya</DialogTitle>
                    <DialogDescription className="text-[10px] sm:text-xs">
                        Anda hanya dapat mengubah data pribadi. Data kepegawaian, BPJS, dan rekening bank hanya dapat diubah oleh HRD.
                    </DialogDescription>
                </DialogHeader>

                {/* Info Alert */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-3 mb-6">
                    <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] sm:text-xs text-blue-700 leading-relaxed">
                        <strong className="text-blue-800">Saran:</strong> Field yang dapat Anda edit memiliki latar belakang putih.
                        Field abu-abu (disabled) dikunci untuk alasan keamanan data perusahaan.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-slate-100/50 p-1 rounded-lg h-auto">
                            <TabsTrigger value="personal" className="text-[9px] sm:text-xs py-2 rounded-md transition-all">Pribadi</TabsTrigger>
                            <TabsTrigger value="contact" className="text-[9px] sm:text-xs py-2 rounded-md transition-all">Kontak</TabsTrigger>
                            <TabsTrigger value="documents" className="text-[9px] sm:text-xs py-2 rounded-md transition-all">Dokumen</TabsTrigger>
                            <TabsTrigger value="emergency" className="text-[9px] sm:text-xs py-2 rounded-md transition-all">Darurat</TabsTrigger>
                        </TabsList>

                        {/* Tab: Data Pribadi */}
                        <TabsContent value="personal" className="space-y-4 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nama" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Lengkap *</Label>
                                    <Input
                                        id="nama"
                                        {...register("nama", { required: "Nama wajib diisi" })}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 focus:border-blue-400 transition-colors shadow-sm"
                                    />
                                    {errors.nama && <p className="text-[10px] text-red-500">{errors.nama.message as string}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="nik" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">NIK (KTP)</Label>
                                    <Input
                                        id="nik"
                                        {...register("nik")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        maxLength={16}
                                        placeholder="16 digit"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ktpNo" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">No. KTP</Label>
                                        <Input
                                            id="ktpNo"
                                            {...register("ktpNo")}
                                            className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="validKtp" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Berlaku KTP</Label>
                                        <Input
                                            id="validKtp"
                                            type="date"
                                            {...register("validKtp")}
                                            className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="npwp" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">NPWP</Label>
                                    <Input
                                        id="npwp"
                                        {...register("npwp")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        placeholder="XX.XXX.XXX.X-XXX.XXX"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="tmpLhr" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Tempat Lahir</Label>
                                    <Input
                                        id="tmpLhr"
                                        {...register("tmpLhr")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="tglLhr" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Lahir</Label>
                                    <Input
                                        id="tglLhr"
                                        type="date"
                                        {...register("tglLhr")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="kdSex" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Jenis Kelamin</Label>
                                    <Select
                                        defaultValue={employeeData.kdSex}
                                        onValueChange={(value) => setValue("kdSex", value as 'LAKILAKI' | 'PEREMPUAN')}
                                    >
                                        <SelectTrigger className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LAKILAKI">Laki-laki</SelectItem>
                                            <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="glDarah" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Gol. Darah</Label>
                                    <Input
                                        id="glDarah"
                                        {...register("glDarah")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        maxLength={2}
                                        placeholder="A, B, AB, O"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ibuKandung" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Ibu Kandung</Label>
                                    <Input
                                        id="ibuKandung"
                                        {...register("ibuKandung")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="tglNikah" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Nikah</Label>
                                        <Input
                                            id="tglNikah"
                                            type="date"
                                            {...register("tglNikah")}
                                            className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="jmlAnak" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah Anak</Label>
                                        <Input
                                            id="jmlAnak"
                                            type="number"
                                            {...register("jmlAnak")}
                                            className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab: Kontak & Alamat */}
                        <TabsContent value="contact" className="space-y-4 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="email" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        Email
                                        <span className="text-[8px] sm:text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full font-normal lowercase tracking-normal">Immutable</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        value={employeeData.email || '-'}
                                        disabled
                                        className={cn("text-xs sm:text-sm h-9 px-3 bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed")}
                                    />
                                    <p className="text-[9px] sm:text-[10px] text-slate-400 italic">Gunakan tiket bantuan HRD untuk perubahan email</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="handphone" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">No. Handphone *</Label>
                                    <Input
                                        id="handphone"
                                        {...register("handphone")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="telpon" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Telepon Rumah</Label>
                                    <Input
                                        id="telpon"
                                        {...register("telpon")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="alamat1" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Alamat KTP</Label>
                                    <Input
                                        id="alamat1"
                                        {...register("alamat1")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="alamatDom1" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Alamat Domisili</Label>
                                    <Input
                                        id="alamatDom1"
                                        {...register("alamatDom1")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        placeholder="Biarkan kosong jika sama dengan KTP"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 md:col-span-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="kota" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Kota</Label>
                                        <Input
                                            id="kota"
                                            {...register("kota")}
                                            className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="kdPos" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Kode Pos</Label>
                                        <Input
                                            id="kdPos"
                                            {...register("kdPos")}
                                            className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                            maxLength={5}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab: Dokumen */}
                        <TabsContent value="documents" className="space-y-4 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="typeSim" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Tipe SIM</Label>
                                        <Input
                                            id="typeSim"
                                            {...register("typeSim")}
                                            className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                            placeholder="A, B, C"
                                            maxLength={2}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="noSim" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">No. SIM</Label>
                                        <Input
                                            id="noSim"
                                            {...register("noSim")}
                                            className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="validSim" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Berlaku SIM</Label>
                                    <Input
                                        id="validSim"
                                        type="date"
                                        {...register("validSim")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="pasportNo" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">No. Paspor</Label>
                                    <Input
                                        id="pasportNo"
                                        {...register("pasportNo")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="kitasNo" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">No. KITAS</Label>
                                        <Input
                                            id="kitasNo"
                                            {...register("kitasNo")}
                                            className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="validKitas" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Berlaku KITAS</Label>
                                        <Input
                                            id="validKitas"
                                            type="date"
                                            {...register("validKitas")}
                                            className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab: Kontak Darurat */}
                        <TabsContent value="emergency" className="space-y-4 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nmTeman" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Kontak</Label>
                                    <Input
                                        id="nmTeman"
                                        {...register("nmTeman")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm font-semibold"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="hubTeman" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Hubungan</Label>
                                    <Input
                                        id="hubTeman"
                                        {...register("hubTeman")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                        placeholder="Keluarga, Teman, dll"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="tlpTeman" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">No. Telepon</Label>
                                    <Input
                                        id="tlpTeman"
                                        {...register("tlpTeman")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="almTeman" className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Alamat</Label>
                                    <Input
                                        id="almTeman"
                                        {...register("almTeman")}
                                        className="text-xs sm:text-sm h-9 px-3 rounded-lg border-slate-200 shadow-sm"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="text-xs hover:bg-slate-50"
                        >
                            <X className="h-4 w-4 mr-2 text-slate-400" />
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-xs text-white px-6 rounded-lg transition-all shadow-md shadow-blue-100"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="h-3.5 w-3.5 mr-2" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
