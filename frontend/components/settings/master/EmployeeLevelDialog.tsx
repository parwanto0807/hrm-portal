
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";

const formSchema = z.object({
    kdPkt: z.string().min(1, "Kode wajib diisi").max(5, "Maksimal 5 karakter"),
    nmPkt: z.string().min(1, "Nama wajib diisi"),
    keterangan: z.string().optional(),
});

interface EmployeeLevelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    level?: any; // If editing
    onSuccess: () => void;
}

export function EmployeeLevelDialog({ open, onOpenChange, level, onSuccess }: EmployeeLevelDialogProps) {
    const isEditing = !!level;
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kdPkt: "",
            nmPkt: "",
            keterangan: "",
        },
    });

    useEffect(() => {
        if (level) {
            form.reset({
                kdPkt: level.kdPkt,
                nmPkt: level.nmPkt || "",
                keterangan: level.keterangan || "",
            });
        } else {
            form.reset({
                kdPkt: "",
                nmPkt: "",
                keterangan: "",
            });
        }
    }, [level, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (isEditing) {
                await api.put(`/levels/${level.kdPkt}`, values);
                toast.success("Golongan berhasil diperbarui");
            } else {
                await api.post("/levels", values);
                toast.success("Golongan berhasil ditambahkan");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menyimpan data");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Golongan" : "Tambah Golongan"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Ubah informasi golongan yang sudah ada." : "Tambahkan master data golongan baru ke sistem."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="kdPkt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kode Golongan</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: IIIA" {...field} disabled={isEditing} maxLength={5} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nmPkt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Golongan/Pangkat</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Penata Muda" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="keterangan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Keterangan</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Keterangan tambahan..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">
                                {isEditing ? "Simpan Perubahan" : "Tambah Golongan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
