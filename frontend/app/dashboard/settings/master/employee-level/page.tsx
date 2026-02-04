
"use client";

import React, { useState, useEffect } from "react";
import {
    GraduationCap,
    Plus,
    Search,
    RefreshCcw,
    Edit,
    Trash2,
    Database
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { EmployeeLevelDialog } from "@/components/settings/master/EmployeeLevelDialog";
import HeaderCard from "@/components/ui/header-card";

export default function EmployeeLevelPage() {
    const [levels, setLevels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [diagOpen, setDiagOpen] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<any>(null);
    const [isImporting, setIsImporting] = useState(false);

    const fetchLevels = async () => {
        setLoading(true);
        try {
            const response = await api.get("/levels");
            if (response.data.success) {
                setLevels(response.data.data);
            }
        } catch (error) {
            toast.error("Gagal mengambil data golongan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLevels();
    }, []);

    const handleDelete = async (code: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus golongan ini?")) return;
        try {
            await api.delete(`/levels/${code}`);
            toast.success("Golongan berhasil dihapus");
            fetchLevels();
        } catch (error) {
            toast.error("Gagal menghapus golongan");
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        try {
            const response = await api.post("/mysql/import/levels");
            if (response.data.success) {
                toast.success(`Berhasil mengimport ${response.data.stats.imported} golongan`);
                fetchLevels();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal mengimport data dari MySQL");
        } finally {
            setIsImporting(false);
        }
    };

    const filteredLevels = levels.filter(lvl =>
        lvl.kdPkt.toLowerCase().includes(search.toLowerCase()) ||
        lvl.nmPkt?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 md:px-2 space-y-6 w-full max-w-full">
            <HeaderCard
                title="Data Golongan (Employee Level)"
                description="Kelola master data golongan dan pangkat karyawan"
                icon={<GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" />}
                gradientFrom="from-cyan-600"
                gradientTo="to-cyan-900"
                variant="elegant"
                backgroundStyle="pattern"
                showActionArea={true}
                actionArea={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" className="text-white hover:bg-white/20" onClick={handleImport} disabled={isImporting}>
                            <Database className={`mr-2 h-4 w-4 ${isImporting ? 'animate-spin' : ''}`} />
                            {isImporting ? 'Syncing...' : 'Sync MySQL'}
                        </Button>
                        <Button
                            onClick={() => {
                                setSelectedLevel(null);
                                setDiagOpen(true);
                            }}
                            className="bg-white text-slate-900 hover:bg-slate-100"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Golongan
                        </Button>
                    </div>
                }
            />

            <Card className="border-t-4 border-t-slate-800 shadow-md">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Daftar Golongan</CardTitle>
                            <CardDescription>
                                Total {filteredLevels.length} golongan terdaftar
                            </CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari kode atau nama..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead>Nama Golongan/Pangkat</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Memuat data...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredLevels.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Tidak ada data ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLevels.map((lvl) => (
                                        <TableRow key={lvl.kdPkt}>
                                            <TableCell className="font-medium">
                                                <Badge variant="outline">{lvl.kdPkt}</Badge>
                                            </TableCell>
                                            <TableCell>{lvl.nmPkt}</TableCell>
                                            <TableCell>{lvl.keterangan || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setSelectedLevel(lvl);
                                                            setDiagOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4 text-orange-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(lvl.kdPkt)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <EmployeeLevelDialog
                open={diagOpen}
                onOpenChange={setDiagOpen}
                level={selectedLevel}
                onSuccess={fetchLevels}
            />
        </div>
    );
}
