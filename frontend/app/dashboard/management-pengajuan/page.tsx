"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    FileText,
    LayoutDashboard,
    Search,
    Filter,
    RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Pengajuan } from '@/types/request';
import { RequestTable } from '@/components/requests/RequestTable';
import { RequestDetailSheet } from '@/components/requests/RequestDetailSheet';
import HeaderCard from '@/components/ui/header-card';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from '@/app/hooks/useAuth';
import { Badge } from "@/components/ui/badge";

export default function ManagementPengajuanPage() {
    const { getUser } = useAuth();
    const user = getUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState<Pengajuan | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Fetch All Requests
    const { data: requestsData, isLoading, refetch } = useQuery({
        queryKey: ['requests', 'all', statusFilter, typeFilter, searchTerm],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (searchTerm) params.append('search', searchTerm);

            const response = await api.get(`/requests/all?${params.toString()}`);
            return response.data.data as Pengajuan[];
        }
    });

    const handleApproval = async (request: Pengajuan, action: 'APPROVE' | 'REJECT', params?: { startDate?: Date, endDate?: Date, remarks?: string }) => {
        try {
            await api.post(`/requests/${request.id}/approve`, {
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                remarks: params?.remarks || `Processed via Management Dashboard`,
                startDate: params?.startDate,
                endDate: params?.endDate
            });
            toast.success(`Pengajuan ${action === 'APPROVE' ? 'disetujui' : 'ditolak'}`);
            refetch();
        } catch (error: any) {
            console.error('Approval error:', error);
            toast.error(error.response?.data?.message || 'Gagal memproses pengajuan');
        }
    };

    const handleView = (request: Pengajuan) => {
        setSelectedRequest(request);
        setIsDetailOpen(true);
    };

    const requests = requestsData || [];

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
                            <BreadcrumbPage>
                                <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md shadow-indigo-500/20">
                                    <FileText className="h-3 w-3 mr-2" />
                                    Management Pengajuan
                                </Badge>
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Header Card Section */}
            <HeaderCard
                title="Management Pengajuan"
                description="Monitor dan kelola semua pengajuan cuti serta izin karyawan dalam satu panel."
                icon={<FileText className="h-6 w-6 text-white" />}
                gradientFrom="from-indigo-600"
                gradientTo="to-blue-600"
                patternText="HR MANAGEMENT SYSTEM"
                showActionArea={false}
            />

            {/* Filters Section */}
            <Card className="border-none shadow-sm bg-white dark:bg-slate-950 rounded-2xl overflow-hidden">
                <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                placeholder="Cari nama atau NIK..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl h-11 focus-visible:ring-indigo-500/50"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl h-11 focus:ring-indigo-500/50">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                                    <SelectValue placeholder="Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800">
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="PENDING">Menunggu (Step 1)</SelectItem>
                                <SelectItem value="IN_PROGRESS">Diproses (Step 2/3)</SelectItem>
                                <SelectItem value="APPROVED">Disetujui</SelectItem>
                                <SelectItem value="REJECTED">Ditolak</SelectItem>
                                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl h-11 focus:ring-indigo-500/50">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                                    <SelectValue placeholder="Tipe" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800">
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                <SelectItem value="CUTI">Cuti</SelectItem>
                                <SelectItem value="IJIN">Ijin</SelectItem>
                                <SelectItem value="SAKIT">Sakit</SelectItem>
                                <SelectItem value="DINAS_LUAR">Dinas Luar</SelectItem>
                                <SelectItem value="PULANG_CEPAT">Pulang Cepat</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={() => refetch()}
                            className="rounded-xl h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 flex gap-2 font-bold text-slate-600 dark:text-slate-400"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table Section */}
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">
                            Semua Pengajuan
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-500">
                            Total {requests.length} pengajuan ditemukan.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    <RequestTable
                        requests={requests}
                        isLoading={isLoading}
                        isApprovalView={true} // Show employee names and actions
                        onAction={handleApproval}
                        onView={handleView}
                        currentUser={user}
                    />
                </CardContent>
            </Card>

            <RequestDetailSheet
                request={selectedRequest}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </div>
    );
}
