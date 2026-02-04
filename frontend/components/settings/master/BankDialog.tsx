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
import { Bank } from "@/types/master";

const formSchema = z.object({
    bankCode: z.string().min(1, "Kode Bank wajib diisi").max(2, "Maksimal 2 karakter"),
    bankNama: z.string().min(1, "Nama Bank wajib diisi"),
});

interface BankDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bank?: Bank | null; // If editing
    onSuccess: () => void;
}

export function BankDialog({ open, onOpenChange, bank, onSuccess }: BankDialogProps) {
    const isEditing = !!bank;
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bankCode: "",
            bankNama: "",
        },
    });

    useEffect(() => {
        if (bank) {
            form.reset({
                bankCode: bank.bankCode,
                bankNama: bank.bankNama || "",
            });
        } else {
            form.reset({
                bankCode: "",
                bankNama: "",
            });
        }
    }, [bank, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (isEditing) {
                await api.put(`/banks/${bank.bankCode}`, values);
                toast.success("Bank berhasil diperbarui");
            } else {
                await api.post("/banks", values);
                toast.success("Bank berhasil ditambahkan");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Gagal menyimpan data");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Bank" : "Tambah Bank"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Ubah informasi bank yang sudah ada." : "Tambahkan master data bank baru ke sistem."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="bankCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kode Bank</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: 01" {...field} disabled={isEditing} maxLength={2} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bankNama"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Bank</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: BCA" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">
                                {isEditing ? "Simpan Perubahan" : "Tambah Bank"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
