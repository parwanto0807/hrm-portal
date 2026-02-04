"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
    Database,
    Search,
    RefreshCw,
    Table as TableIcon,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    CheckCircle2,
    XCircle,
    Loader2,
    Settings2,
    Save
} from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MysqlOldDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MysqlOldDialog({ open, onOpenChange }: MysqlOldDialogProps) {
    const [status, setStatus] = useState<"loading" | "online" | "offline">("loading");
    const [tables, setTables] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });
    const [dataSearchQuery, setDataSearchQuery] = useState("");

    // Config State
    const [config, setConfig] = useState({
        host: "localhost",
        port: "3306",
        user: "root",
        password: "",
        database: ""
    });
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    const checkConnection = async () => {
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
        } catch (error) {
            setStatus("offline");
            console.error("Connection check failed:", error);
        }
    };

    const fetchConfig = async () => {
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
        } catch (error) {
            console.error("Failed to fetch config:", error);
        }
    };

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
        } catch (error) {
            toast.error("Gagal menyimpan konfigurasi");
        } finally {
            setIsSavingConfig(false);
        }
    };

    const fetchTables = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'}/mysql/tables`);
            const data = await response.json();
            if (data.success) {
                setTables(data.tables);
            }
        } catch (error) {
            console.error("Failed to fetch tables:", error);
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
        } catch (error) {
            toast.error("Gagal mengambil data tabel");
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchConfig();
            checkConnection();
        } else {
            setSelectedTable(null);
            setTableData([]);
        }
    }, [open]);

    const filteredTables = tables.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const filteredData = tableData.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(dataSearchQuery.toLowerCase())
        )
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <DialogTitle>Old MySQL Database</DialogTitle>
                                <DialogDescription>Explore legacy data from local MySQL</DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge
                                variant={status === "online" ? "outline" : status === "loading" ? "secondary" : "destructive"}
                                className={`gap-1.5 py-1 ${status === "online" ? "bg-emerald-500 text-white hover:bg-emerald-600 border-transparent shadow-sm" : ""}`}
                            >
                                {status === "loading" ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : status === "online" ? (
                                    <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                    <XCircle className="h-3 w-3" />
                                )}
                                {status === "online" ? "Online" : status === "loading" ? "Checking..." : "Offline"}
                            </Badge>
                            <Button variant="outline" size="icon" onClick={checkConnection} disabled={status === "loading"}>
                                <RefreshCw className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="explorer" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 border-b">
                        <TabsList className="h-10 bg-transparent gap-4">
                            <TabsTrigger
                                value="explorer"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-2 pb-2 transition-all"
                            >
                                <TableIcon className="h-4 w-4 mr-2" />
                                Data Explorer
                            </TabsTrigger>
                            <TabsTrigger
                                value="settings"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-2 pb-2 transition-all"
                            >
                                <Settings2 className="h-4 w-4 mr-2" />
                                Connection Settings
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="explorer" className="flex-1 m-0 flex overflow-hidden">
                        <div className="w-64 border-r flex flex-col bg-slate-50/50 dark:bg-slate-900/20">
                            <div className="p-4 border-b">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari tabel..."
                                        className="pl-8 h-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-2 space-y-1">
                                    {filteredTables.map((tableName) => (
                                        <button
                                            key={tableName}
                                            onClick={() => fetchTablePreview(tableName)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all ${selectedTable === tableName
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium translate-x-1"
                                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <TableIcon className="h-4 w-4 shrink-0 opacity-70" />
                                                <span className="truncate">{tableName}</span>
                                            </div>
                                            <ChevronRight className={`h-3 w-3 shrink-0 transition-transform ${selectedTable === tableName ? "rotate-90" : "opacity-0"}`} />
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950">
                            {!selectedTable ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                                    <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-full mb-4">
                                        <TableIcon className="h-8 w-8 opacity-20" />
                                    </div>
                                    <h3 className="font-medium text-slate-900 dark:text-white">Pilih Tabel</h3>
                                    <p className="text-sm max-w-[240px] mt-1">Pilih tabel di sebelah kiri untuk melihat preview data lama.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 gap-4">
                                        <div className="flex items-center gap-2 min-w-fit">
                                            <TableIcon className="h-4 w-4 text-blue-500" />
                                            <span className="font-semibold truncate max-w-[150px]">{selectedTable}</span>
                                            <Badge variant="secondary" className="text-[10px] font-normal whitespace-nowrap">
                                                {pagination.total} Rows
                                            </Badge>
                                        </div>
                                        <div className="flex-1 max-w-sm relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                placeholder="Filter hasil..."
                                                className="h-8 pl-7 text-xs"
                                                value={dataSearchQuery}
                                                onChange={(e) => setDataSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" className="h-8" onClick={() => fetchTablePreview(selectedTable, page, pageSize)}>
                                                <RefreshCw className={`h-3 w-3 mr-2 ${isLoadingData ? "animate-spin" : ""}`} />
                                                Refresh
                                            </Button>
                                        </div>
                                    </div>
                                    <ScrollArea className="flex-1">
                                        {isLoadingData ? (
                                            <div className="p-20 flex flex-col items-center justify-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                                                <p className="text-sm text-muted-foreground">Loading data...</p>
                                            </div>
                                        ) : tableData.length > 0 ? (
                                            <div className="min-w-full">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            {Object.keys(tableData[0]).map((key) => (
                                                                <TableHead key={key} className="whitespace-nowrap uppercase text-[10px] font-bold tracking-wider">
                                                                    {key}
                                                                </TableHead>
                                                            ))}
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filteredData.map((row, i) => (
                                                            <TableRow key={i}>
                                                                {Object.values(row).map((val: any, j) => (
                                                                    <TableCell key={j} className="whitespace-nowrap text-xs py-2">
                                                                        {val === null ? <em className="text-slate-300">null</em> : String(val)}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="p-20 text-center text-muted-foreground">
                                                Tabel kosong atau tidak ada data.
                                            </div>
                                        )}
                                    </ScrollArea>

                                    {/* Pagination Footer */}
                                    <div className="p-3 border-t bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">Rows per page:</span>
                                                <select
                                                    className="h-7 text-xs border rounded bg-background px-1 outline-none"
                                                    value={pageSize}
                                                    onChange={(e) => fetchTablePreview(selectedTable, 1, parseInt(e.target.value))}
                                                >
                                                    {[10, 20, 50, 100, 500].map(size => (
                                                        <option key={size} value={size}>{size}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-medium">
                                                Page {pagination.page} of {pagination.totalPages || 1}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                disabled={page <= 1 || isLoadingData}
                                                onClick={() => fetchTablePreview(selectedTable, 1, pageSize)}
                                            >
                                                <ChevronsLeft className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                disabled={page <= 1 || isLoadingData}
                                                onClick={() => fetchTablePreview(selectedTable, page - 1, pageSize)}
                                            >
                                                <ChevronLeft className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                disabled={page >= pagination.totalPages || isLoadingData}
                                                onClick={() => fetchTablePreview(selectedTable, page + 1, pageSize)}
                                            >
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                disabled={page >= pagination.totalPages || isLoadingData}
                                                onClick={() => fetchTablePreview(selectedTable, pagination.totalPages, pageSize)}
                                            >
                                                <ChevronsRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="settings" className="flex-1 m-0 p-8 flex flex-col bg-slate-50/30 dark:bg-slate-900/10">
                        <div className="max-w-2xl mx-auto w-full space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="host">IP Address / Host</Label>
                                    <Input
                                        id="host"
                                        placeholder="localhost"
                                        value={config.host}
                                        onChange={(e) => setConfig({ ...config, host: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="port">Port</Label>
                                    <Input
                                        id="port"
                                        placeholder="3306"
                                        value={config.port}
                                        onChange={(e) => setConfig({ ...config, port: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user">Username</Label>
                                    <Input
                                        id="user"
                                        placeholder="root"
                                        value={config.user}
                                        onChange={(e) => setConfig({ ...config, user: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={config.password}
                                        onChange={(e) => setConfig({ ...config, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="database">Database Name</Label>
                                    <Input
                                        id="database"
                                        placeholder="legacy_database"
                                        value={config.database}
                                        onChange={(e) => setConfig({ ...config, database: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button className="gap-2 px-8" onClick={saveConfig} disabled={isSavingConfig}>
                                    {isSavingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Simpan & Uji Koneksi
                                </Button>
                            </div>

                            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    <strong>Note:</strong> Pengaturan ini akan disimpan ke database HRM saat ini dan digunakan untuk mengakses data lama secara read-only.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
