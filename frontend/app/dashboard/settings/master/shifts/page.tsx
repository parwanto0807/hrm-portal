"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth } from "date-fns";
import { id } from "date-fns/locale";
import {
    Calendar, Save, RefreshCw, ChevronLeft, ChevronRight,
    Settings2, Users, CheckCircle2, AlertCircle
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
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// --- TYPES ---
interface GroupShift {
    id: string;
    groupShift: string;
    groupName: string;
}

interface ShiftType {
    id: string;
    kdJam: string;
    jnsJam: string;
}

interface Dshift {
    periode: string;
    groupShiftId: string;
    [key: string]: any; // shift01, shift02...
}

// --- API FUNCTIONS ---
const fetchGroups = async () => {
    const { data } = await api.get("/shifts/groups");
    return data.data;
};

const fetchShiftTypes = async () => {
    const { data } = await api.get("/shifts/types");
    return data.data;
};

const fetchMatrix = async (periode: string, groupShiftId: string) => {
    const { data } = await api.get(`/shifts/matrix?periode=${periode}&groupShiftId=${groupShiftId}`);
    return data.data;
};

const saveMatrix = async (formData: any) => {
    const { data } = await api.post("/shifts/matrix", formData);
    return data;
};

const syncToAbsent = async (params: { periode: string; groupShiftId: string }) => {
    const { data } = await api.post("/shifts/sync", params);
    return data;
};

const generateFromPattern = async (params: { periode: string; groupShiftId: string }) => {
    const { data } = await api.post("/shifts/generate", params);
    return data;
};

export default function ShiftMatrixPage() {
    const queryClient = useQueryClient();

    // State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [matrixData, setMatrixData] = useState<Record<string, string>>({});

    const periode = format(selectedDate, "yyyyMM");
    const daysInMonth = getDaysInMonth(selectedDate);
    const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // --- QUERIES ---
    const { data: groups } = useQuery<GroupShift[]>({
        queryKey: ["groups"],
        queryFn: fetchGroups,
    });

    const { data: shiftTypes } = useQuery<ShiftType[]>({
        queryKey: ["shiftTypes"],
        queryFn: fetchShiftTypes,
    });

    const { data: remoteMatrix, isLoading: isMatrixLoading } = useQuery<Dshift>({
        queryKey: ["matrix", periode, selectedGroup],
        queryFn: () => fetchMatrix(periode, selectedGroup),
        enabled: !!selectedGroup,
    });

    // Effect to sync remote data to local state
    useEffect(() => {
        if (remoteMatrix) {
            const newMatrix: Record<string, string> = {};
            for (let i = 1; i <= 31; i++) {
                const key = `shift${i.toString().padStart(2, '0')}`;
                newMatrix[key] = remoteMatrix[key]?.toString() || "0";
            }
            setMatrixData(newMatrix);
        } else {
            setMatrixData({});
        }
    }, [remoteMatrix]);

    // Initial Group Selection
    useEffect(() => {
        if (groups && groups.length > 0 && !selectedGroup) {
            setSelectedGroup(groups[0].id);
        }
    }, [groups, selectedGroup]);

    // --- MUTATIONS ---
    const saveMutation = useMutation({
        mutationFn: saveMatrix,
        onSuccess: () => {
            toast.success("Jadwal disimpan");
            queryClient.invalidateQueries({ queryKey: ["matrix"] });
        },
        onError: (error: any) => {
            toast.error("Gagal simpan: " + (error.response?.data?.message || error.message));
        }
    });

    const generateMutation = useMutation({
        mutationFn: generateFromPattern,
        onSuccess: (data) => {
            toast.success("Berhasil", { description: data.message });
            queryClient.invalidateQueries({ queryKey: ["matrix"] });
        },
        onError: (error: any) => {
            toast.error("Gagal Generate: " + (error.response?.data?.message || error.message));
        }
    });

    const syncMutation = useMutation({
        mutationFn: syncToAbsent,
        onSuccess: (data) => {
            toast.success("Sinkronisasi Berhasil", { description: data.message });
        },
        onError: (error: any) => {
            toast.error("Gagal Sinkronisasi: " + (error.response?.data?.message || error.message));
        }
    });

    // --- HANDLERS ---
    const handleCellChange = (dayKey: string, value: string) => {
        setMatrixData(prev => ({ ...prev, [dayKey]: value }));
    };

    const handleSave = () => {
        if (!selectedGroup) return;
        saveMutation.mutate({
            periode,
            groupShiftId: selectedGroup,
            ...matrixData
        });
    };

    const handleGenerate = () => {
        if (!selectedGroup) return;
        if (!confirm("Bulan ini akan diisi otomatis berdasarkan pola shift yang ditentukan di Master Grup. Lanjutkan?")) return;
        generateMutation.mutate({ periode, groupShiftId: selectedGroup });
    };

    const handleSync = () => {
        if (!selectedGroup) return;
        if (!confirm("Sinkronisasi akan memperbarui jadwal individu semua karyawan di grup ini. Lanjutkan?")) return;
        syncMutation.mutate({ periode, groupShiftId: selectedGroup });
    };

    const changeMonth = (offset: number) => {
        const next = new Date(selectedDate);
        next.setMonth(next.getMonth() + offset);
        setSelectedDate(next);
    };

    // Render logic
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-indigo-500" />
                        Master Jadwal Shift (Matrix)
                    </h1>
                    <p className="text-muted-foreground">
                        Kelola pola shift bulanan untuk setiap grup kerja.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-white dark:bg-slate-950 border rounded-md p-1 shadow-sm">
                        <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="px-3 font-semibold min-w-[140px] text-center">
                            {format(selectedDate, "MMMM yyyy", { locale: id })}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Pilih Grup" />
                        </SelectTrigger>
                        <SelectContent>
                            {groups?.map(g => (
                                <SelectItem key={g.id} value={g.id}>
                                    {g.groupName} ({g.groupShift})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={handleGenerate} disabled={generateMutation.isPending}>
                        <RefreshCw className={cn("mr-2 h-4 w-4", generateMutation.isPending && "animate-spin")} />
                        Auto-Generate
                    </Button>

                    <Button onClick={handleSave} disabled={saveMutation.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Matrix
                    </Button>

                    <Button
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800"
                        onClick={handleSync}
                        disabled={syncMutation.isPending}
                    >
                        <RefreshCw className={cn("mr-2 h-4 w-4", syncMutation.isPending && "animate-spin")} />
                        Sync Karyawan
                    </Button>
                </div>
            </div>

            {/* Matrix Grid */}
            <Card className="shadow-lg border-none overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Matriks Jadwal: {groups?.find(g => g.id === selectedGroup)?.groupName || "..."}</CardTitle>
                            <CardDescription>Tentukan kode shift untuk masing-masing tanggal.</CardDescription>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1">
                                <span className="h-3 w-3 rounded-full bg-indigo-500"></span> Kerja
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="h-3 w-3 rounded-full bg-slate-300"></span> Off
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-transparent">
                                <TableHead className="w-[100px] border-r font-bold text-center">MINGGU</TableHead>
                                {dayNumbers.map(d => {
                                    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d);
                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                    return (
                                        <TableHead
                                            key={d}
                                            className={cn(
                                                "min-w-[60px] text-center p-2 border-r last:border-r-0",
                                                isWeekend && "bg-red-50/50 dark:bg-red-950/20 text-red-600 underline font-black"
                                            )}
                                        >
                                            <div className="text-[10px] uppercase opacity-50">{format(date, "EEE")}</div>
                                            <div className="text-sm font-bold">{d}</div>
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="hover:bg-transparent">
                                <TableCell className="font-bold text-center border-r bg-slate-50/30">SHIFT</TableCell>
                                {dayNumbers.map(d => {
                                    const dayKey = `shift${d.toString().padStart(2, '0')}`;
                                    const val = matrixData[dayKey] || "0";
                                    const isOff = val === "0" || val === "null" || val === "OFF";

                                    return (
                                        <TableCell key={d} className={cn("p-1 border-r last:border-r-0 text-center", isOff && "bg-slate-50/30")}>
                                            <select
                                                value={val}
                                                onChange={(e) => handleCellChange(dayKey, e.target.value)}
                                                className={cn(
                                                    "w-full h-10 rounded-md border-none bg-transparent text-center font-bold focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer",
                                                    isOff ? "text-slate-400" : "text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20"
                                                )}
                                            >
                                                <option value="0">OFF</option>
                                                {shiftTypes?.map(st => (
                                                    <option key={st.id} value={st.kdJam}>{st.kdJam}</option>
                                                ))}
                                            </select>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1">
                            <Users className="h-4 w-4" /> Karyawan Terdaftar
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold">500+</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Total karyawan aktif yang akan menerima sinkronisasi jadwal ini.</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Status Sinkron
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold">Siap</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Matrix bulan ini valid dan siap dikirim ke database kehadiran.</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" /> Perhatian
                        </CardDescription>
                        <CardTitle className="text-lg font-bold">Sync Dibutuhkan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground italic text-amber-600">Klik tombol "Sync Karyawan" setelah melakukan perubahan pada matrix.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
