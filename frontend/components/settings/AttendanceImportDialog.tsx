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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    RefreshCcw,
    Database,
    CheckCircle2,
    XCircle,
    Loader2,
    Play,
    AlertCircle,
    History,
    Calendar
} from "lucide-react";
import { toast } from "sonner";

interface AttendanceImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface ImportStats {
    total: number;
    imported: number;
    updated: number;
    errors: number;
}

export function AttendanceImportDialog({ open, onOpenChange }: AttendanceImportDialogProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState<ImportStats | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [mysqlStatus, setMysqlStatus] = useState<"online" | "offline">("offline");
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const checkMysqlConnection = async () => {
        setIsConnecting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'}/mysql/test`);
            const data = await response.json();
            setMysqlStatus(data.success ? "online" : "offline");
        } catch (error: unknown) {
            setMysqlStatus("offline");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleCancel = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setStatus("idle");
            setProgress(0);
            toast.info("Import dibatalkan");
        }
    };

    const handleImport = async () => {
        if (mysqlStatus !== "online") {
            toast.error("MySQL Database is offline. Check configuration first.");
            return;
        }

        const controller = new AbortController();
        setAbortController(controller);
        setStatus("loading");
        setProgress(0);

        // Simulate progress updates
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev;
                return prev + Math.random() * 5;
            });
        }, 800);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'}/mysql/import/attendance`, {
                method: 'POST',
                signal: controller.signal
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
                setProgress(100);
                setStatus("success");
                toast.success("Import Absensi Berhasil!");
            } else {
                throw new Error(data.message);
            }
        } catch (error: unknown) {
            clearInterval(progressInterval);

            const err = error as Error;
            if (err.name === 'AbortError') {
                return;
            }

            setStatus("error");
            setProgress(0);
            toast.error(`Gagal import: ${err.message}`);
        } finally {
            setAbortController(null);
        }
    };

    useEffect(() => {
        if (open) {
            checkMysqlConnection();
            setStatus("idle");
            setProgress(0);
            setStats(null);
            setAbortController(null);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-xl"
                onInteractOutside={(e) => {
                    if (status === "loading") {
                        e.preventDefault();
                    }
                }}
                onEscapeKeyDown={(e) => {
                    if (status === "loading") {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle>Workflow: Import Attendance Log</DialogTitle>
                            <DialogDescription>
                                Migrasi data absensi harian dari MySQL ke Postgres (Limit 6 Bulan Terakhir).
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Database Status */}
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <Database className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="text-sm font-medium">Source: MySQL Legacy</p>
                                <p className="text-xs text-muted-foreground">Local/Remote Connection</p>
                            </div>
                        </div>
                        <Badge variant={mysqlStatus === "online" ? "outline" : "destructive"} className={mysqlStatus === "online" ? "bg-emerald-500 text-white border-transparent" : ""}>
                            {isConnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : mysqlStatus.toUpperCase()}
                        </Badge>
                    </div>

                    {/* Warning Section */}
                    {status === "idle" && (
                        <div className="space-y-4">
                            <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg flex gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                                <div className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">
                                    <p className="font-semibold mb-1">Informasi Import Absensi:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Data yang diimport dibatasi hanya <strong>6 bulan terakhir</strong> untuk optimalisasi performa.</li>
                                        <li>Pastikan data <strong>Karyawan</strong> sudah diimport terlebih dahulu.</li>
                                        <li>Data yang sudah ada (berdasarkan Empl ID & Tanggal) akan di-update (Upsert).</li>
                                    </ul>
                                </div>
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleImport} disabled={mysqlStatus !== "online"}>
                                <Play className="h-4 w-4 mr-2" /> Mulai Import Absensi
                            </Button>
                        </div>
                    )}

                    {/* Progress Section */}
                    {status === "loading" && (
                        <div className="text-center space-y-4 py-8">
                            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
                            <div className="space-y-2">
                                <p className="font-medium">Sedang memproses data absensi...</p>
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">Mengecek data 6 bulan terakhir...</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="mt-4"
                            >
                                Batalkan Import
                            </Button>
                        </div>
                    )}

                    {/* Success Section */}
                    {status === "success" && stats && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center py-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2" />
                                <h3 className="font-bold text-emerald-900 dark:text-emerald-400">Import Berhasil</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 border rounded-lg bg-white dark:bg-slate-900">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Ditemukan</p>
                                    <p className="text-lg font-bold">{stats.total}</p>
                                </div>
                                <div className="p-3 border rounded-lg bg-white dark:bg-slate-900">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Baru</p>
                                    <p className="text-lg font-bold text-emerald-600">{stats.imported}</p>
                                </div>
                                <div className="p-3 border rounded-lg bg-white dark:bg-slate-900">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Diupdate</p>
                                    <p className="text-lg font-bold text-blue-600">{stats.updated}</p>
                                </div>
                                <div className="p-3 border rounded-lg bg-white dark:bg-slate-900">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Error</p>
                                    <p className="text-lg font-bold text-destructive">{stats.errors}</p>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full" onClick={() => setStatus("idle")}>
                                <History className="h-4 w-4 mr-2" /> Import Lagi
                            </Button>
                        </div>
                    )}

                    {/* Error Section */}
                    {status === "error" && (
                        <div className="text-center space-y-4 py-8">
                            <XCircle className="h-12 w-12 text-destructive mx-auto" />
                            <div className="space-y-1">
                                <p className="font-bold text-destructive">Terjadi Kesalahan</p>
                                <p className="text-sm text-muted-foreground">Silakan periksa koneksi database atau log server.</p>
                            </div>
                            <Button variant="outline" onClick={() => setStatus("idle")}>Coba Lagi</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
