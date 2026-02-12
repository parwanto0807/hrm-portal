"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Clock, MoreHorizontal, Plus, Search,
    Trash2, Edit, CheckCircle2, XCircle
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

// --- TYPES ---
interface ShiftType {
    id: string;
    kdJam: string;
    jnsJam: string | null;
    jmShif: number;
    jamMasuk: string | null;
    jamKeluar: string | null;
    isActive: boolean;
}

// --- API FUNCTIONS ---
const fetchShiftTypes = async () => {
    const { data } = await api.get("/shifts/types");
    return data.data;
};

const createShiftType = async (payload: any) => {
    // Note: We need to implement this endpoint in ShiftController
    const { data } = await api.post("/shifts/types", payload);
    return data;
};

const updateShiftType = async ({ id, payload }: { id: string; payload: any }) => {
    const { data } = await api.put(`/shifts/types/${id}`, payload);
    return data;
};

const deleteShiftType = async (id: string) => {
    await api.delete(`/shifts/types/${id}`);
};

export default function MasterShiftPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<ShiftType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        kdJam: "",
        jnsJam: "",
        jmShif: 1,
        jamMasuk: "",
        jamKeluar: "",
        isActive: true,
    });

    // --- QUERIES ---
    const { data: shiftTypes, isLoading } = useQuery<ShiftType[]>({
        queryKey: ["shiftTypes"],
        queryFn: fetchShiftTypes,
    });

    // --- MUTATIONS ---
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shiftTypes"] });
            setIsDialogOpen(false);
            setEditingShift(null);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Terjadi kesalahan");
        },
    };

    const createMutation = useMutation({
        mutationFn: createShiftType,
        ...mutationOptions,
        onSuccess: () => {
            toast.success("Shift berhasil ditambahkan");
            mutationOptions.onSuccess();
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateShiftType,
        ...mutationOptions,
        onSuccess: () => {
            toast.success("Shift berhasil diperbarui");
            mutationOptions.onSuccess();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteShiftType,
        onSuccess: () => {
            toast.success("Shift berhasil dihapus");
            queryClient.invalidateQueries({ queryKey: ["shiftTypes"] });
        },
    });

    // --- HANDLERS ---
    const resetForm = () => {
        setFormData({ kdJam: "", jnsJam: "", jmShif: 1, jamMasuk: "", jamKeluar: "", isActive: true });
    };

    const handleEdit = (shift: ShiftType) => {
        setEditingShift(shift);
        setFormData({
            kdJam: shift.kdJam,
            jnsJam: shift.jnsJam || "",
            jmShif: shift.jmShif,
            jamMasuk: shift.jamMasuk || "",
            jamKeluar: shift.jamKeluar || "",
            isActive: shift.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string, kdJam: string) => {
        if (confirm(`Hapus shift ${kdJam}?`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingShift) {
            updateMutation.mutate({ id: editingShift.id, payload: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const filteredShifts = shiftTypes?.filter(s =>
        s.kdJam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.jnsJam && s.jnsJam.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Clock className="h-6 w-6 text-indigo-500" />
                        Master Data Shift
                    </h1>
                    <p className="text-muted-foreground">Definisikan kode shift dan durasi jam kerjanya.</p>
                </div>
                <Button onClick={() => { resetForm(); setEditingShift(null); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Shift
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari kode atau nama shift..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Kode Shift</TableHead>
                                    <TableHead>Nama Shift</TableHead>
                                    <TableHead className="w-[100px] text-center">Masuk</TableHead>
                                    <TableHead className="w-[100px] text-center">Keluar</TableHead>
                                    <TableHead className="w-[120px] text-center">Status</TableHead>
                                    <TableHead className="w-[80px] text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-10">Memuat data...</TableCell></TableRow>
                                ) : filteredShifts?.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Tidak ada data shift.</TableCell></TableRow>
                                ) : filteredShifts?.map((shift) => (
                                    <TableRow key={shift.id}>
                                        <TableCell className="font-bold">{shift.kdJam}</TableCell>
                                        <TableCell>{shift.jnsJam || "-"}</TableCell>
                                        <TableCell className="text-center font-mono">{shift.jamMasuk || "-"}</TableCell>
                                        <TableCell className="text-center font-mono">{shift.jamKeluar || "-"}</TableCell>
                                        <TableCell className="text-center">
                                            {shift.isActive ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Aktif</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-500">Non-Aktif</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(shift)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDelete(shift.id, shift.kdJam)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingShift ? "Edit Shift" : "Tambah Shift Baru"}</DialogTitle>
                        <DialogDescription>Masukkan detail kode shift kerja perusahaan.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Kode Shift (e.g., S1, S2, L1)</Label>
                            <Input
                                value={formData.kdJam}
                                onChange={(e) => setFormData({ ...formData, kdJam: e.target.value.toUpperCase() })}
                                disabled={!!editingShift}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama/Deskripsi Shift</Label>
                            <Input
                                value={formData.jnsJam}
                                onChange={(e) => setFormData({ ...formData, jnsJam: e.target.value })}
                                placeholder="e.g., Shift Pagi (07:00 - 15:00)"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Jam Masuk (HH:mm)</Label>
                                <Input
                                    value={formData.jamMasuk}
                                    onChange={(e) => setFormData({ ...formData, jamMasuk: e.target.value })}
                                    placeholder="07:00"
                                    maxLength={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Jam Keluar (HH:mm)</Label>
                                <Input
                                    value={formData.jamKeluar}
                                    onChange={(e) => setFormData({ ...formData, jamKeluar: e.target.value })}
                                    placeholder="15:00"
                                    maxLength={5}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Jumlah Shift (Default: 1)</Label>
                            <Input
                                type="number"
                                value={formData.jmShif}
                                onChange={(e) => setFormData({ ...formData, jmShif: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <Label htmlFor="isActive">Shift Aktif</Label>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                            <Button type="submit">{editingShift ? "Simpan Perubahan" : "Tambahkan"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
