"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Plus,
    FileText,
    CheckSquare,
    LayoutDashboard,
    History
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Pengajuan } from '@/types/request';
import { RequestTable } from '@/components/requests/RequestTable';
import { RequestDialog } from '@/components/requests/RequestDialog';
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
import { Badge } from "@/components/ui/badge";

export default function LeavesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Pengajuan | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Fetch My Requests
    const { data: myRequestsData, isLoading: isLoadingMy, refetch: refetchMy } = useQuery({
        queryKey: ['requests', 'my'],
        queryFn: async () => {
            const response = await api.get('/requests/my');
            return response.data.data as Pengajuan[];
        }
    });

    // Fetch Pending Approvals (for Managers)
    const { data: pendingApprovalsData, isLoading: isLoadingPending, refetch: refetchPending } = useQuery({
        queryKey: ['requests', 'pending'],
        queryFn: async () => {
            const response = await api.get('/requests/pending');
            return response.data.data as Pengajuan[];
        }
    });

    // Fetch Approval History
    const { data: approvalHistoryData, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
        queryKey: ['requests', 'history', 'approvals'],
        queryFn: async () => {
            const response = await api.get('/requests/approvals/history');
            return response.data.data as Pengajuan[];
        }
    });

    const handleApproval = async (request: Pengajuan, action: 'APPROVE' | 'REJECT') => {
        try {
            await api.post(`/requests/${request.id}/approve`, {
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                remarks: `Processed via dashboard`
            });
            toast.success(`Request ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
            refetchPending();
            refetchHistory();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message: string };
            console.error('Approval error:', err);
            toast.error(err.response?.data?.message || 'Failed to process approval');
        }
    };

    const handleCancel = async (request: Pengajuan) => {
        if (!confirm('Are you sure you want to cancel this application?')) return;

        try {
            await api.delete(`/requests/${request.id}`);
            toast.success('Application cancelled successfully');
            refetchMy();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message: string };
            console.error('Cancel error:', err);
            toast.error(err.response?.data?.message || 'Failed to cancel application');
        }
    };

    const handleView = (request: Pengajuan) => {
        setSelectedRequest(request);
        setIsDetailOpen(true);
    };

    const myRequests = myRequestsData || [];
    const pendingApprovals = pendingApprovalsData || [];

    return (
        <div className="p-2 md:p-2 space-y-4 md:space-y-4 pb-24 animate-in fade-in duration-500">
            {/* Header Section */}
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
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md shadow-emerald-500/20">
                                    <FileText className="h-3 w-3 mr-2" />
                                    Pengajuan
                                </Badge>
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Header Card Section */}
            <HeaderCard
                title="Pengajuan"
                description="Kelola pengajuan cuti, izin, sakit, dan dinas luar Anda."
                icon={<FileText className="h-6 w-6 text-white" />}
                gradientFrom="from-blue-600"
                gradientTo="to-indigo-600"
                patternText="PT. Grafindo Mitrasemesta"
                showActionArea={false}
            />

            {/* Action Button Section - New Location */}
            <div className="w-full">
                <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-500 text-white font-black uppercase tracking-widest text-[12px] h-12 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
                >
                    <Plus className="mr-2 h-5 w-5 stroke-[3px]" />
                    Buat Pengajuan Baru
                </Button>
            </div>

            <Tabs defaultValue="my-items" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl h-14 w-full md:w-auto grid grid-cols-2">
                    <TabsTrigger
                        value="my-items"
                        className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 flex items-center gap-2 px-6"
                    >
                        <History className="h-3.5 w-3.5" />
                        Pengajuan Saya
                    </TabsTrigger>
                    <TabsTrigger
                        value="approvals"
                        className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 flex items-center gap-2 px-6"
                    >
                        <CheckSquare className="h-3.5 w-3.5" />
                        Persetujuan {pendingApprovals.length > 0 && (
                            <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full min-w-[18px]">
                                {pendingApprovals.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="my-items" className="space-y-6 outline-none">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">
                                Pengajuan Terkini
                            </CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-500">
                                Riwayat dan status terkini pengajuan Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <RequestTable
                                requests={myRequests}
                                isLoading={isLoadingMy}
                                onCancel={handleCancel}
                                onView={handleView}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="approvals" className="space-y-6 outline-none">
                    <Tabs defaultValue="to-process" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <TabsList className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 p-1 rounded-xl h-11">
                                <TabsTrigger
                                    value="to-process"
                                    className="rounded-lg font-bold uppercase tracking-tight text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 px-4"
                                >
                                    To Process
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="rounded-lg font-bold uppercase tracking-tight text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 px-4"
                                >
                                    Riwayat
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="to-process" className="mt-0 outline-none">
                            <Card className="border-none shadow-none bg-transparent">
                                <CardHeader className="px-0 pt-0">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">
                                        Menunggu Persetujuan
                                    </CardTitle>
                                    <CardDescription className="text-[10px] font-medium text-slate-500">
                                        Pengajuan yang menunggu persetujuan Anda.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <RequestTable
                                        requests={pendingApprovalsData || []}
                                        isLoading={isLoadingPending}
                                        isApprovalView={true}
                                        onAction={handleApproval}
                                        onView={handleView}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0 outline-none">
                            <Card className="border-none shadow-none bg-transparent">
                                <CardHeader className="px-0 pt-0">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">
                                        Pengajuan Diproses
                                    </CardTitle>
                                    <CardDescription className="text-[10px] font-medium text-slate-500">
                                        Riwayat pengajuan yang telah Anda proses.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <RequestTable
                                        requests={approvalHistoryData || []}
                                        isLoading={isLoadingHistory}
                                        isApprovalView={false} // Show view icons only
                                        onView={handleView}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </TabsContent>
            </Tabs>

            <RequestDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSuccess={() => {
                    setIsDialogOpen(false);
                    refetchMy();
                }}
            />

            <RequestDetailSheet
                request={selectedRequest}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </div>
    );
}
