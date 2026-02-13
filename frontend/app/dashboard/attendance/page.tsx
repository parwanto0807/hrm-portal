"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { api } from '@/lib/api';
import {
    Search,
    RotateCcw,
    Clock,
    Home
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import HeaderCard from '@/components/ui/header-card';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Attendance Components
import { StatsCards } from '@/components/attendance/StatsCards';
import { DepartmentFilter } from '@/components/attendance/Filters/DepartmentFilter';
import { SectionFilter } from '@/components/attendance/Filters/SectionFilter';
import { PositionFilter } from '@/components/attendance/Filters/PositionFilter';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { AttendanceEditDialog } from '@/components/attendance/AttendanceEditDialog';
import { DateRangeSelect } from '@/components/attendance/Filters/DateRangeSelect';
import { AttLogSheet } from '@/components/attendance/AttLogSheet';

export default function AttendanceDashboardPage() {
    const { getUser } = useAuth();
    const user = getUser();
    const isEmployee = user?.role?.toLowerCase() === 'employee';

    // --- DEFAULT DATES (Last 7 Days) ---
    const today = new Date();
    const defaultStart = format(subDays(today, 7), 'yyyy-MM-dd');
    const defaultEnd = format(today, 'yyyy-MM-dd');

    // --- STATE ---
    const [department, setDepartment] = useState('all');
    const [section, setSection] = useState('all');
    const [position, setPosition] = useState('all');
    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [dateRangeKey, setDateRangeKey] = useState('7-days');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Edit Dialog State
    const [editOpen, setEditOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    // Raw Log Sheet State
    const [logOpen, setLogOpen] = useState(false);
    const [viewRecord, setViewRecord] = useState<any>(null);

    // --- SEARCH DEBOUNCE ---
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // --- FETCH DATA ---
    const { data: attendanceData, isLoading: isTableLoading } = useQuery({
        queryKey: ['attendance', page, limit, department, section, position, startDate, endDate, debouncedSearch],
        queryFn: async () => {
            const params = {
                page,
                limit,
                kdDept: department !== 'all' ? department : undefined,
                kdSeksie: section !== 'all' ? section : undefined,
                kdJab: position !== 'all' ? position : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                search: debouncedSearch || undefined
            };
            const { data } = await api.get('/absent', { params });
            return data;
        }
    });

    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ['attendance-stats', department, section, position, startDate, endDate],
        queryFn: async () => {
            const params = {
                kdDept: department !== 'all' ? department : undefined,
                kdSeksie: section !== 'all' ? section : undefined,
                kdJab: position !== 'all' ? position : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            };
            const { data } = await api.get('/absent/stats', { params });
            return data.stats;
        }
    });

    const { data: machineData } = useQuery({
        queryKey: ['machine-status'],
        queryFn: async () => {
            const { data } = await api.get('/mysql/status/machine');
            return data;
        },
        refetchInterval: 30000, // Check every 30s
    });

    const { data: holidays } = useQuery({
        queryKey: ['holidays-list', startDate],
        queryFn: async () => {
            // Default to current year or extraction from start date
            let year = new Date().getFullYear();
            if (startDate) {
                year = new Date(startDate).getFullYear();
            }
            const { data } = await api.get(`/holidays?year=${year}`);
            return data.data || [];
        }
    });

    // --- HANDLERS ---
    const handleDeptChange = (val: string) => {
        setDepartment(val);
        setSection('all'); // Reset cascade
        setPosition('all');
        setPage(1);
    };

    const handleSectionChange = (val: string) => {
        setSection(val);
        setPosition('all');
        setPage(1);
    };

    const handleReset = () => {
        setDepartment('all');
        setSection('all');
        setPosition('all');
        setStartDate(defaultStart);
        setEndDate(defaultEnd);
        setDateRangeKey('7-days');
        setSearch('');
        setPage(1);
    };

    const handleDateRangeChange = (start: string, end: string, key: string) => {
        setStartDate(start);
        setEndDate(end);
        setDateRangeKey(key);
        setPage(1);
    };

    const handleEdit = (record: any) => {
        setSelectedRecord(record);
        setEditOpen(true);
    };

    const handleViewLogs = (record: any) => {
        setViewRecord(record);
        setLogOpen(true);
    };

    return (
        <div className={cn(
            "flex flex-col gap-3 md:gap-6 pb-24",
            "p-2 md:p-6"
        )}>
            {/* Breadcrumb Section */}
            <div className="px-2 md:px-0">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard" className="flex items-center gap-1">
                                    <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <Home className="h-3 w-3 mr-1" />
                                        Beranda
                                    </Badge>
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white border-transparent">
                                    Kehadiran
                                </Badge>
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Header Section - Edge to edge on mobile */}
            <HeaderCard
                title="Data Kehadiran"
                description={isEmployee ? "Default 7 Hari kebelakang. Lihat riwayat kehadiran Anda." : "Default 7 Hari kebelakang. Pantau dan kelola data kehadiran karyawan."}
                icon={<Clock className="h-6 w-6 text-white" />}
                gradientFrom="from-blue-600"
                gradientTo="to-indigo-600"
                patternText="PT. Grafindo Mitrasemesta"
                className="rounded-xl md:rounded-2xl"
            />

            {/* Stats Cards Section */}
            <div className="px-[2px] md:px-0 mx-[2px] md:mx-0">
                <StatsCards
                    stats={statsData}
                    isLoading={isStatsLoading}
                    machineStatus={machineData}
                    isEmployee={isEmployee}
                />
            </div>

            {/* Filters Section */}
            <Card className="border-slate-200 shadow-sm overflow-visible rounded-xl md:rounded-xl">
                <CardContent className="p-4">
                    <Accordion type="single" collapsible defaultValue="" className="w-full">
                        <AccordionItem value="filters" className="border-none">
                            <AccordionTrigger className="hover:no-underline py-2 md:py-3">
                                <div className="flex items-center gap-2">
                                    <Search className="h-4 w-4 text-slate-600" />
                                    <span className="text-sm font-semibold text-slate-700">Filter Kehadiran</span>
                                    <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0">
                                        {[department !== 'all', section !== 'all', position !== 'all', startDate, endDate, !isEmployee && search].filter(Boolean).length} aktif
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4">
                                <div className="flex flex-col gap-4">
                                    {/* ROW 1: Filters, Dates, Reset */}
                                    <div className={cn(
                                        "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end",
                                        isEmployee ? "lg:grid-cols-4" : ""
                                    )}>
                                        {/* Org Filters - Hidden for Employees */}
                                        {!isEmployee && (
                                            <>
                                                <div className="space-y-1.5 container-filter">
                                                    <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 px-1">
                                                        Dept
                                                        {department !== 'all' && <Badge className="h-4 px-1 bg-emerald-500 text-[8px]">Aktif</Badge>}
                                                    </label>
                                                    <DepartmentFilter value={department} onValueChange={handleDeptChange} />
                                                </div>
                                                <div className="space-y-1.5 container-filter">
                                                    <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 px-1">
                                                        Bagian
                                                        {section !== 'all' && <Badge className="h-4 px-1 bg-emerald-500 text-[8px]">Aktif</Badge>}
                                                    </label>
                                                    <SectionFilter kdDept={department} value={section} onValueChange={handleSectionChange} />
                                                </div>
                                                <div className="space-y-1.5 container-filter">
                                                    <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 px-1">
                                                        Jabatan
                                                        {position !== 'all' && <Badge className="h-4 px-1 bg-emerald-500 text-[8px]">Aktif</Badge>}
                                                    </label>
                                                    <PositionFilter kdSeksie={section} value={position} onValueChange={setPosition} />
                                                </div>
                                            </>
                                        )}

                                        {/* Date Range Predefined */}
                                        <div className="space-y-1.5 container-filter">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 px-1">Rentang Waktu</label>
                                            <DateRangeSelect
                                                value={dateRangeKey}
                                                onRangeChange={handleDateRangeChange}
                                            />
                                        </div>

                                        {/* Date Filters */}
                                        <div className="space-y-1.5 container-filter">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 px-1">
                                                Dari
                                                {startDate && <Badge className="h-4 px-1 bg-emerald-500 text-[8px]">ON</Badge>}
                                            </label>
                                            <Input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => {
                                                    setStartDate(e.target.value);
                                                    setDateRangeKey('custom');
                                                }}
                                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-750 transition-all h-10 font-medium px-2 text-xs w-full"
                                            />
                                        </div>
                                        <div className="space-y-1.5 container-filter">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 px-1">
                                                Sampai
                                                {endDate && <Badge className="h-4 px-1 bg-emerald-500 text-[8px]">ON</Badge>}
                                            </label>
                                            <Input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => {
                                                    setEndDate(e.target.value);
                                                    setDateRangeKey('custom');
                                                }}
                                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-750 transition-all h-10 font-medium px-2 text-xs w-full"
                                            />
                                        </div>

                                        {/* Reset */}
                                        <div className="w-full">
                                            <Button
                                                variant="outline"
                                                onClick={handleReset}
                                                className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 px-4 h-10 font-bold"
                                            >
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Atur Ulang
                                            </Button>
                                        </div>
                                    </div>

                                    {!isEmployee && (
                                        <div className="w-full md:w-1/2">
                                            <div className="space-y-1.5 container-filter">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 px-1">Cari</label>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Nama atau ID..."
                                                        className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-750 transition-all text-xs w-full"
                                                        value={search}
                                                        onChange={(e) => setSearch(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {/* Table Section */}
            <div className={cn("space-y-4", isEmployee && "px-0")}>
                <div className="flex items-center justify-between px-[2px] md:px-0">
                    <h3 className="text-base md:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        Data Kehadiran
                        <Badge variant="secondary" className="font-mono text-[10px]">
                            {attendanceData?.pagination?.total || 0}
                        </Badge>
                    </h3>
                </div>

                <AttendanceTable
                    data={attendanceData?.data || []}
                    pagination={attendanceData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                    onEdit={handleEdit}
                    onView={handleViewLogs}
                    isLoading={isTableLoading}
                    isEmployee={isEmployee}
                    holidays={holidays || []}
                />
            </div>

            {/* Edit Dialog */}
            <AttendanceEditDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                record={selectedRecord}
            />

            {/* Attendance Raw Log Sheet */}
            <AttLogSheet
                open={logOpen}
                onOpenChange={setLogOpen}
                record={viewRecord}
            />
        </div>
    );
}
