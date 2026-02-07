"use client";

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AttendanceEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record: any;
}

export const AttendanceEditDialog = ({ open, onOpenChange, record }: AttendanceEditDialogProps) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            stdMasuk: record?.stdMasuk || '',
            stdKeluar: record?.stdKeluar || '',
            realMasuk: record?.realMasuk || '',
            realKeluar: record?.realKeluar || '',
            kdAbsen: record?.kdAbsen || 'H',
            totLmb: record?.totLmb || 0,
            ketLmb: record?.ketLmb || '',
        }
    });

    React.useEffect(() => {
        if (record) {
            reset({
                stdMasuk: record.stdMasuk || '',
                stdKeluar: record.stdKeluar || '',
                realMasuk: record.realMasuk || '',
                realKeluar: record.realKeluar || '',
                kdAbsen: record.kdAbsen || 'H',
                totLmb: record.totLmb || 0,
                ketLmb: record.ketLmb || '',
            });
        }
    }, [record, reset]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const { data: response } = await api.put(`/absent/${record.id}`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
            toast.success('Data absensi berhasil diperbarui');
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal memperbarui data');
        }
    });

    const onSubmit = (data: any) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Ubah Absensi</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
                            <p className="text-sm font-semibold text-slate-900">{record?.karyawan?.nama || record?.nama}</p>
                            <p className="text-xs text-muted-foreground uppercase">
                                {record?.emplId} • {record?.tglAbsen && format(new Date(record.tglAbsen), 'dd-MMM-yyyy', { locale: id })}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stdMasuk">Jadwal Masuk</Label>
                            <Input id="stdMasuk" {...register('stdMasuk')} placeholder="08:00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stdKeluar">Jadwal Keluar</Label>
                            <Input id="stdKeluar" {...register('stdKeluar')} placeholder="17:00" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="realMasuk">Aktual Masuk</Label>
                            <Input id="realMasuk" {...register('realMasuk')} placeholder="08:05" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="realKeluar">Aktual Keluar</Label>
                            <Input id="realKeluar" {...register('realKeluar')} placeholder="17:05" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kdAbsen">Status</Label>
                            <Select
                                value={watch('kdAbsen')}
                                onValueChange={(val) => setValue('kdAbsen', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="H">Hadir</SelectItem>
                                    <SelectItem value="S">Sakit</SelectItem>
                                    <SelectItem value="I">Izin</SelectItem>
                                    <SelectItem value="A">Alpha</SelectItem>
                                    <SelectItem value="L">Libur</SelectItem>
                                    <SelectItem value="T">Dinas</SelectItem>
                                    <SelectItem value="O">Off Schedule</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totLmb">Lembur (Menit)</Label>
                            <Input id="totLmb" type="number" {...register('totLmb')} />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="ketLmb">Keterangan</Label>
                            <Input id="ketLmb" {...register('ketLmb')} placeholder="Alasan perubahan..." />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
