"use client";

import React, { useEffect, useState } from "react";
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
import { Division, Department, Section } from "@/types/master";


// --- DIVISIONS ---
const divisionSchema = z.object({
    kdBag: z.string().min(1, "Kode Bagian wajib diisi").max(20),
    nmBag: z.string().min(1, "Nama Bagian wajib diisi").max(30),
    keterangan: z.string().optional().or(z.literal("")),
});

export function DivisionDialog({ open, onOpenChange, data, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; data?: Division | null; onSuccess: () => void }) {
    const isEditing = !!data;
    const form = useForm<z.infer<typeof divisionSchema>>({
        resolver: zodResolver(divisionSchema),
        defaultValues: { kdBag: "", nmBag: "", keterangan: "" },
    });

    useEffect(() => {
        if (data) form.reset({ kdBag: data.kdBag, nmBag: data.nmBag || "", keterangan: data.keterangan || "" });
        else form.reset({ kdBag: "", nmBag: "", keterangan: "" });
    }, [data, form, open]);

    const onSubmit = async (values: z.infer<typeof divisionSchema>) => {
        try {
            if (isEditing) await api.put(`/org/divisions/${data!.kdBag}`, values);
            else await api.post(`/org/divisions`, values);
            toast.success("Bagian berhasil disimpan");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Gagal menyimpan data");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Bagian" : "Tambah Bagian"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="kdBag" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kode Bagian</FormLabel>
                                <FormControl><Input {...field} disabled={isEditing} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="nmBag" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Bagian</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="keterangan" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Keterangan</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="submit" className="w-full">{isEditing ? "Simpan Perubahan" : "Tambah Bagian"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

// --- DEPARTMENTS ---
const departmentSchema = z.object({
    kdDept: z.string().min(1, "Kode Dept wajib diisi").max(20),
    nmDept: z.string().min(1, "Nama Dept wajib diisi").max(30),
    kdBag: z.string().min(1, "Pilih Bagian"),
    keterangan: z.string().optional().or(z.literal("")),
});

export function DepartmentDialog({ open, onOpenChange, data, onSuccess, divisions }: { open: boolean; onOpenChange: (open: boolean) => void; data?: Department; onSuccess: () => void; divisions: Division[] }) {
    const isEditing = !!data;
    const form = useForm<z.infer<typeof departmentSchema>>({
        resolver: zodResolver(departmentSchema),
        defaultValues: { kdDept: "", nmDept: "", kdBag: "", keterangan: "" },
    });

    useEffect(() => {
        if (data) form.reset({ kdDept: data.kdDept, nmDept: data.nmDept || "", kdBag: data.kdBag || "", keterangan: data.keterangan || "" });
        else form.reset({ kdDept: "", nmDept: "", kdBag: "", keterangan: "" });
    }, [data, form, open]);

    const onSubmit = async (values: z.infer<typeof departmentSchema>) => {
        try {
            if (isEditing) await api.put(`/org/departments/${data!.kdDept}`, values);
            else await api.post(`/org/departments`, values);
            toast.success("Departemen berhasil disimpan");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Gagal menyimpan data");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Departemen" : "Tambah Departemen"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="kdDept" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kode Departemen</FormLabel>
                                <FormControl><Input {...field} disabled={isEditing} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="nmDept" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Departemen</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="kdBag" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bagian</FormLabel>
                                <FormControl>
                                    <select
                                        {...field}
                                        className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Pilih Bagian</option>
                                        {divisions.map((item: Division) => (
                                            <option key={item.kdBag} value={item.kdBag}>{item.nmBag}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="keterangan" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Keterangan</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="submit" className="w-full">{isEditing ? "Simpan Perubahan" : "Tambah Departemen"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

// --- SECTIONS ---
const sectionSchema = z.object({
    kdSeksie: z.string().min(1, "Kode Seksie wajib diisi").max(6),
    nmSeksie: z.string().min(1, "Nama Seksie wajib diisi").max(30),
    kdBag: z.string().min(1, "Pilih Bagian"),
    kdDept: z.string().min(1, "Pilih Departemen"),
    keterangan: z.string().optional().or(z.literal("")),
});

export function SectionDialog({ open, onOpenChange, data, onSuccess, divisions, departments }: { open: boolean; onOpenChange: (open: boolean) => void; data?: Section; onSuccess: () => void; divisions: Division[]; departments: Department[] }) {
    const isEditing = !!data;
    const form = useForm<z.infer<typeof sectionSchema>>({
        resolver: zodResolver(sectionSchema),
        defaultValues: { kdSeksie: "", nmSeksie: "", kdBag: "", kdDept: "", keterangan: "" },
    });

    useEffect(() => {
        if (data) form.reset({ kdSeksie: data.kdSeksie, nmSeksie: data.nmSeksie || "", kdBag: data.kdBag || "", kdDept: data.kdDept || "", keterangan: data.keterangan || "" });
        else form.reset({ kdSeksie: "", nmSeksie: "", kdBag: "", kdDept: "", keterangan: "" });
    }, [data, form, open]);

    const kdBag = form.watch("kdBag");
    const filteredDepartmentsLabels = React.useMemo(() =>
        departments.filter((d: Department) => d.kdBag === kdBag),
        [departments, kdBag]
    );

    const onSubmit = async (values: z.infer<typeof sectionSchema>) => {
        try {
            if (isEditing) await api.put(`/org/sections/${data!.kdSeksie}`, values);
            else await api.post(`/org/sections`, values);
            toast.success("Seksie berhasil disimpan");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Gagal menyimpan data");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Seksie" : "Tambah Seksie"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="kdSeksie" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kode Seksie</FormLabel>
                                <FormControl><Input {...field} disabled={isEditing} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="nmSeksie" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Seksie</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="kdBag" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bagian</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                form.setValue("kdDept", "");
                                            }}
                                            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Pilih...</option>
                                            {divisions.map((item: Division) => (
                                                <option key={item.kdBag} value={item.kdBag}>{item.nmBag}</option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="kdDept" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Departemen</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            disabled={!form.watch("kdBag")}
                                            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Pilih...</option>
                                            {filteredDepartmentsLabels.map((item: Department) => (
                                                <option key={item.kdDept} value={item.kdDept}>{item.nmDept}</option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="keterangan" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Keterangan</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="submit" className="w-full">{isEditing ? "Simpan Perubahan" : "Tambah Seksie"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
