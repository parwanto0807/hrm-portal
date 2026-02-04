"use client";

import React, { useState, useEffect } from "react";
import {
    Briefcase,
    Plus,
    Search,
    RefreshCcw,
    Edit,
    Trash2,
    ArrowLeft,
    MoreHorizontal,
    Database,
    CircleDollarSign
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "@/lib/api";
import Link from "next/link";
import { PositionDialog } from "@/components/settings/master/PositionDialog";
import { Position } from "@/types/master";
import HeaderCard from "@/components/ui/header-card";

export default function PositionPage() {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const fetchPositions = async () => {
        setLoading(true);
        try {
            const response = await api.get("/positions");
            if (response.data.success) {
                setPositions(response.data.data);
            }
        } catch (_error) {
            toast.error("Gagal mengambil data jabatan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPositions();
    }, []);

    const handleDelete = async (code: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus jabatan ini?")) return;
        try {
            await api.delete(`/positions/${code}`);
            toast.success("Jabatan berhasil dihapus");
            fetchPositions();
        } catch (_error) {
            toast.error("Gagal menghapus jabatan");
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        try {
            const response = await api.post("/mysql/import/positions");
            if (response.data.success) {
                toast.success(`Berhasil mengimport ${response.data.stats.imported} jabatan`);
                fetchPositions();
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Gagal mengimport data dari MySQL");
        } finally {
            setIsImporting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(amount);
    };

    const filteredPositions = positions.filter(pos =>
        pos.kdJab.toLowerCase().includes(search.toLowerCase()) ||
        pos.nmJab?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 md:px-2 space-y-6 w-full max-w-full">
            <HeaderCard
                title="Data Jabatan (Position)"
                description="Kelola master data jabatan dan tunjangan standar jabatan"
                icon={<Briefcase className="h-6 w-6 sm:h-8 sm:w-8" />}
                gradientFrom="from-slate-700"
                gradientTo="to-slate-900"
                variant="elegant"
                backgroundStyle="pattern"
                showActionArea={true}
                actionArea={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" className="text-white hover:bg-white/20" asChild>
                            <Link href="/dashboard/settings">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleImport}
                            disabled={isImporting}
                            className="gap-2"
                        >
                            <RefreshCcw className={`h-4 w-4 ${isImporting ? 'animate-spin' : ''}`} />
                            {isImporting ? "Importing..." : "Import dari MySQL"}
                        </Button>
                        <Button
                            onClick={() => {
                                setSelectedPosition(null);
                                setIsDialogOpen(true);
                            }}
                            className="gap-2 bg-white text-slate-900 hover:bg-slate-50"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Jabatan
                        </Button>
                    </div>
                }
            />

            <Card className="border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <CircleDollarSign className="h-5 w-5 text-emerald-500" />
                            Daftar Jabatan & Tunjangan
                        </CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari jabatan atau kode..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                <TableRow>
                                    <TableHead className="w-[120px]">Kode</TableHead>
                                    <TableHead>Nama Jabatan</TableHead>
                                    <TableHead>Tunj. Jabatan</TableHead>
                                    <TableHead>Tunj. Transport</TableHead>
                                    <TableHead>Tunj. Shift</TableHead>
                                    <TableHead>Premi Hdr</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10">
                                            <div className="flex flex-col items-center gap-2">
                                                <RefreshCcw className="h-8 w-8 animate-spin text-slate-400" />
                                                <p className="text-sm text-muted-foreground">Memuat data jabatan...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPositions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10">
                                            <div className="flex flex-col items-center gap-2">
                                                <Database className="h-8 w-8 text-slate-300" />
                                                <p className="text-sm text-muted-foreground">Tidak ada data jabatan ditemukan</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPositions.map((pos) => (
                                        <TableRow key={pos.kdJab} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <Badge variant="outline" className="font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    {pos.kdJab}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">{pos.nmJab}</TableCell>
                                            <TableCell className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                {formatCurrency(Number(pos.nTjabatan))}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(Number(pos.nTransport))}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(Number(pos.nShiftAll))}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(Number(pos.nPremiHdr))}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-32">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedPosition(pos);
                                                                setIsDialogOpen(true);
                                                            }}
                                                            className="gap-2"
                                                        >
                                                            <Edit className="h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(pos.kdJab)}
                                                            className="gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950"
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <PositionDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                position={selectedPosition}
                onSuccess={fetchPositions}
            />
        </div>
    );
}
