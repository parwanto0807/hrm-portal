"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    User, Search, Plus, Download, RefreshCcw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeDetailSheet } from '@/components/employees/EmployeeDetailSheet';
import { EmployeeDialog } from '@/components/employees/EmployeeDialog';
import { Employee, EmployeeListResponse } from '@/types/employee';
import { toast } from 'sonner';
import HeaderCard from '@/components/ui/header-card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from '@/lib/api';
import Link from 'next/link';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

const fetchEmployees = async (params: {
    page: number;
    limit: number;
    search: string;
    kdDept: string;
    kdJab: string;
    kdSts: string;
    kdSeksie: string;
}): Promise<EmployeeListResponse> => {
    const { data } = await api.get('/employees', { params });
    return data;
};

export default function EmployeesPage() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [selectedDept, setSelectedDept] = useState<string>('all');
    const [selectedSection, setSelectedSection] = useState<string>('all');
    const [selectedPosition, setSelectedPosition] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    // Reset page when filters change
    React.useEffect(() => {
        setPage(1);
    }, [selectedDept, selectedSection, selectedPosition, selectedStatus, search]);

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch employees
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['employees', page, limit, debouncedSearch, selectedDept, selectedSection, selectedPosition, selectedStatus],
        queryFn: () => fetchEmployees({
            page,
            limit,
            search: debouncedSearch,
            kdDept: selectedDept === 'all' ? '' : selectedDept,
            kdSeksie: selectedSection === 'all' ? '' : selectedSection,
            kdJab: selectedPosition === 'all' ? '' : selectedPosition,
            kdSts: selectedStatus === 'all' ? '' : selectedStatus
        }),
        staleTime: 30000
    });

    // Fetch Departments for Filter
    const { data: departments } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const { data } = await api.get('/org/departments');
            return data.data; // Return the array directly
        }
    });

    // Fetch Sections for Filter
    const { data: sections } = useQuery({
        queryKey: ['sections'],
        queryFn: async () => {
            const { data } = await api.get('/org/sections');
            return data.data; // Return the array directly
        }
    });

    // Fetch Positions for Filter
    const { data: positions } = useQuery({
        queryKey: ['positions'],
        queryFn: async () => {
            const { data } = await api.get('/positions');
            return data.data; // Return the array directly
        }
    });

    const handleView = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDetailOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsDialogOpen(true);
    };

    const handleDelete = async (employee: Employee) => {
        if (!confirm(`Yakin ingin menghapus karyawan ${employee.nama}?`)) return;

        try {
            await api.delete(`/employees/${employee.id}`);
            toast.success('Karyawan berhasil dihapus');
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Gagal menghapus karyawan');
            console.error(error);
        }
    };

    // Helper to calculate active employees count
    const activeCount = data?.data?.filter(e => e.kdSts === 'AKTIF').length || 0;

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-2 md:p-6">
            {/* Breadcrumb Section */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard" className="flex items-center gap-1">
                                <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Home className="h-3 w-3 mr-1" />
                                    Dashboard
                                </Badge>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white border-transparen2">
                                Employees
                            </Badge>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="Employee Management"
                description="Manage all your employees, view details, and track performance."
                icon={<User className="h-6 w-6 text-white" />}
                gradientFrom="from-blue-600"
                gradientTo="to-indigo-600"
                patternText="PT. Grafindo Mitrasemesta"
                showActionArea
                actionArea={
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                            onClick={() => {
                                toast.promise(
                                    api.post('/mysql/import/employees').then((res) => {
                                        const result = res.data;
                                        if (!result.success) throw new Error(result.message);
                                        return result;
                                    }),
                                    {
                                        loading: 'Importing from MySQL...',
                                        success: (data) => `Imported: ${data.stats.imported}, Updated: ${data.stats.updated}`,
                                        error: (err) => `Import failed: ${err.message}`
                                    }
                                );
                            }}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Import MySQL
                        </Button>
                        <Button
                            className="bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 border dark:border-slate-700"
                            onClick={() => {
                                setEditingEmployee(null);
                                setIsDialogOpen(true);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Employee
                        </Button>
                    </div>
                }
            />

            {/* Filters & Search - Modern Design */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by ID, NIK, or Name..."
                        className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-750 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Select value={selectedDept} onValueChange={setSelectedDept}>
                    <SelectTrigger className="w-full md:w-[180px] bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments?.map((dept: { kdDept: string; nmDept: string }) => (
                            <SelectItem key={dept.kdDept} value={dept.kdDept}>
                                {dept.nmDept}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger className="w-full md:w-[180px] bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {sections?.map((sec: { kdSeksie: string; nmSeksie: string }) => (
                            <SelectItem key={sec.kdSeksie} value={sec.kdSeksie}>
                                {sec.nmSeksie}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger className="w-full md:w-[180px] bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        {positions?.map((pos: { kdJab: string; nmJab: string }) => (
                            <SelectItem key={pos.kdJab} value={pos.kdJab}>
                                {pos.nmJab}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full md:w-[150px] bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="AKTIF">Active</SelectItem>
                        <SelectItem value="TIDAK_AKTIF">Inactive</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                        setSearch('');
                        setSelectedDept('all');
                        setSelectedSection('all');
                        setSelectedPosition('all');
                        setSelectedStatus('all');
                    }}
                    title="Reset Filters"
                >
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="flex gap-4">
                <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-100">
                    Total Employees: {data?.pagination?.total || 0}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 bg-green-50 text-green-700 border-green-100">
                    Active: {activeCount}
                </Badge>
            </div>

            {/* Table Component */}
            <EmployeeTable
                data={data?.data || []}
                isLoading={isLoading}
                error={error as Error}
                pagination={data?.pagination}
                onPageChange={setPage}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Detail Sheet */}
            <EmployeeDetailSheet
                employee={selectedEmployee}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />

            {/* Add/Edit Dialog */}
            <EmployeeDialog
                employee={editingEmployee}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSuccess={() => {
                    refetch();
                    setIsDialogOpen(false);
                }}
            />
        </div>
    );
}
