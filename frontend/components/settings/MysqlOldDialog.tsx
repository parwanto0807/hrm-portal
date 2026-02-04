"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Database,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    Server,
    Search,
    ChevronLeft,
    ChevronRight,
    SearchX,
    Table as TableIcon
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MysqlOldDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MysqlOldDialog({ open, onOpenChange }: MysqlOldDialogProps) {
    const [status, setStatus] = useState<"online" | "offline" | "loading">("offline");
    const [tables, setTables] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"config" | "tables" | "preview">("config");

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState<{
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    } | null>(null);

    const [config, setConfig] = useState({
        host: "localhost",
        port: "3306",
        user: "root",
        password: "",
        database: ""
    });
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    const fetchTables = React.useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'}/mysql/tables`);
            const data = await response.json();
            if (data.success) {
                setTables(data.tables);
            }
        } catch (_error) {
            console.error("Failed to fetch tables:", _error);
        }
    }, []);

    const checkConnection = React.useCallback(async () => {
        setStatus("loading");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'}/mysql/test`);
            const data = await response.json();
            if (data.success) {
                setStatus("online");
                fetchTables();
            } else {
                setStatus("offline");
            }
        } catch (_error) {
            setStatus("offline");
            console.error("Connection check failed:", _error);
        }
    }, [fetchTables]);

    const fetchConfig = React.useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'}/mysql/config`);
            const data = await response.json();
            if (data.success && data.config) {
                setConfig({
                    host: data.config.host || "localhost",
                    port: data.config.port?.toString() || "3306",
                    user: data.config.user || "root",
                    password: data.config.password || "",
                    database: data.config.database || ""
                });
            }
        } catch (_error) {
            console.error("Failed to fetch config:", _error);
        }
    }, []);

    const saveConfig = async () => {
        setIsSavingConfig(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'}/mysql/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Konfigurasi disimpan");
                checkConnection();
            } else {
                toast.error(data.message || "Gagal menyimpan konfigurasi");
            }
        } catch (_error) {
            toast.error("Gagal menyimpan konfigurasi");
        } finally {
            setIsSavingConfig(false);
        }
    };

    const fetchTablePreview = async (tableName: string, p: number = 1, l: number = 10) => {
        setIsLoadingData(true);
        setSelectedTable(tableName);
        setPage(p);
        setPageSize(l);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'}/mysql/tables/${tableName}?page=${p}&limit=${l}`);
            const data = await response.json();
            if (data.success) {
                setTableData(data.data);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            }
        } catch (_error) {
            toast.error("Gagal mengambil data tabel");
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchConfig();
            checkConnection();
        }
    }, [open, fetchConfig, checkConnection]);

    const filteredTables = tables.filter(t =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent uppercase tracking-tight flex items-center gap-3">
                                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                MySQL Legacy Manager
                            </DialogTitle>
                            <DialogDescription className="mt-1 font-medium text-slate-500 dark:text-slate-400">
                                Kelola koneksi dan lihat data dari database lama (Axon HR v1)
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-1.5 px-3 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Status:</span>
                            {status === "loading" ? (
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 animate-pulse border-none h-5 px-2">
                                    <RefreshCcw className="h-3 w-3 mr-1 animate-spin" /> Checking
                                </Badge>
                            ) : status === "online" ? (
                                <Badge className="bg-emerald-50 text-emerald-600 border-none h-5 px-2 font-black tracking-wider text-[10px]">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> ONLINE
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="bg-rose-50 text-rose-600 border-none h-5 px-2 font-black tracking-wider text-[10px]">
                                    <XCircle className="h-3 w-3 mr-1" /> OFFLINE
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-6 border-b dark:border-slate-800">
                        <button
                            onClick={() => setActiveTab("config")}
                            className={cn(
                                "px-4 py-2 text-xs font-black uppercase tracking-widest transition-all relative",
                                activeTab === "config" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            Konfigurasi
                            {activeTab === "config" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("tables")}
                            className={cn(
                                "px-4 py-2 text-xs font-black uppercase tracking-widest transition-all relative",
                                activeTab === "tables" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            Daftar Tabel
                            {activeTab === "tables" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                        </button>
                        {selectedTable && (
                            <button
                                onClick={() => setActiveTab("preview")}
                                className={cn(
                                    "px-4 py-2 text-xs font-black uppercase tracking-widest transition-all relative flex items-center gap-2",
                                    activeTab === "preview" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                )}
                            >
                                Preview: {selectedTable}
                                {activeTab === "preview" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                            </button>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden p-6 bg-slate-50/50 dark:bg-slate-900/30">
                    <ScrollArea className="h-full pr-4">
                        {activeTab === "config" && (
                            <div className="space-y-6 max-w-xl mx-auto py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Host</Label>
                                        <Input
                                            value={config.host}
                                            onChange={(e) => setConfig({ ...config, host: e.target.value })}
                                            className="bg-white dark:bg-slate-950 font-bold border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="localhost"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Port</Label>
                                        <Input
                                            value={config.port}
                                            onChange={(e) => setConfig({ ...config, port: e.target.value })}
                                            className="bg-white dark:bg-slate-950 font-bold border-slate-200 dark:border-slate-800"
                                            placeholder="3306"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Database Name</Label>
                                    <Input
                                        value={config.database}
                                        onChange={(e) => setConfig({ ...config, database: e.target.value })}
                                        className="bg-white dark:bg-slate-950 font-bold border-slate-200 dark:border-slate-800"
                                        placeholder="axon_v1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">User</Label>
                                        <Input
                                            value={config.user}
                                            onChange={(e) => setConfig({ ...config, user: e.target.value })}
                                            className="bg-white dark:bg-slate-950 font-bold border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</Label>
                                        <Input
                                            type="password"
                                            value={config.password}
                                            onChange={(e) => setConfig({ ...config, password: e.target.value })}
                                            className="bg-white dark:bg-slate-950 font-bold border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={checkConnection}
                                        disabled={status === "loading"}
                                        className="font-black tracking-widest uppercase text-[10px] hover:bg-slate-100"
                                    >
                                        <RefreshCcw className={cn("h-3 w-3 mr-2", status === "loading" && "animate-spin")} />
                                        Test Koneksi
                                    </Button>
                                    <Button
                                        onClick={saveConfig}
                                        disabled={isSavingConfig}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-black tracking-widest uppercase text-[10px] px-8 shadow-lg shadow-blue-500/20"
                                    >
                                        {isSavingConfig ? "Saving..." : "Simpan Config"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === "tables" && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Cari nama tabel..."
                                        className="pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {status !== "online" ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                        <XCircle className="h-12 w-12 text-rose-500/50" />
                                        <div>
                                            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Database Offline</p>
                                            <p className="text-sm text-slate-500 mt-1">Pastikan koneksi sudah online untuk melihat tabel</p>
                                        </div>
                                        <Button variant="outline" onClick={checkConnection} className="font-bold">
                                            Reload Connection
                                        </Button>
                                    </div>
                                ) : filteredTables.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                        <SearchX className="h-12 w-12 text-slate-400" />
                                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Tabel tidak ditemukan</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {filteredTables.map((table) => (
                                            <button
                                                key={table}
                                                onClick={() => {
                                                    fetchTablePreview(table);
                                                    setActiveTab("preview");
                                                }}
                                                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group text-left"
                                            >
                                                <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <TableIcon className="h-4 w-4" />
                                                </div>
                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-300 truncate">{table}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "preview" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-blue-600 text-white font-black tracking-widest text-[10px] uppercase">{selectedTable}</Badge>
                                        <p className="text-[10px] font-bold text-slate-400">{pagination?.total || 0} Records Total</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={page <= 1 || isLoadingData}
                                            onClick={() => fetchTablePreview(selectedTable!, page - 1)}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-[10px] font-black w-14 text-center">PAGE {page}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={!pagination || page >= pagination.totalPages || isLoadingData}
                                            onClick={() => fetchTablePreview(selectedTable!, page + 1)}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm relative min-h-[400px]">
                                    {isLoadingData ? (
                                        <div className="absolute inset-0 z-50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-[1px] flex items-center justify-center">
                                            <RefreshCcw className="h-8 w-8 animate-spin text-blue-500" />
                                        </div>
                                    ) : tableData.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                            <SearchX className="h-12 w-12 text-slate-300" />
                                            <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Tidak ada data</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-slate-50 dark:bg-slate-900 shadow-sm sticky top-0 z-10">
                                                    <TableRow>
                                                        {Object.keys(tableData[0]).map((key) => (
                                                            <TableHead key={key} className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[120px]">
                                                                {key}
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {tableData.map((row, idx) => (
                                                        <TableRow key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                            {Object.values(row).map((val, vIdx) => (
                                                                <TableCell key={vIdx} className="text-xs font-medium text-slate-600 dark:text-slate-300 py-3">
                                                                    {val === null ? (
                                                                        <span className="text-slate-300 text-[10px] italic">NULL</span>
                                                                    ) : typeof val === 'object' ? (
                                                                        JSON.stringify(val)
                                                                    ) : String(val)}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
