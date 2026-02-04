
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
    kdFact: z.string().min(1, "Kode wajib diisi").max(20, "Maksimal 20 karakter"),
    nmFact: z.string().min(1, "Nama wajib diisi"),
    keterangan: z.string().optional(),
});

interface FactoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    factory?: any;
    onSuccess: () => void;
}

export function FactoryDialog({ open, onOpenChange, factory, onSuccess }: FactoryDialogProps) {
    const isEditing = !!factory;
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kdFact: "",
            nmFact: "",
            keterangan: "",
        },
    });

    useEffect(() => {
        if (factory) {
            form.reset({
                kdFact: factory.kdFact,
                nmFact: factory.nmFact || "",
                keterangan: factory.keterangan || "",
            });
        } else {
            form.reset({
                kdFact: "",
                nmFact: "",
                keterangan: "",
            });
        }
    }, [factory, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (isEditing) {
                await api.put(`/factories/${factory.kdFact}`, values);
                toast.success("Factory berhasil diperbarui");
            } else {
                await api.post("/factories", values);
                toast.success("Factory berhasil ditambahkan");
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
                    <DialogTitle>{isEditing ? "Edit Factory" : "Tambah Factory"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Ubah informasi factory yang sudah ada." : "Tambahkan master data factory baru ke sistem."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="kdFact"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kode Factory</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: F01" {...field} disabled={isEditing} maxLength={20} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nmFact"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Factory</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Production A" {...field} />
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
                                {isEditing ? "Simpan Perubahan" : "Tambah Factory"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
