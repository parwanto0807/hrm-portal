// components/employees/EmployeeTable.tsx
"use client";

import React from 'react';
import {
    Eye,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Building,
    Briefcase,
    Phone,
    Mail,
    MapPin,
    User,
    BadgeCheck,
    Calendar
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Employee } from '@/types/employee';
import { cn, formatDate } from '@/lib/utils';

interface EmployeeTableProps {
    data: Employee[];
    isLoading: boolean;
    error: Error | null;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange: (page: number) => void;
    onView: (employee: Employee) => void;
    onEdit: (employee: Employee) => void;
    onDelete: (employee: Employee) => void;
}

export function EmployeeTable({
    data,
    isLoading,
    error,
    pagination,
    onPageChange,
    onView,
    onEdit,
    onDelete
}: EmployeeTableProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    if (error) {
        return (
            <Card className="border-red-200/50 bg-gradient-to-br from-red-50/50 to-white dark:from-red-950/10 dark:to-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                        <User className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Failed to Load Data</h3>
                    <p className="text-red-600/80 dark:text-red-400/80 text-sm max-w-md mx-auto">{error.message}</p>
                </CardContent>
            </Card>
        );
    }

    // Helper to group data
    const groupedData = React.useMemo(() => {
        if (!data) return {};
        return data.reduce((groups, employee) => {
            const deptName = employee.dept?.nmDept || 'Unassigned';
            if (!groups[deptName]) {
                groups[deptName] = [];
            }
            groups[deptName].push(employee);
            return groups;
        }, {} as Record<string, Employee[]>);
    }, [data]);

    const sortedDeptNames = React.useMemo(() => {
        return Object.keys(groupedData).sort((a, b) => a.localeCompare(b));
    }, [groupedData]);

    return (
        <div className="space-y-6">
            {/* Desktop Table View - Enhanced Professional Design */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 backdrop-blur-sm shadow-xl shadow-slate-100/50 dark:shadow-slate-900/20">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gradient-to-r from-slate-50/80 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 border-b border-slate-200/50 dark:border-slate-800/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px] py-6 pl-8">
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <User className="h-3.5 w-3.5" />
                                        Employee
                                    </div>
                                </TableHead>
                                <TableHead className="py-6">
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <BadgeCheck className="h-3.5 w-3.5" />
                                        Identity
                                    </div>
                                </TableHead>
                                <TableHead className="py-6">
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5" />
                                        Contact
                                    </div>
                                </TableHead>
                                <TableHead className="py-6">
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <Briefcase className="h-3.5 w-3.5" />
                                        Position
                                    </div>
                                </TableHead>
                                <TableHead className="py-6">
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <Building className="h-3.5 w-3.5" />
                                        Department
                                    </div>
                                </TableHead>
                                <TableHead className="py-6">
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <Building className="h-3.5 w-3.5" />
                                        Section
                                    </div>
                                </TableHead>
                                <TableHead className="py-6">
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Status
                                    </div>
                                </TableHead>
                                <TableHead className="py-6">
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Location
                                    </div>
                                </TableHead>
                                <TableHead className="w-[180px] py-6 pr-8 text-right">
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                        Actions
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-slate-100/50 dark:border-slate-800/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                                        <TableCell className="pl-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-12 w-12 rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        {Array.from({ length: 6 }).map((_, cellIndex) => (
                                            <TableCell key={cellIndex} className="py-5">
                                                <Skeleton className="h-4 w-full max-w-[120px]" />
                                            </TableCell>
                                        ))}
                                        <TableCell className="pr-8 py-5">
                                            <div className="flex justify-end gap-2">
                                                <Skeleton className="h-9 w-9 rounded-lg" />
                                                <Skeleton className="h-9 w-9 rounded-lg" />
                                                <Skeleton className="h-9 w-9 rounded-lg" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                                                <User className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No Employees Found</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Start by adding your first team member</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedDeptNames.map((deptName) => (
                                    <React.Fragment key={deptName}>
                                        {/* Enhanced Department Header */}
                                        <TableRow className="bg-gradient-to-r from-blue-50/30 to-indigo-50/20 dark:from-blue-900/10 dark:to-indigo-900/10 border-y border-blue-100/50 dark:border-blue-800/20">
                                            <TableCell colSpan={9} className="px-8 py-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                            <Building className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">{deptName}</span>
                                                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none px-2 py-0.5 text-xs font-bold">
                                                                    {groupedData[deptName].length} {groupedData[deptName].length === 1 ? 'Member' : 'Members'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">
                                                                Department • {groupedData[deptName].filter(e => e.kdSts === 'AKTIF').length} Active
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {/* <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <div className="text-xs font-medium text-blue-600/80 dark:text-blue-400/80">Department Lead</div>
                                                            <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                                                                {groupedData[deptName][0]?.nama || 'Not Assigned'}
                                                            </div>
                                                        </div>
                                                    </div> */}
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {/* Enhanced Employee Rows */}
                                        {groupedData[deptName].map((employee, index) => (
                                            <TableRow
                                                key={employee.id}
                                                className={cn(
                                                    "border-slate-100/50 dark:border-slate-800/30 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-white/50 dark:hover:from-slate-800/10 dark:hover:to-slate-900/10",
                                                    "transition-all duration-300 group"
                                                )}
                                            >
                                                <TableCell className="pl-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <Avatar className="h-14 w-14 border-4 border-white/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30">
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white font-bold text-sm">
                                                                    {getInitials(employee.nama)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className={cn(
                                                                "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center",
                                                                employee.kdSts === 'AKTIF'
                                                                    ? "bg-emerald-500"
                                                                    : "bg-slate-400"
                                                            )}>
                                                                {employee.kdSts === 'AKTIF' ? (
                                                                    <BadgeCheck className="h-3 w-3 text-white" />
                                                                ) : (
                                                                    <Calendar className="h-3 w-3 text-white" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{employee.nama}</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">ID: {employee.emplId}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-5">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                                <BadgeCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{employee.nik || 'N/A'}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Joined: {formatDate(employee.tglMsk)}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-5">
                                                    <div className="space-y-2">
                                                        {employee.handphone && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                                    <Phone className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                                                </div>
                                                                <a
                                                                    href={`tel:${employee.handphone}`}
                                                                    className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                                                >
                                                                    {employee.handphone}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {employee.email && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                                    <Mail className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                                                </div>
                                                                <a
                                                                    href={`mailto:${employee.email}`}
                                                                    className="text-xs text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate max-w-[150px]"
                                                                    title={employee.email}
                                                                >
                                                                    {employee.email}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                                                            <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{employee.jabatan?.nmJab || 'Unassigned'}</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Position</div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center">
                                                            <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{employee.dept?.nmDept || 'Unassigned'}</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Department</div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 flex items-center justify-center">
                                                            <Building className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{employee.sie?.nmSeksie || 'Unassigned'}</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Section</div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-5">
                                                    <Badge
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider border-0",
                                                            employee.kdSts === 'AKTIF'
                                                                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25"
                                                                : "bg-gradient-to-r from-slate-400 to-slate-500 text-white"
                                                        )}
                                                    >
                                                        {employee.kdSts === 'AKTIF' ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="py-5">
                                                    <div className="flex items-start gap-2 max-w-[200px]">
                                                        <div className="h-6 w-6 rounded-md bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <MapPin className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                                                        </div>
                                                        <span className="text-sm text-slate-600 dark:text-slate-300 leading-tight line-clamp-2">
                                                            {employee.alamat1 || 'No address provided'}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="pr-8 py-5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => onView(employee)}
                                                            className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30 hover:scale-105 transition-all group/action"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => onEdit(employee)}
                                                            className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-800/30 hover:scale-105 transition-all group/action"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => onDelete(employee)}
                                                            className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-800/30 hover:scale-105 transition-all group/action"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Mobile/Tablet Card View - Premium Design */}
            <div className="lg:hidden space-y-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-900/30 dark:to-slate-800/30 backdrop-blur-sm animate-pulse">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-14 w-14 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {Array.from({ length: 4 }).map((_, j) => (
                                        <div key={j} className="space-y-2">
                                            <Skeleton className="h-3 w-20" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Skeleton className="h-9 flex-1 rounded-lg" />
                                    <Skeleton className="h-9 w-9 rounded-lg" />
                                    <Skeleton className="h-9 w-9 rounded-lg" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : data.length === 0 ? (
                    <Card className="border-dashed border-2 border-slate-300/50 dark:border-slate-700/50 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-900/20 dark:to-slate-800/20 backdrop-blur-sm">
                        <CardContent className="py-12 text-center">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mx-auto mb-4">
                                <User className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Team Members</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Add your first employee to get started</p>
                        </CardContent>
                    </Card>
                ) : (
                    sortedDeptNames.map((deptName) => (
                        <React.Fragment key={deptName}>
                            {/* Mobile Department Header */}
                            <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/30">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                <Building className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-blue-800 dark:text-blue-300 text-sm">{deptName}</div>
                                                <div className="text-xs text-blue-600/70 dark:text-blue-400/70">
                                                    {groupedData[deptName].length} members • {groupedData[deptName].filter(e => e.kdSts === 'AKTIF').length} active
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className="bg-white/80 dark:bg-slate-800/80 text-blue-700 dark:text-blue-300 border-none">
                                            Department
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {groupedData[deptName].map((employee) => (
                                <Card
                                    key={employee.id}
                                    className="overflow-hidden border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900/30 dark:to-slate-800/30 backdrop-blur-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/20 transition-all duration-300"
                                >
                                    <CardContent className="p-5">
                                        {/* Header Section */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Avatar className="h-14 w-14 border-4 border-white/80 dark:border-slate-800/80 shadow-lg">
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white font-bold">
                                                            {getInitials(employee.nama)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center",
                                                        employee.kdSts === 'AKTIF'
                                                            ? "bg-emerald-500"
                                                            : "bg-slate-400"
                                                    )}>
                                                        {employee.kdSts === 'AKTIF' ? (
                                                            <BadgeCheck className="h-3 w-3 text-white" />
                                                        ) : (
                                                            <Calendar className="h-3 w-3 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{employee.nama}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                            ID: {employee.emplId}
                                                        </span>
                                                        <Badge
                                                            className={cn(
                                                                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                                                                employee.kdSts === 'AKTIF'
                                                                    ? "bg-emerald-500 text-white"
                                                                    : "bg-slate-400 text-white"
                                                            )}
                                                        >
                                                            {employee.kdSts === 'AKTIF' ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Briefcase className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Position</span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 pl-5">
                                                    {employee.jabatan?.nmJab || 'Unassigned'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Building className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 pl-5">
                                                    {employee.dept?.nmDept || 'Unassigned'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Building className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Section</span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 pl-5">
                                                    {employee.sie?.nmSeksie || 'Unassigned'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 pl-5">
                                                    {employee.handphone || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 pl-5 line-clamp-1">
                                                    {employee.alamat1 || 'N/A'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100/50 dark:border-slate-800/30">
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-700 text-sm font-semibold gap-2"
                                                onClick={() => onView(employee)}
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Details
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-10 w-10 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700"
                                                onClick={() => onEdit(employee)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-10 w-10 rounded-xl bg-gradient-to-r from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/30 hover:border-rose-300 dark:hover:border-rose-700"
                                                onClick={() => onDelete(employee)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </React.Fragment>
                    ))
                )}
            </div>

            {/* Enhanced Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Card className="border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-slate-900/20 dark:to-slate-800/20 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 order-2 lg:order-1">
                                Displaying <span className="font-bold text-slate-900 dark:text-white">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                                <span className="font-bold text-slate-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                                <span className="font-bold text-slate-900 dark:text-white">{pagination.total.toLocaleString()}</span> employees
                            </div>
                            <div className="flex items-center gap-2 order-1 lg:order-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="h-10 w-10 rounded-xl border-slate-300/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter(p => {
                                            if (pagination.totalPages <= 5) return true;
                                            return (
                                                p === 1 ||
                                                p === pagination.totalPages ||
                                                Math.abs(p - pagination.page) <= 1
                                            );
                                        })
                                        .map((p, i, arr) => (
                                            <React.Fragment key={p}>
                                                {i > 0 && arr[i - 1] !== p - 1 && (
                                                    <span className="px-2 text-slate-400">...</span>
                                                )}
                                                <Button
                                                    variant={p === pagination.page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => onPageChange(p)}
                                                    className={cn(
                                                        "h-10 min-w-10 rounded-xl font-bold text-sm transition-all",
                                                        p === pagination.page
                                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                                                            : "border-slate-300/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                                    )}
                                                >
                                                    {p}
                                                </Button>
                                            </React.Fragment>
                                        ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="h-10 w-10 rounded-xl border-slate-300/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}