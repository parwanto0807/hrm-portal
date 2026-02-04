
"use client";

import React, { useState, useEffect } from "react";
import {
    Factory,
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
import { FactoryDialog } from "@/components/settings/master/FactoryDialog";
import HeaderCard from "@/components/ui/header-card";

export default function FactoryPage() {
    const [factories, setFactories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [diagOpen, setDiagOpen] = useState(false);
    const [selectedFactory, setSelectedFactory] = useState<any>(null);
    const [isImporting, setIsImporting] = useState(false);

    const fetchFactories = async () => {
        setLoading(true);
        try {
            const response = await api.get("/factories");
            if (response.data.success) {
                setFactories(response.data.data);
            }
        } catch (error) {
            toast.error("Gagal mengambil data factory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFactories();
    }, []);

    const handleDelete = async (code: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus factory ini?")) return;
        try {
            await api.delete(`/factories/${code}`);
            toast.success("Factory berhasil dihapus");
            fetchFactories();
        } catch (error) {
            toast.error("Gagal menghapus factory");
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        try {
            const response = await api.post("/mysql/import/factories");
            if (response.data.success) {
                toast.success(`Berhasil mengimport ${response.data.stats.imported} factory`);
                fetchFactories();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal mengimport data dari MySQL");
        } finally {
            setIsImporting(false);
        }
    };

    const filteredFactories = factories.filter(f =>
        f.kdFact.toLowerCase().includes(search.toLowerCase()) ||
        f.nmFact?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 md:px-2 space-y-6 w-full max-w-full">
            <HeaderCard
                title="Data Factory (Pabrik)"
                description="Kelola master data factory/lokasi pabrik"
                icon={<Factory className="h-6 w-6 sm:h-8 sm:w-8" />}
                gradientFrom="from-orange-600"
                gradientTo="to-orange-900"
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
                                setSelectedFactory(null);
                                setDiagOpen(true);
                            }}
                            className="bg-white text-slate-900 hover:bg-slate-100"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Factory
                        </Button>
                    </div>
                }
            />

            <Card className="border-t-4 border-t-slate-800 shadow-md">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Daftar Factory</CardTitle>
                            <CardDescription>
                                Total {filteredFactories.length} factory terdaftar
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
                                    <TableHead>Nama Factory</TableHead>
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
                                ) : filteredFactories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Tidak ada data ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFactories.map((f) => (
                                        <TableRow key={f.kdFact}>
                                            <TableCell className="font-medium">
                                                <Badge variant="outline">{f.kdFact}</Badge>
                                            </TableCell>
                                            <TableCell>{f.nmFact}</TableCell>
                                            <TableCell>{f.keterangan || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setSelectedFactory(f);
                                                            setDiagOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4 text-orange-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(f.kdFact)}
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

            <FactoryDialog
                open={diagOpen}
                onOpenChange={setDiagOpen}
                factory={selectedFactory}
                onSuccess={fetchFactories}
            />
        </div>
    );
}
