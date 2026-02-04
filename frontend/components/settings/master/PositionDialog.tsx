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
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
    kdJab: z.string().min(1, "Kode Jabatan wajib diisi").max(20, "Maksimal 20 karakter"),
    nmJab: z.string().min(1, "Nama Jabatan wajib diisi"),
    nTjabatan: z.coerce.number(),
    nTransport: z.coerce.number(),
    nShiftAll: z.coerce.number(),
    nPremiHdr: z.coerce.number(),
    persenRmh: z.coerce.number(),
    persenPph: z.coerce.number(),
    keterangan: z.string().optional().or(z.literal("")),
});

interface PositionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    position?: any;
    onSuccess: () => void;
}

export function PositionDialog({ open, onOpenChange, position, onSuccess }: PositionDialogProps) {
    const isEditing = !!position;
    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kdJab: "",
            nmJab: "",
            nTjabatan: 0,
            nTransport: 0,
            nShiftAll: 0,
            nPremiHdr: 0,
            persenRmh: 0,
            persenPph: 0,
            keterangan: "",
        },
    });

    useEffect(() => {
        if (position) {
            form.reset({
                kdJab: position.kdJab,
                nmJab: position.nmJab || "",
                nTjabatan: Number(position.nTjabatan) || 0,
                nTransport: Number(position.nTransport) || 0,
                nShiftAll: Number(position.nShiftAll) || 0,
                nPremiHdr: Number(position.nPremiHdr) || 0,
                persenRmh: Number(position.persenRmh) || 0,
                persenPph: Number(position.persenPph) || 0,
                keterangan: position.keterangan || "",
            });
        } else {
            form.reset({
                kdJab: "",
                nmJab: "",
                nTjabatan: 0,
                nTransport: 0,
                nShiftAll: 0,
                nPremiHdr: 0,
                persenRmh: 0,
                persenPph: 0,
                keterangan: "",
            });
        }
    }, [position, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (isEditing) {
                await api.put(`/positions/${position.kdJab}`, values);
                toast.success("Jabatan berhasil diperbarui");
            } else {
                await api.post("/positions", values);
                toast.success("Jabatan berhasil ditambahkan");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menyimpan data");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Jabatan" : "Tambah Jabatan"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Ubah informasi jabatan yang sudah ada." : "Tambahkan master data jabatan baru ke sistem."}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh] px-1">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-4 pr-3">
                            <FormField
                                control={form.control as any}
                                name="kdJab"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kode Jabatan</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: DIR" {...field} disabled={isEditing} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="nmJab"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Jabatan</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: Direktur" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control as any}
                                    name="nTjabatan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tunjangan Jabatan</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="nTransport"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tunjangan Transport</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control as any}
                                    name="nShiftAll"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tunjangan Shift</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="nPremiHdr"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Premi Kehadiran</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control as any}
                                    name="persenRmh"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>% Tunj. Perumahan</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="persenPph"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>% PPh</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control as any}
                                name="keterangan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Keterangan</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" className="w-full">
                                    {isEditing ? "Simpan Perubahan" : "Tambah Jabatan"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
