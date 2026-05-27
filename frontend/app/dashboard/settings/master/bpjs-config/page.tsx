"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { KonfigBpjs } from '@/types/payroll';
import { Button } from '@/components/ui/button';
import HeaderCard from '@/components/ui/header-card';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    ShieldCheck,
    Save,
    Home,
    Settings,
    Loader2,
    Info,
    ChevronDown,
    ChevronUp,
    Building2,
} from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const pct = (v: number | string) => `${(Number(v) * 100).toFixed(2)}%`;

interface BpjsRateFieldProps {
    label: string;
    perush: number;
    empl?: number;
    perushKey: string;
    emplKey?: string;
    onChange: (key: string, value: number) => void;
    disabled?: boolean;
    info?: string;
}

function BpjsRateField({ label, perush, empl, perushKey, emplKey, onChange, disabled, info }: BpjsRateFieldProps) {
    return (
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 dark:text-white">{label}</span>
                {info && (
                    <div className="group relative">
                        <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                        <div className="absolute right-0 top-5 z-10 hidden group-hover:block bg-slate-800 text-white text-[10px] rounded-lg px-2 py-1.5 w-48 shadow-lg">
                            {info}
                        </div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Perusahaan</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            step="0.0001"
                            min="0"
                            max="1"
                            value={perush}
                            onChange={e => onChange(perushKey, parseFloat(e.target.value) || 0)}
                            disabled={disabled}
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <span className="text-xs text-slate-500 dark:text-slate-400 w-12 text-right shrink-0">{pct(perush)}</span>
                    </div>
                </div>
                {emplKey !== undefined && empl !== undefined && (
                    <div className="space-y-1">
                        <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Karyawan</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step="0.0001"
                                min="0"
                                max="1"
                                value={empl}
                                onChange={e => onChange(emplKey, parseFloat(e.target.value) || 0)}
                                disabled={disabled}
                                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                            />
                            <span className="text-xs text-slate-500 dark:text-slate-400 w-12 text-right shrink-0">{pct(empl)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const defaultForm = {
    kdCmpy: '',
    validDate: new Date().toISOString().split('T')[0],
    jhtPerush: 0.037,
    jhtEmpl: 0.02,
    jkkRate: 0.0024,
    jkmRate: 0.003,
    jpPerush: 0.02,
    jpEmpl: 0.01,
    jpMaksUpah: 10043950,
    jknPerush: 0.04,
    jknEmpl: 0.01,
    jknMaksUpah: 12000000,
    isActive: true,
};

export default function BpjsConfigPage() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ ...defaultForm });
    const [showForm, setShowForm] = useState(false);

    const { data: configs, isLoading } = useQuery({
        queryKey: ['konfigBpjs'],
        queryFn: async () => {
            const res = await api.get('/payroll/config/bpjs');
            return res.data.data as KonfigBpjs[];
        }
    });

    const saveMutation = useMutation({
        mutationFn: () => api.post('/payroll/config/bpjs', form),
        onSuccess: () => {
            toast.success('Konfigurasi BPJS berhasil disimpan');
            queryClient.invalidateQueries({ queryKey: ['konfigBpjs'] });
            setShowForm(false);
            setForm({ ...defaultForm });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal menyimpan konfigurasi');
        }
    });

    const handleChange = (key: string, value: number | string | boolean) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-2 md:p-6 pb-24 md:pb-6">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">
                                <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Home className="h-3 w-3 mr-1" />Dashboard
                                </Badge>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard/settings">
                                <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Settings className="h-3 w-3 mr-1" />Pengaturan
                                </Badge>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-transparent">
                                Konfigurasi BPJS
                            </Badge>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="Konfigurasi BPJS"
                description="Atur rate JHT, JKK, JKM, JP, dan JKN sesuai regulasi PP 44-45/2015 dan Perpres 75/2019."
                icon={<ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                gradientFrom="from-blue-600"
                gradientTo="to-indigo-600"
                patternText="BPJS"
                showActionArea
                actionArea={
                    <Button
                        className="bg-white text-blue-700 hover:bg-blue-50 text-xs h-9 font-bold"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? <ChevronUp className="h-3.5 w-3.5 mr-1.5" /> : <ChevronDown className="h-3.5 w-3.5 mr-1.5" />}
                        {showForm ? 'Tutup Form' : 'Tambah Konfigurasi Baru'}
                    </Button>
                }
            />

            {/* Regulasi Reference */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                    { label: 'JHT', info: 'Perusahaan 3.7% + Karyawan 2%', reg: 'PP 46/2015', color: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20' },
                    { label: 'JKK', info: 'Perusahaan 0.24%-1.74%', reg: 'PP 44/2015', color: 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20' },
                    { label: 'JKM', info: 'Perusahaan 0.3%', reg: 'PP 44/2015', color: 'border-rose-200 bg-rose-50 dark:bg-rose-950/20' },
                    { label: 'JP', info: 'Perusahaan 2% + Karyawan 1%', reg: 'PP 45/2015', color: 'border-violet-200 bg-violet-50 dark:bg-violet-950/20' },
                    { label: 'JKN', info: 'Perusahaan 4% + Karyawan 1%', reg: 'Perpres 75/2019', color: 'border-amber-200 bg-amber-50 dark:bg-amber-950/20' },
                ].map(item => (
                    <div key={item.label} className={`rounded-xl border p-2.5 text-center ${item.color}`}>
                        <div className="font-black text-slate-800 dark:text-white text-sm">{item.label}</div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5">{item.info}</div>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">{item.reg}</div>
                    </div>
                ))}
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3">
                        <h3 className="text-white font-semibold text-sm">Tambah Konfigurasi BPJS Baru</h3>
                        <p className="text-indigo-100 text-xs">Rate baru akan menjadi acuan kalkulasi payroll berikutnya</p>
                    </div>
                    <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Kode Perusahaan</label>
                                <input
                                    type="text"
                                    placeholder="cth: CMY"
                                    value={form.kdCmpy}
                                    onChange={e => handleChange('kdCmpy', e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Berlaku Mulai</label>
                                <input
                                    type="date"
                                    value={form.validDate}
                                    onChange={e => handleChange('validDate', e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* BPJS Rate Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <BpjsRateField
                                label="JHT — Jaminan Hari Tua"
                                perush={form.jhtPerush} empl={form.jhtEmpl}
                                perushKey="jhtPerush" emplKey="jhtEmpl"
                                onChange={handleChange}
                                info="PP 46/2015: Perusahaan 3.7%, Karyawan 2%"
                            />
                            <BpjsRateField
                                label="JKK — Jaminan Kecelakaan Kerja"
                                perush={form.jkkRate}
                                perushKey="jkkRate"
                                onChange={handleChange}
                                info="PP 44/2015: 0.24% - 1.74% tergantung risiko pekerjaan"
                            />
                            <BpjsRateField
                                label="JKM — Jaminan Kematian"
                                perush={form.jkmRate}
                                perushKey="jkmRate"
                                onChange={handleChange}
                                info="PP 44/2015: 0.3% ditanggung perusahaan"
                            />
                            <BpjsRateField
                                label="JP — Jaminan Pensiun"
                                perush={form.jpPerush} empl={form.jpEmpl}
                                perushKey="jpPerush" emplKey="jpEmpl"
                                onChange={handleChange}
                                info="PP 45/2015: Perusahaan 2%, Karyawan 1%. Batas atas upah JP"
                            />
                            <BpjsRateField
                                label="JKN — Jaminan Kesehatan"
                                perush={form.jknPerush} empl={form.jknEmpl}
                                perushKey="jknPerush" emplKey="jknEmpl"
                                onChange={handleChange}
                                info="Perpres 75/2019: Perusahaan 4%, Karyawan 1%"
                            />
                        </div>

                        {/* Batas Atas */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Batas Atas Upah JP (Rp)</label>
                                <input
                                    type="number"
                                    value={form.jpMaksUpah}
                                    onChange={e => handleChange('jpMaksUpah', parseInt(e.target.value) || 0)}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-[10px] text-slate-400">Default 2024: Rp 10.043.950</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Batas Atas Upah JKN (Rp)</label>
                                <input
                                    type="number"
                                    value={form.jknMaksUpah}
                                    onChange={e => handleChange('jknMaksUpah', parseInt(e.target.value) || 0)}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-[10px] text-slate-400">Default: Rp 12.000.000</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <Button variant="outline" onClick={() => setShowForm(false)} className="h-9 text-xs">Batal</Button>
                            <Button
                                onClick={() => saveMutation.mutate()}
                                disabled={saveMutation.isPending}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-xs"
                            >
                                {saveMutation.isPending
                                    ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Menyimpan...</>
                                    : <><Save className="h-3.5 w-3.5 mr-1.5" />Simpan Konfigurasi</>
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Config List */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Konfigurasi Aktif</h3>
                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="animate-pulse h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                        ))}
                    </div>
                ) : !configs || configs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <ShieldCheck className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-sm font-medium text-slate-500">Belum ada konfigurasi BPJS</p>
                        <p className="text-xs text-slate-400 mt-1">Klik &ldquo;Tambah Konfigurasi Baru&rdquo; untuk mulai</p>
                    </div>
                ) : (
                    configs.map(cfg => (
                        <div key={cfg.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-slate-400" />
                                    <span className="font-semibold text-slate-800 dark:text-white text-sm">
                                        {cfg.company?.company || cfg.kdCmpy}
                                    </span>
                                    <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-0">
                                        Aktif
                                    </Badge>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Berlaku: {format(new Date(cfg.validDate), 'd MMM yyyy', { locale: localeId })}
                                </span>
                            </div>
                            <div className="p-3 grid grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                                {[
                                    { label: 'JHT', perush: cfg.jhtPerush, empl: cfg.jhtEmpl },
                                    { label: 'JKK', perush: cfg.jkkRate },
                                    { label: 'JKM', perush: cfg.jkmRate },
                                    { label: 'JP', perush: cfg.jpPerush, empl: cfg.jpEmpl },
                                    { label: 'JKN', perush: cfg.jknPerush, empl: cfg.jknEmpl },
                                ].map(item => (
                                    <div key={item.label} className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                                        <div className="font-bold text-slate-800 dark:text-white">{item.label}</div>
                                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                                            Prsh: {pct(item.perush)}
                                        </div>
                                        {item.empl !== undefined && (
                                            <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                                                Kryw: {pct(item.empl)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
