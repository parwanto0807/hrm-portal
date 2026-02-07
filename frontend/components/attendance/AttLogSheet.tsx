"use client";

import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    Clock,
    ArrowRightCircle,
    ArrowLeftCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AttLogSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record: any;
}

export const AttLogSheet = ({ open, onOpenChange, record }: AttLogSheetProps) => {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['att-logs', record?.emplId, record?.tglAbsen],
        queryFn: async () => {
            if (!record) return null;
            const { data } = await api.get('/absent/logs', {
                params: {
                    nik: record.nik || record.emplId,
                    date: record.tglAbsen
                }
            });
            return data.data;
        },
        enabled: !!open && !!record,
    });

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader className="border-b pb-4 mb-6">
                    <SheetTitle className="text-xl font-bold text-slate-900">
                        Detail Log Absensi
                    </SheetTitle>
                    <SheetDescription className="text-sm">
                        Timeline tap asli dari mesin untuk <strong>{record?.karyawan?.nama || record?.nama}</strong>
                    </SheetDescription>
                    {record && (
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">
                                {format(new Date(record.tglAbsen), 'dd MMMM yyyy', { locale: id })}
                            </Badge>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[10px]">
                                {record.emplId}
                            </Badge>
                        </div>
                    )}
                </SheetHeader>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="text-sm font-medium">Memuat history tap...</p>
                        </div>
                    ) : logs && logs.length > 0 ? (
                        logs.map((log: any, idx: number) => (
                            <div key={idx} className="relative flex items-start gap-6 group">
                                <div className={cn(
                                    "absolute left-0 mt-1 h-10 w-10 flex items-center justify-center rounded-full border-4 border-white shadow-sm transition-all group-hover:scale-110",
                                    log.cflag === 'I' ? "bg-emerald-500 text-white" :
                                        log.cflag === 'O' ? "bg-rose-500 text-white" :
                                            "bg-slate-400 text-white"
                                )}>
                                    {log.cflag === 'I' ? <ArrowRightCircle className="h-5 w-5" /> :
                                        log.cflag === 'O' ? <ArrowLeftCircle className="h-5 w-5" /> :
                                            <Clock className="h-5 w-5" />}
                                </div>
                                <div className="ml-12 pt-1">
                                    <div className="flex items-center gap-2">
                                        <time className="font-mono text-lg font-bold text-slate-900">
                                            {log.jam.replace('.', ':')}
                                        </time>
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] font-bold px-1.5 py-0",
                                            log.cflag === 'I' ? "border-emerald-200 text-emerald-700 bg-emerald-50" :
                                                log.cflag === 'O' ? "border-rose-200 text-rose-700 bg-rose-50" :
                                                    "border-slate-200 text-slate-700 bg-slate-50"
                                        )}>
                                            {log.cflag === 'I' ? 'MASUK (IN)' :
                                                log.cflag === 'O' ? 'KELUAR (OUT)' :
                                                    'LAINNYA'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Pencatatan dilakukan pada {log.jam.replace('.', ':')} WIB
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center px-6">
                            <AlertCircle className="h-12 w-12 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Tidak ada history tap ditemukan.</p>
                            <p className="text-[10px] mt-1">Data mungkin belum di-synchronize atau karyawan tidak melakukan tap pada hari ini.</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 pt-6 border-t border-dashed border-slate-200">
                    <div className="bg-slate-50 rounded-lg p-4 ring-1 ring-slate-100">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
                            Informasi Log
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                            Data di atas diambil langsung dari rekaman mesin sidik jari. Jika terdapat perbedaan dengan data di tabel utama, kemungkinan ada perubahan manual atau aturan shift yang berlaku.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
