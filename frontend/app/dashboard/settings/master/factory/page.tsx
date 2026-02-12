
"use client";

import React, { useState, useEffect } from "react";
import {
    Factory as FactoryIcon,
    Plus,
    Search,
    Edit,
    Trash2,
    Database,
    MapPin,
    Activity,
    ExternalLink
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
import { Factory } from "@/types/master";
import HeaderCard from "@/components/ui/header-card";

export default function FactoryPage() {
    const [factories, setFactories] = useState<Factory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [diagOpen, setDiagOpen] = useState(false);
    const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const fetchFactories = async () => {
        setLoading(true);
        try {
            const response = await api.get("/factories");
            if (response.data.success) {
                setFactories(response.data.data);
            }
        } catch (_error) {
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
        } catch (_error) {
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
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Gagal mengimport data dari MySQL");
        } finally {
            setIsImporting(false);
        }
    };

    const filteredFactories = factories.filter(f =>
        f.kdFact.toLowerCase().includes(search.toLowerCase()) ||
        f.nmFact?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-2 md:p-6 space-y-6 w-full max-w-full">
            <HeaderCard
                title="Data Factory (Pabrik)"
                description="Kelola master data factory/lokasi pabrik"
                icon={<FactoryIcon className="h-6 w-6 sm:h-8 sm:w-8" />}
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
                                    <TableHead>Lokasi</TableHead>
                                    <TableHead>Radius</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Memuat data...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredFactories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Tidak ada data ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFactories.map((f) => (
                                        <TableRow key={f.kdFact} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <Badge variant="outline" className="bg-slate-50">{f.kdFact}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-slate-800">{f.nmFact}</div>
                                            </TableCell>
                                            <TableCell>
                                                {f.lat && f.long ? (
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="secondary" className="w-fit font-normal text-xs gap-1 bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200">
                                                            <MapPin className="w-3 h-3" />
                                                            {f.lat}, {f.long}
                                                        </Badge>
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${f.lat},${f.long}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-muted-foreground hover:text-sky-600 hover:underline inline-flex items-center gap-1 w-fit mt-0.5"
                                                        >
                                                            Lihat di Peta <ExternalLink className="w-2 h-2" />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">- Belum diatur -</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {f.radius ? (
                                                    <Badge variant="outline" className="gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                                                        <Activity className="w-3 h-3" />
                                                        {f.radius} Meter
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs text-center block">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                                                {f.keterangan || "-"}
                                            </TableCell>
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
