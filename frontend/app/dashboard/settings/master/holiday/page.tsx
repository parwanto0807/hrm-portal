"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    Calendar, MoreHorizontal, Plus, RefreshCw,
    Trash2, CalendarOff, Palmtree
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

// --- TYPES ---
interface Holiday {
    id: string;
    tanggal: string;
    keterangan: string;
    typeDay: "LIBUR_NASIONAL" | "CUTI_BERSAMA" | "LIBUR" | "KERJA";
    isRepeat: boolean;
}

// --- API FUNCTIONS ---
const fetchHolidays = async (year: number) => {
    const { data } = await api.get(`/holidays?year=${year}`);
    return data.data;
};

const syncHolidays = async (year: number) => {
    const { data } = await api.post("/holidays/sync", { year });
    return data;
};

const deleteHoliday = async (id: string) => {
    await api.delete(`/holidays/${id}`);
};

const createHoliday = async (newHoliday: any) => {
    const { data } = await api.post("/holidays", newHoliday);
    return data;
};

export default function HolidayPage() {
    const queryClient = useQueryClient();
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        tanggal: "",
        keterangan: "",
        typeDay: "LIBUR_NASIONAL",
    });

    // --- QUERIES ---
    const { data: holidays, isLoading } = useQuery<Holiday[]>({
        queryKey: ["holidays", selectedYear],
        queryFn: () => fetchHolidays(selectedYear),
    });

    // --- MUTATIONS ---
    const syncMutation = useMutation({
        mutationFn: syncHolidays,
        onSuccess: (data) => {
            toast.success("Sinkronisasi Berhasil", {
                description: data.message,
            });
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
        },
        onError: (error: any) => {
            toast.error("Gagal Sinkronisasi", {
                description: error.response?.data?.message || "Terjadi kesalahan",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteHoliday,
        onSuccess: () => {
            toast.success("Holiday dihapus");
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
        },
    });

    const createMutation = useMutation({
        mutationFn: createHoliday,
        onSuccess: () => {
            toast.success("Holiday berhasil ditambahkan");
            setIsAddOpen(false);
            setFormData({ tanggal: "", keterangan: "", typeDay: "LIBUR_NASIONAL" });
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
        },
        onError: (error: any) => {
            toast.error("Gagal Menambahkan", {
                description: error.response?.data?.message || "Terjadi kesalahan",
            });
        },
    });

    // --- HANDLERS ---
    const handleSync = () => {
        syncMutation.mutate(selectedYear);
    };

    const handleDelete = (id: string) => {
        if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tanggal || !formData.keterangan) {
            toast.error("Mohon lengkapi data");
            return;
        }
        createMutation.mutate(formData);
    };

    // --- RENDER HELPERS ---
    const getTypeBadge = (type: string) => {
        switch (type) {
            case "LIBUR_NASIONAL":
                return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Nasional</Badge>;
            case "CUTI_BERSAMA":
                return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">Cuti Bersama</Badge>;
            case "LIBUR":
                return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Libur Perusahaan</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
                        <Palmtree className="h-6 w-6 text-red-500" />
                        Hari Libur & Cuti Bersama
                    </h1>
                    <p className="text-muted-foreground">
                        Kelola daftar hari libur nasional dan kebijakan libur perusahaan.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={selectedYear.toString()}
                        onValueChange={(val) => setSelectedYear(parseInt(val))}
                    >
                        <SelectTrigger className="w-[120px] bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        onClick={handleSync}
                        disabled={syncMutation.isPending}
                        className="bg-white dark:bg-slate-950"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                        {syncMutation.isPending ? "Syncing..." : "Sinkron"}
                    </Button>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Review Manual
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Hari Libur Manual</DialogTitle>
                                <DialogDescription>
                                    Tambahkan hari libur khusus untuk perusahaan jika tidak tercover oleh sinkronisasi otomatis.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Tanggal</Label>
                                    <Input
                                        type="date"
                                        value={formData.tanggal}
                                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Keterangan Libur</Label>
                                    <Input
                                        placeholder="Contoh: HUT Perusahaan"
                                        value={formData.keterangan}
                                        onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipe Libur</Label>
                                    <Select
                                        value={formData.typeDay}
                                        onValueChange={(val: any) => setFormData({ ...formData, typeDay: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LIBUR_NASIONAL">Libur Nasional</SelectItem>
                                            <SelectItem value="CUTI_BERSAMA">Cuti Bersama</SelectItem>
                                            <SelectItem value="LIBUR">Libur Perusahaan/Khusus</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? "Menyimpan..." : "Simpan"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Content */}
            <Card className="border-t-4 border-t-red-500 shadow-sm">
                <CardHeader>
                    <CardTitle>Daftar Hari Libur {selectedYear}</CardTitle>
                    <CardDescription>
                        Total {holidays?.length || 0} hari libur terdaftar di sistem untuk tahun ini.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                                    <TableHead className="w-[200px]">Tanggal</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="w-[150px]">Tipe</TableHead>
                                    <TableHead className="w-[80px] text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            Memuat data...
                                        </TableCell>
                                    </TableRow>
                                ) : holidays && holidays.length > 0 ? (
                                    holidays.map((holiday) => (
                                        <TableRow key={holiday.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-slate-400" />
                                                    {format(new Date(holiday.tanggal), "dd MMMM yyyy", { locale: id })}
                                                </div>
                                            </TableCell>
                                            <TableCell>{holiday.keterangan}</TableCell>
                                            <TableCell>{getTypeBadge(holiday.typeDay)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(holiday.id)}
                                                            className="text-red-600 focus:text-red-600 cursor-pointer"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <CalendarOff className="h-8 w-8 mb-2 opacity-20" />
                                                <p>Tidak ada data hari libur.</p>
                                                <Button variant="link" onClick={handleSync} className="h-auto p-0 text-red-500">
                                                    Sinkronisasi Sekarang
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
