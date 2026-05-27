"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SkalaUpah } from '@/types/payroll';
import HeaderCard from '@/components/ui/header-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    ScaleIcon, Home, Settings, Plus, Save, Loader2,
    Trash2, Info, ChevronDown, ChevronUp, Building2,
    TrendingUp, AlertTriangle, Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const fmt = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);

const defaultForm = {
    kdCmpy: '',
    tahun: new Date().getFullYear(),
    kdJab: '',
    nmJab: '',
    golongan: '',
    upahMin: 0,
    upahMaks: 0,
    umk: 5067381,
    validDate: new Date().toISOString().split('T')[0],
    isActive: true,
};

// UMK reference 2024 (can be extended)
const UMK_REFS = [
    { kota: 'Kab. Bekasi', umk: 5901734, tahun: 2025 },
    { kota: 'Kota Bekasi', umk: 5690752, tahun: 2025 },
    { kota: 'Kab. Karawang', umk: 6713000, tahun: 2025 },
    { kota: 'Kota Depok', umk: 5195721, tahun: 2025 },
    { kota: 'Kab. Bogor', umk: 4877211, tahun: 2025 },
    { kota: 'Kota Tangerang', umk: 5339430, tahun: 2025 },
    { kota: 'Jakarta', umk: 5396761, tahun: 2025 },
    { kota: 'UMP Jawa Barat', umk: 2191232, tahun: 2025 },
];

