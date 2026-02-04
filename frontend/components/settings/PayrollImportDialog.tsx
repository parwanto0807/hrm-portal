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
    History
} from "lucide-react";
import { toast } from "sonner";

interface PayrollImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface ImportStat {
    total: number;
    imported: number;
    failed: number;
}

interface ImportStats {
    [key: string]: ImportStat;
}

export function PayrollImportDialog({ open, onOpenChange }: PayrollImportDialogProps) {
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

        // Simulate progress updates (since backend doesn't stream progress)
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev; // Cap at 90% until actual completion
                return prev + Math.random() * 15; // Increment randomly
            });
        }, 500);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'}/mysql/import/payroll`, {
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
                toast.success("Import Payroll Berhasil!");
            } else {
                throw new Error(data.message);
            }
        } catch (error: unknown) {
            clearInterval(progressInterval);

            const err = error as Error;
            if (err.name === 'AbortError') {
                // User cancelled, already handled in handleCancel
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
                        <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                            <RefreshCcw className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                            <DialogTitle>Workflow: Import Legacy Payroll</DialogTitle>
                            <DialogDescription>
                                Migrasi data Gaji, Potongan, Tunjangan, dan Rapel dari MySQL ke Postgres.
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

                    {/* Action Section */}
                    {status === "idle" && (
                        <div className="space-y-4">
                            <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-lg flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                                <div className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                                    <p className="font-semibold mb-1">Penting sebelum import:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Pastikan data <strong>Karyawan</strong> sudah diimport terlebih dahulu.</li>
                                        <li>Data yang sudah ada (berdasarkan Period & Empl ID) akan di-update (Upsert).</li>
                                        <li>Proses ini mungkin memakan waktu beberapa menit tergantung jumlah data.</li>
                                    </ul>
                                </div>
                            </div>
                            <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={handleImport} disabled={mysqlStatus !== "online"}>
                                <Play className="h-4 w-4 mr-2" /> Mulai Eksekusi Import
                            </Button>
                        </div>
                    )}

                    {/* Progress Section */}
                    {status === "loading" && (
                        <div className="text-center space-y-4 py-8">
                            <Loader2 className="h-10 w-10 text-teal-600 animate-spin mx-auto" />
                            <div className="space-y-2">
                                <p className="font-medium">Sedang memproses data...</p>
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">Jangan menutup jendela ini</p>
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

                    {/* Success/Result Section */}
                    {status === "success" && stats && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center py-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2" />
                                <h3 className="font-bold text-emerald-900 dark:text-emerald-400">Import Berhasil</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(stats).map(([key, val]) => (
                                    <div key={key} className="p-3 border rounded-lg bg-white dark:bg-slate-900">
                                        <p className="text-[10px] uppercase text-muted-foreground font-bold">{key}</p>
                                        <div className="flex items-end justify-between mt-1">
                                            <span className="text-lg font-bold">{val.imported}</span>
                                            <span className="text-[10px] text-muted-foreground">/ {val.total} rows</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button variant="outline" className="w-full" onClick={() => setStatus("idle")}>
                                <History className="h-4 w-4 mr-2" /> Import Lagi
                            </Button>
                        </div>
                    )}

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
