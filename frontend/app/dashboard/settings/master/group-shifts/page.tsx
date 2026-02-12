"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Users, MoreHorizontal, Plus, Search,
    Trash2, Edit, ShieldCheck, MapPin, Briefcase
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

// --- TYPES ---
interface ShiftPattern {
    id: string;
    name: string;
    pattern: string;
}

interface GroupShift {
    id: string;
    groupShift: string;
    groupName: string;
    isActive: boolean;
    patternId?: string | null;
    patternRefDate?: string | null;
    patternRef?: ShiftPattern | null;
}

// --- API FUNCTIONS ---
const fetchGroups = async () => {
    const { data } = await api.get("/shifts/groups");
    return data.data;
};

const fetchPatterns = async () => {
    const { data } = await api.get("/shifts/patterns");
    return data.data;
};

const createGroup = async (payload: any) => {
    const { data } = await api.post("/shifts/groups", payload);
    return data;
};

const updateGroup = async ({ id, payload }: { id: string; payload: any }) => {
    const { data } = await api.put(`/shifts/groups/${id}`, payload);
    return data;
};

const deleteGroup = async (id: string) => {
    await api.delete(`/shifts/groups/${id}`);
};

export default function MasterGroupShiftPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupShift | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        groupShift: "",
        groupName: "",
        isActive: true,
        patternId: "",
        patternRefDate: "",
    });

    const { data: groups, isLoading } = useQuery<GroupShift[]>({
        queryKey: ["groups"],
        queryFn: fetchGroups,
    });

    const { data: patterns } = useQuery<ShiftPattern[]>({
        queryKey: ["patterns"],
        queryFn: fetchPatterns,
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups"] });
            setIsDialogOpen(false);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Kesalahan"),
    };

    const createMutation = useMutation({ mutationFn: createGroup, ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: updateGroup, ...mutationOptions });
    const deleteMutation = useMutation({
        mutationFn: deleteGroup,
        onSuccess: () => {
            toast.success("Grup berhasil dihapus");
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            patternId: formData.patternId || null,
            patternRefDate: formData.patternRefDate ? new Date(formData.patternRefDate).toISOString() : null
        };
        if (editingGroup) {
            updateMutation.mutate({ id: editingGroup.id, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleEdit = (group: GroupShift) => {
        setEditingGroup(group);
        setFormData({
            groupShift: group.groupShift,
            groupName: group.groupName.trim(),
            isActive: group.isActive,
            patternId: group.patternId || "",
            patternRefDate: group.patternRefDate ? group.patternRefDate.split('T')[0] : ""
        });
        setIsDialogOpen(true);
    };

    const filteredGroups = groups?.filter(g =>
        g.groupShift.includes(searchTerm) || g.groupName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-500" />
                        Master Group Shift
                    </h1>
                    <p className="text-muted-foreground">Kelola pengelompokan karyawan untuk rotasi jadwal.</p>
                </div>
                <Button onClick={() => {
                    setEditingGroup(null);
                    setFormData({
                        groupShift: "",
                        groupName: "",
                        isActive: true,
                        patternId: "",
                        patternRefDate: ""
                    });
                    setIsDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Grup
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Cari kode atau nama grup..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead>Nama Grup</TableHead>
                                    <TableHead className="w-[100px] text-center">Status</TableHead>
                                    <TableHead className="w-[80px] text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-10">Memuat...</TableCell></TableRow>
                                ) : filteredGroups?.map(group => (
                                    <TableRow key={group.id}>
                                        <TableCell className="font-mono font-bold">{group.groupShift}</TableCell>
                                        <TableCell className="font-medium">{group.groupName}</TableCell>
                                        <TableCell className="text-center">
                                            {group.isActive ? <Badge className="bg-blue-100 text-blue-700">Aktif</Badge> : <Badge variant="secondary">Inaktif</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(group)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(group.id)}><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
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
                    <DialogHeader><DialogTitle>{editingGroup ? "Edit Grup" : "Tambah Grup"}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Kode Grup (2 digit, misal: 01)</Label>
                            <Input value={formData.groupShift} onChange={e => setFormData({ ...formData, groupShift: e.target.value })} disabled={!!editingGroup} required maxLength={2} />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Grup</Label>
                            <Input value={formData.groupName} onChange={e => setFormData({ ...formData, groupName: e.target.value })} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Pola Shift (Siklus)</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.patternId}
                                    onChange={e => setFormData({ ...formData, patternId: e.target.value })}
                                >
                                    <option value="">-- Tanpa Pola --</option>
                                    {patterns?.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tgl Mulai Siklus (Hari 1)</Label>
                                <Input
                                    type="date"
                                    value={formData.patternRefDate}
                                    onChange={e => setFormData({ ...formData, patternRefDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input type="checkbox" id="isActiveGroup" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                            <Label htmlFor="isActiveGroup">Grup Aktif</Label>
                        </div>
                        <DialogFooter><Button type="submit">Simpan</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
