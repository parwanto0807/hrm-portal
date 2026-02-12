"use client";

import React, { useState, useEffect } from "react";
import {
    Landmark,
    Plus,
    Search,
    RefreshCcw,
    Edit,
    Trash2,
    ArrowLeft,
    MoreHorizontal,
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
import { BankDialog } from "@/components/settings/master/BankDialog";
import { Bank } from "@/types/master";
import HeaderCard from "@/components/ui/header-card";

export default function BankPayrollPage() {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const fetchBanks = async () => {
        setLoading(true);
        try {
            const response = await api.get("/banks");
            if (response.data.success) {
                setBanks(response.data.data);
            }
        } catch (_error) {
            toast.error("Gagal mengambil data bank");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    const handleDelete = async (code: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus bank ini?")) return;
        try {
            await api.delete(`/banks/${code}`);
            toast.success("Bank berhasil dihapus");
            fetchBanks();
        } catch (_error) {
            toast.error("Gagal menghapus bank");
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        try {
            const response = await api.post("/mysql/import/banks");
            if (response.data.success) {
                toast.success(`Berhasil mengimport ${response.data.stats.imported} bank`);
                fetchBanks();
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Gagal mengimport data dari MySQL");
        } finally {
            setIsImporting(false);
        }
    };

    const filteredBanks = banks.filter(bank =>
        bank.bankCode.toLowerCase().includes(search.toLowerCase()) ||
        bank.bankNama?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-2 md:p-6 space-y-6 w-full">
            <HeaderCard
                title="Data Bank / Payroll"
                description="Kelola master data bank untuk sistem penggajian"
                icon={<Landmark className="h-6 w-6 sm:h-8 sm:w-8" />}
                gradientFrom="from-amber-500"
                gradientTo="to-orange-600"
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
                                setSelectedBank(null);
                                setIsDialogOpen(true);
                            }}
                            className="gap-2 bg-white text-orange-600 hover:bg-amber-50"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Bank
                        </Button>
                    </div>
                }
            />

            <Card className="border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-blue-500" />
                            Daftar Bank
                        </CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari bank atau kode..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-white dark:bg-slate-950 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead>Nama Bank</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10">
                                            <div className="flex flex-col items-center gap-2">
                                                <RefreshCcw className="h-8 w-8 animate-spin text-blue-500" />
                                                <p className="text-sm text-muted-foreground">Memuat data bank...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredBanks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10">
                                            <div className="flex flex-col items-center gap-2">
                                                <Database className="h-8 w-8 text-slate-300" />
                                                <p className="text-sm text-muted-foreground">Tidak ada data bank ditemukan</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBanks.map((bank) => (
                                        <TableRow key={bank.bankCode} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 dark:bg-blue-900/30 border-blue-200">
                                                    {bank.bankCode}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">{bank.bankNama}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(bank.createdAt).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric"
                                                })}
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
                                                                setSelectedBank(bank);
                                                                setIsDialogOpen(true);
                                                            }}
                                                            className="gap-2"
                                                        >
                                                            <Edit className="h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(bank.bankCode)}
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

            <BankDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                bank={selectedBank}
                onSuccess={fetchBanks}
            />
        </div>
    );
}
