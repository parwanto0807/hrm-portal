"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { api } from '@/lib/api';
import {
    LayoutDashboard,
    Calendar,
    RotateCcw,
    Search
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import HeaderCard from '@/components/ui/header-card';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
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
import { cn } from '@/lib/utils';

// Attendance Components
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { AttendanceEditDialog } from '@/components/attendance/AttendanceEditDialog';
import { DateRangeSelect } from '@/components/attendance/Filters/DateRangeSelect';
import { AttLogSheet } from '@/components/attendance/AttLogSheet';

export default function MyAttendancePage() {
    const { getUser } = useAuth();
    const user = getUser();
    // Assuming user object has emplId. If not, we might need to fetch it or generic 'me' endpoint
    const emplId = user?.emplId;

    // --- DEFAULT DATES (Last 30 Days) ---
    const today = new Date();
    const defaultStart = format(subDays(today, 30), 'yyyy-MM-dd');
    const defaultEnd = format(today, 'yyyy-MM-dd');

    // --- STATE ---
    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [dateRangeKey, setDateRangeKey] = useState('30-days');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Edit Dialog State (Usually employees can't edit their own, but HR Manager might?)
    const [editOpen, setEditOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    // Raw Log Sheet State
    const [logOpen, setLogOpen] = useState(false);
    const [viewRecord, setViewRecord] = useState<any>(null);

    // --- FETCH DATA ---
    const { data: attendanceData, isLoading: isTableLoading } = useQuery({
        queryKey: ['my-attendance', page, limit, startDate, endDate, emplId],
        queryFn: async () => {
            if (!emplId) return { data: [], pagination: { total: 0 } };

            const params = {
                page,
                limit,
                emplId: emplId, // Filter by current user
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            };
            const { data } = await api.get('/absent', { params });
            return data;
        },
        enabled: !!emplId
    });

    const { data: holidays } = useQuery({
        queryKey: ['holidays-list', startDate],
        queryFn: async () => {
            let year = new Date().getFullYear();
            if (startDate) {
                year = new Date(startDate).getFullYear();
            }
            const { data } = await api.get(`/holidays?year=${year}`);
            return data.data || [];
        }
    });

    // --- HANDLERS ---
    const handleReset = () => {
        setStartDate(defaultStart);
        setEndDate(defaultEnd);
        setDateRangeKey('30-days');
        setPage(1);
    };

    const handleDateRangeChange = (start: string, end: string, key: string) => {
        setStartDate(start);
        setEndDate(end);
        setDateRangeKey(key);
        setPage(1);
    };

    const handleEdit = (record: any) => {
        // Typically users shouldn't edit their own attendance here, but if they have permission...
        // For "My Attendance", we usually only allow Viewing Logs.
        // But since HR_MANAGER is using this, they might expect to edit?
        // Let's allow it for now, reusing the dialog.
        setSelectedRecord(record);
        setEditOpen(true);
    };

    const handleViewLogs = (record: any) => {
        setViewRecord(record);
        setLogOpen(true);
    };

    return (
        <div className="p-2 md:p-6 space-y-4 md:space-y-6 pb-24 animate-in fade-in duration-500">
            {/* Breadcrumb Section */}
            <div className="mb-2 md:mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">
                                <Badge variant="outline" className="text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <LayoutDashboard className="h-3 w-3 mr-2" />
                                    Dashboard
                                </Badge>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/check-in">
                                <Badge variant="outline" className="text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Calendar className="h-3 w-3 mr-2" />
                                    Absensi
                                </Badge>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md shadow-emerald-500/20">
                                    Riwayat Saya
                                </Badge>
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Header Card */}
            <HeaderCard
                title="Riwayat Kehadiran Saya"
                description="Lihat detail riwayat kehadiran dan log absensi Anda."
                icon={<Calendar className="h-6 w-6 text-white" />}
                gradientFrom="from-emerald-600"
                gradientTo="to-teal-600"
                patternText="My Attendance"
                showActionArea={false}
            />

            {/* Filters Section */}
            <Card className="border-slate-200 shadow-sm overflow-visible rounded-xl md:rounded-xl">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        {/* Date Range Predefined */}
                        <div className="space-y-1.5 container-filter w-full md:w-auto">
                            <label className="text-[10px] uppercase font-bold text-slate-500 px-1">Rentang Waktu</label>
                            <DateRangeSelect
                                value={dateRangeKey}
                                onRangeChange={handleDateRangeChange}
                            />
                        </div>

                        {/* Date Filters */}
                        <div className="space-y-1.5 container-filter w-full md:w-auto">
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
                        <div className="space-y-1.5 container-filter w-full md:w-auto">
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
                        <div className="w-full md:w-auto">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 px-4 h-10 font-bold"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table Section */}
            <div className="space-y-4">
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
                    isEmployee={true} // Hide bulk actions / employee info columns if AttendanceTable supports it
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
