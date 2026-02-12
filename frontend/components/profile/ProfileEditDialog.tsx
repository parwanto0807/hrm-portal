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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Edit Profil Saya</DialogTitle>
                    <DialogDescription className="text-xs">
                        Anda hanya dapat mengubah data pribadi. Data kepegawaian, BPJS, dan rekening bank hanya dapat diubah oleh HRD.
                    </DialogDescription>
                </DialogHeader>

                {/* Info Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">
                        <strong>Informasi:</strong> Field yang dapat Anda edit ditandai dengan latar belakang putih.
                        Field dengan latar abu-abu tidak dapat diubah dan hanya bisa dikelola oleh HRD.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="personal" className="text-xs">Data Pribadi</TabsTrigger>
                            <TabsTrigger value="contact" className="text-xs">Kontak</TabsTrigger>
                            <TabsTrigger value="documents" className="text-xs">Dokumen</TabsTrigger>
                            <TabsTrigger value="emergency" className="text-xs">Kontak Darurat</TabsTrigger>
                        </TabsList>

                        {/* Tab: Data Pribadi */}
                        <TabsContent value="personal" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nama" className="text-xs font-semibold">Nama Lengkap *</Label>
                                    <Input
                                        id="nama"
                                        {...register("nama", { required: "Nama wajib diisi" })}
                                        className="text-sm"
                                    />
                                    {errors.nama && <p className="text-xs text-red-500">{errors.nama.message as string}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nik" className="text-xs font-semibold">NIK (KTP)</Label>
                                    <Input
                                        id="nik"
                                        {...register("nik")}
                                        className="text-sm"
                                        maxLength={16}
                                        placeholder="16 digit"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ktpNo" className="text-xs font-semibold">No. KTP</Label>
                                    <Input
                                        id="ktpNo"
                                        {...register("ktpNo")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="npwp" className="text-xs font-semibold">NPWP</Label>
                                    <Input
                                        id="npwp"
                                        {...register("npwp")}
                                        className="text-sm"
                                        placeholder="XX.XXX.XXX.X-XXX.XXX"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tmpLhr" className="text-xs font-semibold">Tempat Lahir</Label>
                                    <Input
                                        id="tmpLhr"
                                        {...register("tmpLhr")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tglLhr" className="text-xs font-semibold">Tanggal Lahir</Label>
                                    <Input
                                        id="tglLhr"
                                        type="date"
                                        {...register("tglLhr")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kdSex" className="text-xs font-semibold">Jenis Kelamin</Label>
                                    <Select
                                        defaultValue={employeeData.kdSex}
                                        onValueChange={(value) => setValue("kdSex", value as 'LAKILAKI' | 'PEREMPUAN')}
                                    >
                                        <SelectTrigger className="text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LAKILAKI">Laki-laki</SelectItem>
                                            <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="glDarah" className="text-xs font-semibold">Golongan Darah</Label>
                                    <Input
                                        id="glDarah"
                                        {...register("glDarah")}
                                        className="text-sm"
                                        maxLength={2}
                                        placeholder="A, B, AB, O"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ibuKandung" className="text-xs font-semibold">Nama Ibu Kandung</Label>
                                    <Input
                                        id="ibuKandung"
                                        {...register("ibuKandung")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tglNikah" className="text-xs font-semibold">Tanggal Menikah</Label>
                                    <Input
                                        id="tglNikah"
                                        type="date"
                                        {...register("tglNikah")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jmlAnak" className="text-xs font-semibold">Jumlah Anak</Label>
                                    <Input
                                        id="jmlAnak"
                                        type="number"
                                        {...register("jmlAnak")}
                                        className="text-sm"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab: Kontak & Alamat */}
                        <TabsContent value="contact" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-2">
                                        Email
                                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">Tidak dapat diubah</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        value={employeeData.email || '-'}
                                        disabled
                                        className={cn("text-sm bg-slate-100 cursor-not-allowed")}
                                    />
                                    <p className="text-xs text-slate-500">Email hanya dapat diubah oleh admin sistem</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="handphone" className="text-xs font-semibold">No. Handphone *</Label>
                                    <Input
                                        id="handphone"
                                        {...register("handphone")}
                                        className="text-sm"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telpon" className="text-xs font-semibold">Telepon Rumah</Label>
                                    <Input
                                        id="telpon"
                                        {...register("telpon")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="alamat1" className="text-xs font-semibold">Alamat KTP</Label>
                                    <Input
                                        id="alamat1"
                                        {...register("alamat1")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="alamatDom1" className="text-xs font-semibold">Alamat Domisili</Label>
                                    <Input
                                        id="alamatDom1"
                                        {...register("alamatDom1")}
                                        className="text-sm"
                                        placeholder="Jika sama dengan alamat KTP, kosongkan"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kota" className="text-xs font-semibold">Kota</Label>
                                    <Input
                                        id="kota"
                                        {...register("kota")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kdPos" className="text-xs font-semibold">Kode Pos</Label>
                                    <Input
                                        id="kdPos"
                                        {...register("kdPos")}
                                        className="text-sm"
                                        maxLength={5}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab: Dokumen */}
                        <TabsContent value="documents" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="typeSim" className="text-xs font-semibold">Tipe SIM</Label>
                                    <Input
                                        id="typeSim"
                                        {...register("typeSim")}
                                        className="text-sm"
                                        placeholder="A, B, C"
                                        maxLength={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="noSim" className="text-xs font-semibold">No. SIM</Label>
                                    <Input
                                        id="noSim"
                                        {...register("noSim")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="validSim" className="text-xs font-semibold">Berlaku Hingga SIM</Label>
                                    <Input
                                        id="validSim"
                                        type="date"
                                        {...register("validSim")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pasportNo" className="text-xs font-semibold">No. Paspor</Label>
                                    <Input
                                        id="pasportNo"
                                        {...register("pasportNo")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kitasNo" className="text-xs font-semibold">No. KITAS</Label>
                                    <Input
                                        id="kitasNo"
                                        {...register("kitasNo")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="validKitas" className="text-xs font-semibold">Berlaku Hingga KITAS</Label>
                                    <Input
                                        id="validKitas"
                                        type="date"
                                        {...register("validKitas")}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab: Kontak Darurat */}
                        <TabsContent value="emergency" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nmTeman" className="text-xs font-semibold">Nama Kontak Darurat</Label>
                                    <Input
                                        id="nmTeman"
                                        {...register("nmTeman")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hubTeman" className="text-xs font-semibold">Hubungan</Label>
                                    <Input
                                        id="hubTeman"
                                        {...register("hubTeman")}
                                        className="text-sm"
                                        placeholder="Keluarga, Teman, dll"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tlpTeman" className="text-xs font-semibold">No. Telepon</Label>
                                    <Input
                                        id="tlpTeman"
                                        {...register("tlpTeman")}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="almTeman" className="text-xs font-semibold">Alamat</Label>
                                    <Input
                                        id="almTeman"
                                        {...register("almTeman")}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="text-sm"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
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
