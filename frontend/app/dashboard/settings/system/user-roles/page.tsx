
"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShieldCheck, History, Save, Search, RefreshCcw, ShieldAlert, Home
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { api } from '@/lib/api';
import { toast } from 'sonner';
import HeaderCard from '@/components/ui/header-card';
import Link from 'next/link';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function UserRolesPage() {
    const queryClient = useQueryClient();
    const [selectedRole, setSelectedRole] = useState<string>('SUPER_ADMIN');
    const [historySearch, setHistorySearch] = useState('');
    const [historyPage, setHistoryPage] = useState(0);

    // Queries
    const { data: rolesData } = useQuery({
        queryKey: ['rbac', 'roles'],
        queryFn: async () => (await api.get('/rbac/roles')).data
    });

    const { data: menusData } = useQuery({
        queryKey: ['rbac', 'menus'],
        queryFn: async () => (await api.get('/rbac/menus')).data
    });

    const { data: permissionsData, refetch: refetchPerms } = useQuery({
        queryKey: ['rbac', 'permissions', selectedRole],
        queryFn: async () => (await api.get(`/rbac/permissions/${selectedRole}`)).data,
        enabled: !!selectedRole
    });

    const { data: historyData, isLoading: historyLoading } = useQuery({
        queryKey: ['history', historyPage, historySearch],
        queryFn: async () => (await api.get('/history', {
            params: { offset: historyPage * 20, limit: 20, search: historySearch }
        })).data
    });

    // Mutations
    const updatePermsMutation = useMutation({
        mutationFn: async (menuIds: string[]) => {
            return await api.put(`/rbac/permissions/${selectedRole}`, { menuIds });
        },
        onSuccess: () => {
            toast.success('Permissions updated successfully');
            queryClient.invalidateQueries({ queryKey: ['rbac', 'permissions', selectedRole] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to update permissions');
        }
    });

    const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);

    React.useEffect(() => {
        if (permissionsData?.permissions) {
            setSelectedMenuIds(permissionsData.permissions.map((p: any) => p.menuId));
        }
    }, [permissionsData]);

    const toggleMenu = (menuId: string) => {
        setSelectedMenuIds(prev =>
            prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
        );
    };

    const handleSavePermissions = () => {
        updatePermsMutation.mutate(selectedMenuIds);
    };

    return (
        <div className="flex flex-col gap-6 p-2 md:p-6">
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
                        <Badge variant="outline">Settings</Badge>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">
                                User Roles & History
                            </Badge>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HeaderCard
                title="User Access & RBAC"
                description="Manage role-based access control and monitor user activity logs."
                icon={<ShieldCheck className="h-6 w-6 text-white" />}
                gradientFrom="from-slate-800"
                gradientTo="to-slate-900"
                patternText="HRIS SYSTEM SECURITY"
            />

            <Tabs defaultValue="rbac" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="rbac" className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        Role Matrix
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Access History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="rbac" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <CardTitle>Role Permissions</CardTitle>
                                    <CardDescription>Select a role to manage its menu access.</CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rolesData?.roles?.map((role: string) => (
                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={handleSavePermissions}
                                        disabled={updatePermsMutation.isPending}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {menusData?.menus?.map((menu: any) => (
                                    <div
                                        key={menu.id}
                                        onClick={() => toggleMenu(menu.id)}
                                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${selectedMenuIds.includes(menu.id)
                                            ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                                            : 'bg-white hover:bg-slate-50 border-slate-200'
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900">{menu.label}</span>
                                            <span className="text-xs text-slate-500">{menu.groupLabel}</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedMenuIds.includes(menu.id)
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : 'bg-white border-slate-300'
                                            }`}>
                                            {selectedMenuIds.includes(menu.id) && (
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <CardTitle>System Logs</CardTitle>
                                    <CardDescription>Monitor recent user actions and system events.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-[300px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search logs..."
                                            className="pl-9"
                                            value={historySearch}
                                            onChange={(e) => setHistorySearch(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="icon">
                                        <RefreshCcw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead>User</TableHead>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>IP Address</TableHead>
                                            <TableHead>Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {historyLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-10 text-center">
                                                    <LoadingSpinner />
                                                </TableCell>
                                            </TableRow>
                                        ) : historyData?.history?.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-10">No logs found.</TableCell></TableRow>
                                        ) : (
                                            historyData?.history?.map((log: any) => (
                                                <TableRow key={log.id} className="hover:bg-slate-50/50">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{log.user?.name || log.logUser}</span>
                                                            <span className="text-xs text-slate-500">{log.logUser}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                                            {log.modul}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">{log.action}</TableCell>
                                                    <TableCell className="text-slate-500 text-sm">{log.ipAddress || '-'}</TableCell>
                                                    <TableCell className="text-slate-600 text-sm">
                                                        {format(new Date(log.datetime), 'dd MMM yyyy HH:mm:ss')}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <span className="text-sm text-slate-500">
                                    Showing {historyData?.history?.length || 0} of {historyData?.pagination?.total || 0} records
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={historyPage === 0}
                                        onClick={() => setHistoryPage(p => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={(historyPage + 1) * 20 >= (historyData?.pagination?.total || 0)}
                                        onClick={() => setHistoryPage(p => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
