"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    RefreshCcw,
    Edit2,
    Trash2,
    ArrowLeft,
    Database,
    GitGraph,
    Building2,
    Briefcase,
    Users2,
    ChevronRight
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api } from "@/lib/api";
import Link from "next/link";
import HeaderCard from "@/components/ui/header-card";
import { DivisionDialog, DepartmentDialog, SectionDialog } from "@/components/settings/master/OrgStructureDialogs";
import { Division, Department, Section } from "@/types/master";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function OrgStructurePage() {
    const [activeTab, setActiveTab] = useState("divisions");
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isImporting, setIsImporting] = useState(false);

    // Dialog states
    const [diagOpen, setDiagOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<Division | Department | Section | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resDiv, resDept, resSec] = await Promise.all([
                api.get(`/org/divisions`),
                api.get(`/org/departments`),
                api.get(`/org/sections`)
            ]);
            if (resDiv.data.success) setDivisions(resDiv.data.data);
            if (resDept.data.success) setDepartments(resDept.data.data);
            if (resSec.data.success) setSections(resSec.data.data);
        } catch (_error) {
            toast.error("Gagal mengambil data struktur organisasi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImport = async () => {
        setIsImporting(true);
        try {
            const response = await api.post(`/mysql/import/org-structure`);
            if (response.data.success) {
                const { stats } = response.data;
                toast.success(`Import selesai: ${stats.divisions.imported} Bagian, ${stats.departments.imported} Dept, ${stats.sections.imported} Seksie`);
                fetchData();
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Gagal mengimport data");
        } finally {
            setIsImporting(false);
        }
    };

    const handleDelete = async (type: string, code: string) => {
        if (!confirm(`Hapus ${type} ini?`)) return;
        try {
            let endpoint = "";
            if (type === "Bagian") endpoint = "divisions";
            else if (type === "Departemen") endpoint = "departments";
            else endpoint = "sections";

            await api.delete(`/org/${endpoint}/${code}`);
            toast.success(`${type} berhasil dihapus`);
            fetchData();
        } catch (_error: unknown) {
            toast.error(`Gagal menghapus ${type}`);
        }
    };

    const filteredDivisions = divisions.filter(d =>
        d.kdBag.toLowerCase().includes(search.toLowerCase()) ||
        d.nmBag.toLowerCase().includes(search.toLowerCase())
    );

    const filteredDepartments = departments.filter(d =>
        d.kdDept.toLowerCase().includes(search.toLowerCase()) ||
        d.nmDept.toLowerCase().includes(search.toLowerCase()) ||
        d.bag?.nmBag?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredSections = sections.filter(s =>
        s.kdSeksie.toLowerCase().includes(search.toLowerCase()) ||
        s.nmSeksie.toLowerCase().includes(search.toLowerCase()) ||
        s.dept?.nmDept?.toLowerCase().includes(search.toLowerCase())
    );

    // const getTabIcon = (tab: string) => {
    //     switch (tab) {
    //         case "divisions": return <Building2 className="h-4 w-4" />;
    //         case "departments": return <Briefcase className="h-4 w-4" />;
    //         case "sections": return <Users2 className="h-4 w-4" />;
    //         default: return <Building2 className="h-4 w-4" />;
    //     }
    // };

    return (
        <div className="p-4 md:p-6 md:px-2 space-y-6 w-full max-w-full">
            <HeaderCard
                title="Struktur Organisasi"
                description="Kelola hierarki Bagian, Departemen, dan Seksie perusahaan"
                icon={<GitGraph className="h-6 w-6 sm:h-8 sm:w-8" />}
                gradientFrom="from-indigo-700"
                gradientTo="to-blue-900"
                variant="elegant"
                backgroundStyle="pattern"
                showActionArea={true}
                actionArea={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm border-white/20"
                            asChild
                        >
                            <Link href="/dashboard/settings">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        onClick={handleImport}
                                        disabled={isImporting}
                                        className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                                    >
                                        <RefreshCcw className={`h-4 w-4 ${isImporting ? 'animate-spin' : ''}`} />
                                        {isImporting ? "Syncing..." : "Sync MySQL"}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Sinkronisasi dengan database MySQL</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button
                            onClick={() => {
                                setSelectedData(null);
                                setDiagOpen(true);
                            }}
                            className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/30"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah {activeTab === "divisions" ? "Bagian" : activeTab === "departments" ? "Dept" : "Seksie"}
                        </Button>
                    </div>
                }
            />

            <Tabs defaultValue="divisions" className="w-full" onValueChange={(v) => { setActiveTab(v); setSearch(""); }}>
                <div className="flex items-center justify-between mb-6">
                    <TabsList className="bg-white dark:bg-slate-900 backdrop-blur-sm shadow-sm border border-slate-200 dark:border-slate-800">
                        <TabsTrigger value="divisions" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-50 data-[state=active]:to-blue-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200">
                            <Building2 className="h-4 w-4" /> Bagian
                        </TabsTrigger>
                        <TabsTrigger value="departments" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-50 data-[state=active]:to-teal-50 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-200">
                            <Briefcase className="h-4 w-4" /> Departemen
                        </TabsTrigger>
                        <TabsTrigger value="sections" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-50 data-[state=active]:to-orange-50 data-[state=active]:text-amber-700 data-[state=active]:border-amber-200">
                            <Users2 className="h-4 w-4" /> Seksie
                        </TabsTrigger>
                    </TabsList>
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari berdasarkan kode atau nama..."
                            className="pl-9 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-gradient-to-br from-white/50 to-white/30 dark:from-slate-900/50 dark:to-slate-900/30 backdrop-blur-sm overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-blue-500" />
                    <CardContent className="pt-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="relative">
                                    <RefreshCcw className="h-12 w-12 animate-spin text-indigo-500" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 blur-xl opacity-20 animate-pulse" />
                                </div>
                                <p className="text-slate-500 animate-pulse font-medium">Mengambil data struktur organisasi...</p>
                            </div>
                        ) : (
                            <>
                                <TabsContent value="divisions" className="mt-0">
                                    <OrgTable
                                        data={filteredDivisions}
                                        columns={["Kode Bagian", "Nama Bagian", "Keterangan"]}
                                        onEdit={(d: OrgData) => { setSelectedData(d); setDiagOpen(true); }}
                                        onDelete={(code: string) => handleDelete("Bagian", code)}
                                        codeKey="kdBag"
                                        nameKey="nmBag"
                                        icon={<Building2 className="h-4 w-4 text-indigo-500" />}
                                        colorClass="indigo"
                                    />
                                </TabsContent>
                                <TabsContent value="departments" className="mt-0">
                                    <OrgTable
                                        data={filteredDepartments}
                                        columns={["Kode Dept", "Nama Departemen", "Bagian", "Keterangan"]}
                                        onEdit={(d: OrgData) => { setSelectedData(d); setDiagOpen(true); }}
                                        onDelete={(code: string) => handleDelete("Departemen", code)}
                                        codeKey="kdDept"
                                        nameKey="nmDept"
                                        relationKey="bag"
                                        relationSubKey="nmBag"
                                        icon={<Briefcase className="h-4 w-4 text-emerald-500" />}
                                        colorClass="emerald"
                                    />
                                </TabsContent>
                                <TabsContent value="sections" className="mt-0">
                                    <OrgTable
                                        data={filteredSections}
                                        columns={["Kode Seksie", "Nama Seksie", "Departemen", "Keterangan"]}
                                        onEdit={(d: OrgData) => { setSelectedData(d); setDiagOpen(true); }}
                                        onDelete={(code: string) => handleDelete("Seksie", code)}
                                        codeKey="kdSeksie"
                                        nameKey="nmSeksie"
                                        relationKey="dept"
                                        relationSubKey="nmDept"
                                        icon={<Users2 className="h-4 w-4 text-amber-500" />}
                                        colorClass="amber"
                                    />
                                </TabsContent>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Tabs>

            {activeTab === "divisions" && (
                <DivisionDialog open={diagOpen} onOpenChange={setDiagOpen} data={selectedData as Division} onSuccess={fetchData} />
            )}
            {activeTab === "departments" && (
                <DepartmentDialog open={diagOpen} onOpenChange={setDiagOpen} data={selectedData as Department} onSuccess={fetchData} divisions={divisions} />
            )}
            {activeTab === "sections" && (
                <SectionDialog open={diagOpen} onOpenChange={setDiagOpen} data={selectedData as Section} onSuccess={fetchData} divisions={divisions} departments={departments} />
            )}
        </div>
    );
}

type OrgData = Division | Department | Section;

function OrgTable({ data, columns, onEdit, onDelete, codeKey, nameKey, relationKey, relationSubKey, icon, colorClass }: {
    data: OrgData[];
    columns: string[];
    onEdit: (data: OrgData) => void;
    onDelete: (code: string) => void;
    codeKey: string;
    nameKey: string;
    relationKey?: string;
    relationSubKey?: string;
    icon: React.ReactNode;
    colorClass: string;
}) {
    const getColorClasses = () => {
        switch (colorClass) {
            case "indigo": return {
                badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
                iconBg: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400",
                relationBadge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
                buttonEdit: "hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 dark:hover:bg-indigo-900/50",
                buttonDelete: "hover:bg-red-50 text-red-500 hover:text-red-700 dark:hover:bg-red-900/50"
            };
            case "emerald": return {
                badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
                iconBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
                relationBadge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
                buttonEdit: "hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 dark:hover:bg-emerald-900/50",
                buttonDelete: "hover:bg-red-50 text-red-500 hover:text-red-700 dark:hover:bg-red-900/50"
            };
            case "amber": return {
                badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
                iconBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
                relationBadge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
                buttonEdit: "hover:bg-amber-50 text-amber-600 hover:text-amber-700 dark:hover:bg-amber-900/50",
                buttonDelete: "hover:bg-red-50 text-red-500 hover:text-red-700 dark:hover:bg-red-900/50"
            };
            default: return {
                badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
                iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                relationBadge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
                buttonEdit: "hover:bg-slate-50 text-slate-600 hover:text-slate-700 dark:hover:bg-slate-800",
                buttonDelete: "hover:bg-red-50 text-red-500 hover:text-red-700 dark:hover:bg-red-900/50"
            };
        }
    };

    const colors = getColorClasses();

    if (data.length === 0) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-gradient-to-b from-white/50 to-transparent dark:from-slate-900/30">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                <Database className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">Tidak ada data ditemukan</p>
            <p className="text-xs text-slate-400">Coba gunakan kata kunci pencarian yang berbeda</p>
        </div>
    );

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-900">
                    <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                        <TableHead className="w-12 py-4">
                            <div className="flex items-center justify-center">
                                {icon}
                            </div>
                        </TableHead>
                        {columns.map((col: string, index: number) => (
                            <TableHead key={col} className={`py-4 ${index === 0 ? 'pl-0' : ''}`}>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{col}</span>
                            </TableHead>
                        ))}
                        <TableHead className="text-right py-4 pr-6">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Aksi</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item: Division | Department | Section, index: number) => {
                        const record = item as unknown as Record<string, unknown>;
                        return (
                            <TableRow
                                key={record[codeKey] as string}
                                className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-200 ${index !== data.length - 1 ? 'border-slate-100 dark:border-slate-800' : ''
                                    }`}
                            >
                                <TableCell className="py-4">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${colors.iconBg}`}>
                                        {icon}
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 pl-0">
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant="outline"
                                            className={`font-mono font-bold tracking-wide px-3 py-1.5 ${colors.badge}`}
                                        >
                                            {String(record[codeKey])}
                                        </Badge>
                                        <ChevronRight className="h-4 w-4 text-slate-400" />
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 pl-0">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {String(record[nameKey])}
                                        </span>
                                        {item.keterangan && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                                {item.keterangan}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                {relationKey && relationSubKey && (
                                    <TableCell className="py-4">
                                        {(record[relationKey as string] as Record<string, unknown> | undefined)?.[relationSubKey as string] ? (
                                            <Badge
                                                variant="secondary"
                                                className={`px-3 py-1.5 font-medium ${colors.relationBadge}`}
                                            >
                                                {String((record[relationKey as string] as Record<string, unknown> | undefined)?.[relationSubKey as string])}
                                            </Badge>
                                        ) : (
                                            <span className="text-slate-400 italic text-sm">-</span>
                                        )}
                                    </TableCell>
                                )}
                                <TableCell className="py-4 max-w-[250px]">
                                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                                        {item.keterangan || (
                                            <span className="text-slate-400 italic">Tidak ada keterangan</span>
                                        )}
                                    </p>
                                </TableCell>
                                <TableCell className="py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onEdit(item)}
                                                        className={`h-9 w-9 rounded-lg transition-all hover:scale-105 ${colors.buttonEdit}`}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Edit data</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onDelete(record[codeKey] as string)}
                                                        className={`h-9 w-9 rounded-lg transition-all hover:scale-105 ${colors.buttonDelete}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Hapus data</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {/* Table Footer */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            Menampilkan <span className="font-semibold">{data.length}</span> data
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-white dark:bg-slate-900">
                            <Database className="h-3 w-3 mr-2" />
                            Database Active
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
}