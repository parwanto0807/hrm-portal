"use client";

import React, { use, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, History, Calculator, TableProperties } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/app/hooks/useAuth";
import { PayrollDetailHeader } from '@/components/payroll/PayrollDetailHeader';
import { PayrollDetailTable } from '@/components/payroll/PayrollDetailTable';
import { PayrollCalculatePanel } from '@/components/payroll/PayrollCalculatePanel';
import { PayrollAuditLog } from '@/components/payroll/PayrollAuditLog';
import { toast } from 'sonner';
import Link from 'next/link';
import { PayrollDetail, PayrollLog } from '@/types/payroll';
import { AxonLoader } from '@/components/ui/AxonLoader';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { generatePayslipPDF } from '@/lib/generatePayslipPDF';

type TabType = 'detail' | 'calculate' | 'log';

export default function PayrollDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { getUser } = useAuth();
    const user = getUser();
    const isEmployee = user?.role === 'EMPLOYEE';
    const userRole = user?.role || 'EMPLOYEE';

    const { id } = use(params);

    // Tabs — employee hanya lihat detail
    const [activeTab, setActiveTab] = useState<TabType>('detail');

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('all');
    const [selectedSection, setSelectedSection] = useState('all');
    const [selectedPosition, setSelectedPosition] = useState('all');
    const [showAmount, setShowAmount] = useState(false);

    const queryClient = useQueryClient();

    const { data: detailData, isLoading, error, refetch } = useQuery({
        queryKey: ['payrollDetail', id],
        queryFn: async () => {
            const res = await api.get(`/payroll/periods/${id}/details`);
            return res.data.data;
        }
    });

    const { data: logData, isLoading: isLogLoading } = useQuery({
        queryKey: ['payrollLog', id],
        queryFn: async () => {
            const res = await api.get(`/payroll/log/${id}`);
            return res.data.data as PayrollLog[];
        },
        enabled: activeTab === 'log' && !isEmployee,
    });

    const filteredData = useMemo(() => {
        if (!detailData?.employees) return { employees: [], summary: detailData?.summary };

        const employees = detailData.employees.filter((detail: PayrollDetail) => {
            const matchesSearch = detail.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                detail.employeeIdNumber.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = selectedDept === 'all' || detail.department === selectedDept;
            const matchesSection = selectedSection === 'all' || detail.section === selectedSection;
            const matchesPosition = selectedPosition === 'all' || detail.position === selectedPosition;
            return matchesSearch && matchesDept && matchesSection && matchesPosition;
        });

        const summary = {
            ...detailData.summary,
            employeeCount: employees.length,
            totalNetSalary: employees.reduce((sum: number, emp: PayrollDetail) => sum + emp.netSalary, 0),
            totalDeductions: employees.reduce((sum: number, emp: PayrollDetail) => sum + emp.totalDeductions, 0),
            totalAllowances: employees.reduce((sum: number, emp: PayrollDetail) => {
                const allowances = Object.values(emp.allowances || {}).reduce((a: number, b: number | undefined) => a + (b || 0), 0);
                return sum + allowances;
            }, 0),
        };

        return { employees, summary };
    }, [detailData, searchTerm, selectedDept, selectedSection, selectedPosition]);

    const handleExport = async () => {
        if (filteredData.employees.length === 0) {
            toast.error('Tidak ada data karyawan untuk diekspor');
            return;
        }
        if (isEmployee) {
            const employeeId = filteredData.employees[0].employeeId;
            const toastId = toast.loading('Memproses PDF terproteksi...');
            try {
                const response = await api.post('/payroll/generate-protected', {
                    periodId: id, employeeId
                }, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Slip_Gaji_${id}_${employeeId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('Slip gaji berhasil diunduh', { id: toastId });
            } catch {
                toast.error('Gagal mengunduh slip gaji', { id: toastId });
            }
        } else {
            generatePayslipPDF(filteredData.employees, detailData.summary.period.name, detailData.summary.period.id);
            toast.success('Laporan berhasil diunduh');
        }
    };

    if (isLoading) return <AxonLoader />;

    if (error || !detailData) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Periode Tidak Ditemukan</h2>
                <p className="text-muted-foreground">Periode payroll yang Anda cari tidak ada.</p>
                <Button onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />Kembali
                </Button>
            </div>
        );
    }

    const isClosed = detailData?.summary?.period?.status === 'Closed';

    const tabs: { key: TabType; label: string; icon: React.ReactNode; hidden?: boolean }[] = [
        { key: 'detail', label: 'Detail Gaji', icon: <TableProperties className="h-3.5 w-3.5" /> },
        { key: 'calculate', label: 'Kalkulasi & Aksi', icon: <Calculator className="h-3.5 w-3.5" />, hidden: isEmployee },
        { key: 'log', label: 'Audit Log', icon: <History className="h-3.5 w-3.5" />, hidden: isEmployee },
    ];

    return (
        <div className="flex flex-col gap-4 md:gap-5 p-3 md:p-2 lg:p-2 pb-24 md:pb-20">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard" className="flex items-center gap-1">
                                <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Home className="h-3 w-3 mr-1" />Dashboard
                                </Badge>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard/payroll">
                                <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Payroll</Badge>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-transparent">
                                {isEmployee ? "Detail Slip Gaji" : `Periode ${id}`}
                            </Badge>
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Back button */}
            <Button
                variant="ghost"
                className="group w-fit text-emerald-700 hover:text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100 px-4 rounded-lg transition-all duration-300 pl-3.5 h-9 text-sm mb-[-8px] border border-emerald-100 hover:border-emerald-200 shadow-xs hover:shadow-md"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform duration-300 text-emerald-600" />
                <span className="font-medium">
                    {isEmployee ? "Kembali ke Daftar Slip Gaji" : "Kembali ke Daftar Payroll"}
                </span>
                <div className="ml-2 w-1 h-4 bg-gradient-to-b from-emerald-400 to-emerald-300 rounded-full group-hover:from-emerald-500 group-hover:to-emerald-400 transition-all duration-300" />
            </Button>

            {/* Header summary */}
            <PayrollDetailHeader
                summary={filteredData.summary}
                onExport={handleExport}
                exportLabel={isEmployee ? "Unduh Slip Gaji" : "Unduh Laporan"}
                showAmount={showAmount}
                onToggleShowAmount={setShowAmount}
            />

            {/* Tab Navigation */}
            {!isEmployee && (
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                    {tabs.filter(t => !t.hidden).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === tab.key
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Tab Content */}
            {/* Detail Gaji */}
            {(activeTab === 'detail' || isEmployee) && (
                <div className="space-y-2 animate-in fade-in">
                    <PayrollDetailTable
                        details={detailData.employees}
                        filteredDetails={filteredData.employees}
                        filterState={{ searchTerm, selectedDept, selectedSection, selectedPosition }}
                        setFilterState={{ setSearchTerm, setSelectedDept, setSelectedSection, setSelectedPosition }}
                        showFilters={!isEmployee}
                        isEmployee={isEmployee}
                        showAmount={showAmount}
                    />
                </div>
            )}

            {/* Kalkulasi & Aksi */}
            {activeTab === 'calculate' && !isEmployee && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <PayrollCalculatePanel
                        periodeId={id}
                        isClosed={isClosed}
                        userRole={userRole}
                        totalEmployees={detailData.summary.employeeCount || 0}
                        onRefresh={() => {
                            refetch();
                            queryClient.invalidateQueries({ queryKey: ['payrollLog', id] });
                        }}
                    />
                </div>
            )}

            {/* Audit Log */}
            {activeTab === 'log' && !isEmployee && (
                <div className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3 flex items-center gap-2">
                        <History className="h-4 w-4 text-white" />
                        <h3 className="text-white font-semibold text-sm">Riwayat Audit Payroll</h3>
                        <Badge className="ml-auto bg-white/20 text-white border-0 text-[10px]">
                            {logData?.length || 0} entri
                        </Badge>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900">
                        <PayrollAuditLog logs={logData || []} isLoading={isLogLoading} />
                    </div>
                </div>
            )}
        </div>
    );
}