export default function SkalaUpahPage() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ ...defaultForm });
    const [editId, setEditId] = useState<string | null>(null);
    const [filterTahun, setFilterTahun] = useState(String(new Date().getFullYear()));
    const [showUmkRef, setShowUmkRef] = useState(false);

    const { data: skalaUpah, isLoading } = useQuery({
        queryKey: ['skalaUpah', filterTahun],
        queryFn: async () => {
            const res = await api.get(`/payroll/config/skala-upah?tahun=${filterTahun}`);
            return (res.data?.data || res.data || []) as SkalaUpah[];
        }
    });

    const { data: positions } = useQuery({
        queryKey: ['positions'],
        queryFn: async () => {
            const res = await api.get('/positions');
            return (res.data?.data || res.data || []) as { kdJab: string; nmJab: string }[];
        }
    });

    const { data: companies } = useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const res = await api.get('/company');
            return (res.data?.data || res.data || []) as { kodeCmpy: string; company: string }[];
        }
    });

    const saveMutation = useMutation({
        mutationFn: () => editId
            ? api.put(`/payroll/config/skala-upah/${editId}`, form)
            : api.post('/payroll/config/skala-upah', form),
        onSuccess: () => {
            toast.success(editId ? 'Skala upah diperbarui' : 'Skala upah berhasil ditambahkan');
            queryClient.invalidateQueries({ queryKey: ['skalaUpah'] });
            setShowForm(false);
            setEditId(null);
            setForm({ ...defaultForm });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menyimpan'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/payroll/config/skala-upah/${id}`),
        onSuccess: () => {
            toast.success('Skala upah dihapus');
            queryClient.invalidateQueries({ queryKey: ['skalaUpah'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menghapus'),
    });

    const handleEdit = (row: SkalaUpah) => {
        setForm({
            kdCmpy: row.kdCmpy,
            tahun: row.tahun,
            kdJab: row.kdJab || '',
            nmJab: row.nmJab || '',
            golongan: row.golongan || '',
            upahMin: row.upahMin,
            upahMaks: row.upahMaks,
            umk: row.umk,
            validDate: row.validDate.split('T')[0],
            isActive: row.isActive,
        });
        setEditId(row.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-2 md:p-6 pb-24">
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
                            <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent">
                                Skala Upah
                            </Badge>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="Skala Upah & UMK"
                description="Kelola skala upah per jabatan/golongan dan referensi UMK/UMP sesuai Permenaker No. 5 Tahun 2023."
                icon={<ScaleIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                gradientFrom="from-green-600"
                gradientTo="to-emerald-600"
                patternText="PERMENAKER 5/2023 SKALA UPAH"
                showActionArea
                actionArea={
                    <Button
                        className="bg-white text-green-700 hover:bg-green-50 text-xs h-9 font-bold"
                        onClick={() => { setEditId(null); setForm({ ...defaultForm }); setShowForm(!showForm); }}
                    >
                        {showForm ? <ChevronUp className="h-3.5 w-3.5 mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
                        {showForm ? 'Tutup Form' : 'Tambah Skala Upah'}
                    </Button>
                }
            />

            {/* Regulasi Info */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40">
                <Info className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-green-800 dark:text-green-300">
                    <p className="font-semibold mb-1">Permenaker No. 5 Tahun 2023 — Kewajiban Penyusunan Struktur Skala Upah:</p>
                    <p>Pengusaha yang mempekerjakan ≥10 pekerja <strong>wajib</strong> menyusun skala upah berbasis golongan jabatan. Pelanggaran dapat dikenai sanksi administratif.</p>
                    <p className="mt-0.5">UMK harus menjadi <strong>batas minimum</strong> — upah tidak boleh di bawah UMK setempat (UU 6/2023 Cipta Kerja).</p>
                </div>
            </div>

            {/* UMK Reference */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                    onClick={() => setShowUmkRef(!showUmkRef)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Referensi UMK/UMP 2025 (Jawa Barat & DKI)
                    </div>
                    {showUmkRef ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {showUmkRef && (
                    <div className="p-3 bg-white dark:bg-slate-900">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {UMK_REFS.map(ref => (
                                <button
                                    key={ref.kota}
                                    onClick={() => setForm(f => ({ ...f, umk: ref.umk }))}
                                    className="text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors group"
                                >
                                    <div className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-green-700 dark:group-hover:text-green-300">{ref.kota}</div>
                                    <div className="text-sm font-bold text-slate-800 dark:text-white font-mono mt-0.5">{fmt(ref.umk)}</div>
                                    <div className="text-[10px] text-slate-400">{ref.tahun}</div>
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-center">Klik untuk mengisi UMK ke form</p>
                    </div>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <div className="rounded-2xl border border-green-200 dark:border-green-900/50 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
                        <h3 className="text-white font-semibold text-sm">{editId ? 'Edit' : 'Tambah'} Skala Upah</h3>
                        <p className="text-green-100 text-xs">Tentukan range upah min-maks per jabatan/golongan dan UMK acuan</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {/* Kode Perusahaan */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Perusahaan</label>
                                <select
                                    value={form.kdCmpy}
                                    onChange={e => setForm(f => ({ ...f, kdCmpy: e.target.value }))}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">-- Pilih --</option>
                                    {companies?.map(c => (
                                        <option key={c.kodeCmpy} value={c.kodeCmpy}>{c.company} ({c.kodeCmpy})</option>
                                    ))}
                                </select>
                            </div>
                            {/* Tahun */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Tahun</label>
                                <input type="number" min="2020" max="2030" value={form.tahun}
                                    onChange={e => setForm(f => ({ ...f, tahun: parseInt(e.target.value) || 2025 }))}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            {/* Berlaku Mulai */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Berlaku Mulai</label>
                                <input type="date" value={form.validDate}
                                    onChange={e => setForm(f => ({ ...f, validDate: e.target.value }))}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            {/* Jabatan */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Jabatan (Opsional)</label>
                                <select
                                    value={form.kdJab}
                                    onChange={e => {
                                        const pos = positions?.find(p => p.kdJab === e.target.value);
                                        setForm(f => ({ ...f, kdJab: e.target.value, nmJab: pos?.nmJab || '' }));
                                    }}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Semua Jabatan (UMK Umum)</option>
                                    {positions?.map(p => (
                                        <option key={p.kdJab} value={p.kdJab}>{p.nmJab}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Golongan */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Golongan (Opsional)</label>
                                <input type="text" placeholder="Mis: A, I, Senior..." value={form.golongan}
                                    onChange={e => setForm(f => ({ ...f, golongan: e.target.value }))}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            {/* UMK */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    UMK / Upah Minimum (Rp)
                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                </label>
                                <input type="number" value={form.umk}
                                    onChange={e => setForm(f => ({ ...f, umk: parseInt(e.target.value) || 0 }))}
                                    className="w-full h-9 px-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <p className="text-[10px] text-amber-600">Harus = UMK daerah tempat kerja berlaku</p>
                            </div>
                            {/* Upah Min */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Upah Minimum (Rp)</label>
                                <input type="number" value={form.upahMin}
                                    onChange={e => setForm(f => ({ ...f, upahMin: parseInt(e.target.value) || 0 }))}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                {form.upahMin > 0 && form.upahMin < form.umk && (
                                    <p className="text-[10px] text-red-500">⚠ Di bawah UMK!</p>
                                )}
                            </div>
                            {/* Upah Maks */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Upah Maksimum (Rp)</label>
                                <input type="number" value={form.upahMaks}
                                    onChange={e => setForm(f => ({ ...f, upahMaks: parseInt(e.target.value) || 0 }))}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }} className="h-9 text-xs">Batal</Button>
                            <Button
                                onClick={() => saveMutation.mutate()}
                                disabled={saveMutation.isPending || !form.kdCmpy || form.umk === 0}
                                className="bg-green-600 hover:bg-green-700 text-white h-9 text-xs"
                            >
                                {saveMutation.isPending
                                    ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Menyimpan...</>
                                    : <><Save className="h-3.5 w-3.5 mr-1.5" />Simpan</>
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Tahun */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500">Tahun:</span>
                {['2023', '2024', '2025', '2026'].map(y => (
                    <button
                        key={y}
                        onClick={() => setFilterTahun(y)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterTahun === y
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {y}
                    </button>
                ))}
            </div>

            {/* Data List */}
            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse h-20 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                    ))}
                </div>
            ) : !skalaUpah || skalaUpah.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <ScaleIcon className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-slate-500">Belum ada skala upah untuk tahun {filterTahun}</p>
                    <p className="text-xs text-slate-400 mt-1">Klik &ldquo;Tambah Skala Upah&rdquo; untuk memulai</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {skalaUpah.map(row => (
                        <div key={row.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-slate-400" />
                                    <span className="font-semibold text-sm text-slate-800 dark:text-white">
                                        {row.company?.company || row.kdCmpy}
                                    </span>
                                    {row.nmJab && (
                                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-0 text-[10px]">
                                            {row.nmJab}
                                        </Badge>
                                    )}
                                    {row.golongan && (
                                        <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-0 text-[10px]">
                                            Gol. {row.golongan}
                                        </Badge>
                                    )}
                                    <Badge className={`border-0 text-[10px] ${row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {row.isActive ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Berlaku: {format(new Date(row.validDate), 'd MMM yyyy', { locale: localeId })}</span>
                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(row)} className="h-7 w-7 p-0 rounded-lg">
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            if (!confirm('Hapus skala upah ini?')) return;
                                            deleteMutation.mutate(row.id);
                                        }}
                                        className="h-7 w-7 p-0 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-3 grid grid-cols-3 gap-3 text-xs">
                                <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">UMK</div>
                                    <div className="font-mono font-bold text-amber-700 dark:text-amber-300 mt-0.5">{fmt(row.umk)}</div>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                                    <div className="text-[10px] text-slate-500 font-semibold">Upah Minimum</div>
                                    <div className="font-mono font-bold text-slate-700 dark:text-slate-200 mt-0.5">{fmt(row.upahMin)}</div>
                                    {row.upahMin < row.umk && row.upahMin > 0 && (
                                        <span className="text-[9px] text-red-500">⚠ Bawah UMK</span>
                                    )}
                                </div>
                                <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                                    <div className="text-[10px] text-slate-500 font-semibold">Upah Maksimum</div>
                                    <div className="font-mono font-bold text-slate-700 dark:text-slate-200 mt-0.5">{fmt(row.upahMaks)}</div>
                                </div>
                            </div>
                            {/* Visual range bar */}
                            {row.upahMin > 0 && row.upahMaks > 0 && (
                                <div className="px-3 pb-3">
                                    <div className="relative h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                                        <div
                                            className="absolute h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                                            style={{
                                                left: `${Math.min(100, (row.umk / row.upahMaks) * 100)}%`,
                                                width: `${Math.min(100 - (row.umk / row.upahMaks) * 100, (row.upahMaks - row.upahMin) / row.upahMaks * 100)}%`,
                                            }}
                                        />
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-amber-500 rounded-full"
                                            style={{ left: `${(row.umk / row.upahMaks) * 100}%` }}
                                            title="UMK"
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                                        <span>{fmt(row.upahMin)}</span>
                                        <span className="text-amber-500">UMK: {fmt(row.umk)}</span>
                                        <span>{fmt(row.upahMaks)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
