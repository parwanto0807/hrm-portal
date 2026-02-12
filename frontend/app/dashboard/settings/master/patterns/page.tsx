"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Repeat, Plus, Search, Trash2, Edit, Save,
    CalendarCheck, Info, ChevronDown
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- TYPES ---
interface ShiftPattern {
    id: string;
    name: string;
    description: string;
    pattern: string;
    isActive: boolean;
}

// --- API FUNCTIONS ---
const fetchPatterns = async () => {
    const { data } = await api.get("/shifts/patterns");
    return data.data;
};

const createPattern = async (payload: any) => {
    const { data } = await api.post("/shifts/patterns", payload);
    return data;
};

const updatePattern = async ({ id, payload }: { id: string; payload: any }) => {
    const { data } = await api.put(`/shifts/patterns/${id}`, payload);
    return data;
};

const deletePattern = async (id: string) => {
    await api.delete(`/shifts/patterns/${id}`);
};

const fetchShiftTypes = async () => {
    const { data } = await api.get("/shifts/types");
    return data.data;
};

export default function MasterShiftPatternPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPattern, setEditingPattern] = useState<ShiftPattern | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        pattern: "", // e.g. "S1,S1,S1,S1,S1,OFF,OFF,S2,S2,S2,S2,S2,OFF,OFF"
    });

    const { data: patterns, isLoading } = useQuery<ShiftPattern[]>({
        queryKey: ["patterns"],
        queryFn: fetchPatterns,
    });

    const { data: shiftTypes } = useQuery<any[]>({
        queryKey: ["shift-types"],
        queryFn: fetchShiftTypes,
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["patterns"] });
            setIsDialogOpen(false);
            toast.success("Pola berhasil disimpan");
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Kesalahan"),
    };

    const createMutation = useMutation({ mutationFn: createPattern, ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: updatePattern, ...mutationOptions });
    const deleteMutation = useMutation({
        mutationFn: deletePattern,
        onSuccess: () => {
            toast.success("Pola berhasil dihapus");
            queryClient.invalidateQueries({ queryKey: ["patterns"] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation: Clean space and ensure comma separation
        const cleanedPattern = formData.pattern.split(',').map(s => s.trim()).join(',');
        const payload = { ...formData, pattern: cleanedPattern };

        if (editingPattern) {
            updateMutation.mutate({ id: editingPattern.id, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleEdit = (p: ShiftPattern) => {
        setEditingPattern(p);
        setFormData({
            name: p.name,
            description: p.description || "",
            pattern: p.pattern
        });
        setIsDialogOpen(true);
    };

    const filteredPatterns = patterns?.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.pattern.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center gap-2">
                        <Repeat className="h-6 w-6 text-indigo-500" />
                        Master Pola Shift (Cycle)
                    </h1>
                    <p className="text-muted-foreground">Definisikan siklus perputaran shift tetap untuk grup kerja.</p>
                </div>
                <Button onClick={() => { setEditingPattern(null); setFormData({ name: "", description: "", pattern: "" }); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Pola
                </Button>
            </div>

            <Card className="border-amber-100 bg-amber-50/20 dark:border-amber-900/30 dark:bg-amber-900/10">
                <CardHeader className="py-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-400">
                        <Info className="h-4 w-4" /> Tip Penggunaan
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-amber-700 dark:text-amber-500 space-y-1">
                    <p>- Gunakan koma untuk memisahkan kode shift. Misal: <b>S1,S1,OFF,S2,S2,OFF</b></p>
                    <p>- Pastikan kode shift (S1, S2, dsb) sesuai dengan yang ada di Master Shift Type.</p>
                    <p>- Gunakan <b>OFF</b> untuk hari libur dalam siklus.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Cari pola..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Pola</TableHead>
                                    <TableHead>Definisi Siklus</TableHead>
                                    <TableHead className="w-[80px] text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-10">Memuat...</TableCell></TableRow>
                                ) : filteredPatterns?.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>
                                            <div className="font-bold">{p.name}</div>
                                            <div className="text-xs text-muted-foreground">{p.description}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {p.pattern.split(',').map((s, idx) => (
                                                    <Badge key={idx} variant={s === 'OFF' ? 'secondary' : 'default'} className="text-[10px]">
                                                        {s}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="text-[10px] mt-1 text-muted-foreground italic">Total siklus: {p.pattern.split(',').length} hari</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => { if (confirm('Hapus pola ini?')) deleteMutation.mutate(p.id) }} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredPatterns?.length === 0 && (
                                    <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">Belum ada pola. Klik Tambah Pola untuk memulai.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>{editingPattern ? "Edit Pola Shift" : "Tambah Pola Shift"}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nama Pola (misal: 3 Shift Mingguan)</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Deskripsi</Label>
                            <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Definisi Siklus (Pisah dengan koma)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] gap-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                            <Plus className="h-3 w-3" /> Pilih Shift
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="end">
                                        <div className="p-3 border-b bg-slate-50 dark:bg-slate-900/50">
                                            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Pilih Master Shift</div>
                                        </div>
                                        <ScrollArea className="h-[250px]">
                                            <div className="p-2 grid grid-cols-1 gap-1">
                                                {shiftTypes?.map((s) => (
                                                    <button
                                                        key={s.kdJam}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = formData.pattern.trim();
                                                            const newVal = current ? `${current},${s.kdJam}` : s.kdJam;
                                                            setFormData({ ...formData, pattern: newVal });
                                                        }}
                                                        className="flex items-center justify-between p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-left transition-colors group"
                                                    >
                                                        <div>
                                                            <Badge variant="outline" className="text-[10px] bg-white group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                                {s.kdJam}
                                                            </Badge>
                                                            <span className="ml-2 text-xs font-medium">{s.jnsJam}</span>
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">{s.jamMasuk}-{s.jamKeluar}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.pattern}
                                onChange={e => setFormData({ ...formData, pattern: e.target.value })}
                                placeholder="S1,S1,S1,S1,S1,OFF,OFF"
                                required
                            />
                            <p className="text-[10px] text-muted-foreground italic">Contoh: S1,S1,S1,S1,S1,OFF,OFF (Satu minggu Shift 1, Sabtu Minggu Libur)</p>
                        </div>
                        <DialogFooter><Button type="submit">Simpan Pola</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
