"use client";

import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, FilterX, ChevronDown, ChevronUp } from 'lucide-react';
import { PayrollDetail } from '@/types/payroll';
import { PayrollSlipDetail } from './PayrollSlipDetail';

interface PayrollDetailTableProps {
    details: PayrollDetail[];
    filteredDetails: PayrollDetail[];
    filterState: {
        searchTerm: string;
        selectedDept: string;
        selectedSection: string;
        selectedPosition: string;
    };
    setFilterState: {
        setSearchTerm: (val: string) => void;
        setSelectedDept: (val: string) => void;
        setSelectedSection: (val: string) => void;
        setSelectedPosition: (val: string) => void;
    };
    showFilters?: boolean;
    isEmployee?: boolean; // Add this to detect employee role
}

export function PayrollDetailTable({
    details,
    filteredDetails,
    filterState,
    setFilterState,
    showFilters = true,
    isEmployee = false
}: PayrollDetailTableProps) {
    const { searchTerm, selectedDept, selectedSection, selectedPosition } = filterState;
    const { setSearchTerm, setSelectedDept, setSelectedSection, setSelectedPosition } = setFilterState;

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Expandable Rows State
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Auto-expand for employees on mobile
    React.useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;

            // Auto-expand all rows for employees on mobile
            if (isEmployee && mobile && filteredDetails.length > 0) {
                const allIds = new Set(filteredDetails.map(d => d.id));
                setExpandedRows(allIds);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [isEmployee, filteredDetails]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Get unique options from ALL details
    const departments = Array.from(new Set(details.map(d => d.department))).filter(Boolean).sort();
    const sections = Array.from(new Set(details.map(d => d.section))).filter(Boolean).sort();
    const positions = Array.from(new Set(details.map(d => d.position))).filter(Boolean).sort();

    // Pagination Logic
    const totalPages = Math.ceil(filteredDetails.length / itemsPerPage);
    const paginatedDetails = filteredDetails.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedDept('all');
        setSelectedSection('all');
        setSelectedPosition('all');
        setCurrentPage(1);
    };

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    // Expandable Detail Row Component
    // Replaced by import


    return (
        <div className="space-y-3 md:space-y-4">
            {/* Filter Bar */}
            {showFilters && (
                <div className="flex flex-col gap-3 bg-white dark:bg-slate-900/50 p-3 md:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        <Input
                            placeholder="Cari karyawan atau NIK..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-9 h-9 md:h-10 text-xs md:text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all rounded-lg"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:flex gap-2">
                        <Select value={selectedDept} onValueChange={(val) => { setSelectedDept(val); setCurrentPage(1); }}>
                            <SelectTrigger className="h-8 md:h-10 text-[10px] md:text-xs">
                                <SelectValue placeholder="Departemen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Departemen</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept} value={dept} className="text-xs">{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedSection} onValueChange={(val) => { setSelectedSection(val); setCurrentPage(1); }}>
                            <SelectTrigger className="h-8 md:h-10 text-[10px] md:text-xs">
                                <SelectValue placeholder="Seksie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Seksie</SelectItem>
                                {sections.map(sec => (
                                    <SelectItem key={sec} value={sec} className="text-xs">{sec}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedPosition} onValueChange={(val) => { setSelectedPosition(val); setCurrentPage(1); }}>
                            <SelectTrigger className="h-8 md:h-10 text-[10px] md:text-xs col-span-2 md:col-span-1">
                                <SelectValue placeholder="Jabatan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jabatan</SelectItem>
                                {positions.map(pos => (
                                    <SelectItem key={pos} value={pos} className="text-xs">{pos}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {(searchTerm || selectedDept !== 'all' || selectedSection !== 'all' || selectedPosition !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="h-8 md:h-10 px-2 text-slate-500 dark:text-slate-400 dark:hover:bg-slate-800 md:w-auto"
                                title="Reset Filter"
                            >
                                <FilterX className="h-3.5 w-3.5 mr-1" />
                                <span className="text-[10px] md:hidden">Reset</span>
                            </Button>
                        )}
                    </div>

                    <div className="text-[10px] md:text-xs text-muted-foreground flex justify-between items-center">
                        <span>{filteredDetails.length} data ditemukan</span>
                        <span className="md:hidden">Halaman {currentPage} dari {totalPages}</span>
                    </div>
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900">
                        <TableRow>
                            <TableHead className="w-[50px] text-xs uppercase font-semibold dark:text-slate-400"></TableHead>
                            <TableHead className="w-[200px] text-xs uppercase font-semibold dark:text-slate-400">Karyawan</TableHead>
                            <TableHead className="text-xs uppercase font-semibold dark:text-slate-400">Departemen</TableHead>
                            <TableHead className="text-xs uppercase font-semibold dark:text-slate-400">Seksie</TableHead>
                            <TableHead className="text-xs uppercase font-semibold dark:text-slate-400">Jabatan</TableHead>
                            <TableHead className="text-right text-xs uppercase font-semibold dark:text-slate-400">Gaji Pokok</TableHead>
                            <TableHead className="text-right text-xs uppercase font-semibold dark:text-slate-400">Tunjangan</TableHead>
                            <TableHead className="text-right text-xs uppercase font-semibold dark:text-slate-400">Potongan</TableHead>
                            <TableHead className="text-right text-xs uppercase font-semibold dark:text-slate-400">Gaji Bersih</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDetails.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                                    Tidak ada data karyawan yang ditemukan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedDetails.map((detail) => (
                                <React.Fragment key={detail.id}>
                                    <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleRow(detail.id)}
                                                className="h-7 w-7 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            >
                                                {expandedRows.has(detail.id) ? (
                                                    <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                )}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{detail.employeeName}</div>
                                                <div className="text-[10px] text-muted-foreground dark:text-slate-400 uppercase">{detail.employeeIdNumber}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-700 dark:text-slate-300">{detail.department}</TableCell>
                                        <TableCell className="text-xs text-slate-700 dark:text-slate-300">{detail.section}</TableCell>
                                        <TableCell className="text-xs text-slate-700 dark:text-slate-300">{detail.position}</TableCell>
                                        <TableCell className="text-right font-medium text-slate-600 dark:text-slate-400 text-xs">
                                            {formatCurrency(detail.baseSalary)}
                                        </TableCell>
                                        <TableCell className="text-right text-blue-600 dark:text-blue-300 text-xs font-semibold">
                                            + {formatCurrency(detail.totalAllowances || 0)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600 dark:text-rose-300 text-xs font-semibold">
                                            - {formatCurrency(detail.totalDeductions)}
                                        </TableCell>
                                        <TableCell className="text-right font-black text-emerald-700 dark:text-emerald-300 text-sm">
                                            {formatCurrency(detail.netSalary)}
                                        </TableCell>
                                    </TableRow>
                                    {expandedRows.has(detail.id) && <PayrollSlipDetail detail={detail} />}
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredDetails.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl border border-dashed text-center text-slate-400 text-sm">
                        Data karyawan tidak ditemukan.
                    </div>
                ) : (
                    paginatedDetails.map((detail) => (
                        <div key={detail.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Card Header */}
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{detail.employeeName}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{detail.employeeIdNumber}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-400 dark:text-slate-300 uppercase font-bold">Gaji Bersih</div>
                                            <div className="text-sm font-black text-emerald-600 dark:text-emerald-300 leading-none mt-1">
                                                {formatCurrency(detail.netSalary)}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleRow(detail.id)}
                                            className="h-7 w-7 p-0 hover:bg-slate-200"
                                        >
                                            {expandedRows.has(detail.id) ? (
                                                <ChevronUp className="h-4 w-4 text-slate-600" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-slate-600" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-2 py-2 border-y border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold">Departemen</div>
                                        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">{detail.department}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold">Jabatan</div>
                                        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">{detail.position}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold">Gaji Pokok</div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400">{formatCurrency(detail.baseSalary)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold">Seksie</div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400">{detail.section}</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border dark:border-slate-700/50">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-400 dark:text-slate-400 font-bold uppercase">Tunjangan</span>
                                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-300">
                                            + {formatCurrency(detail.totalAllowances || 0)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[9px] text-slate-400 dark:text-slate-400 font-bold uppercase">Potongan</span>
                                        <span className="text-[11px] font-bold text-rose-500 dark:text-rose-300">
                                            - {formatCurrency(detail.totalDeductions)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Expandable Detail Section */}
                            {expandedRows.has(detail.id) && (
                                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white text-xs">
                                    {/* Header Info */}
                                    <div className="grid grid-cols-2 gap-2 mb-4 pb-3 border-b border-slate-700">
                                        <div>
                                            <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">TMK</div>
                                            <div className="text-[10px] font-medium">
                                                {detail.joinDate ? new Date(detail.joinDate).toLocaleDateString('id-ID') : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Status Pajak</div>
                                            <div className="text-[10px] font-medium">{detail.taxStatus || '-'}</div>
                                        </div>
                                    </div>

                                    {/* Section A: Pendapatan */}
                                    <div className="mb-4">
                                        <h4 className="font-bold text-[10px] mb-2 text-emerald-400 uppercase">A. Pendapatan</h4>
                                        <div className="space-y-1.5 text-[10px]">
                                            <div className="flex justify-between"><span className="text-slate-300">Gaji Pokok</span><span>{formatCurrency(detail.baseSalary)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">Upah Dibayarkan</span><span>{formatCurrency(detail.pokokTrm || detail.baseSalary)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">Tunjangan Jabatan</span><span>{formatCurrency(detail.allowances?.tJabatan || 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">Tunjangan Khusus</span><span>{formatCurrency(detail.allowances?.tKhusus || 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">Lembur</span><span>{formatCurrency(detail.allowances?.lembur || 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">Rapel</span><span>{formatCurrency(detail.allowances?.rapel || 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">Lain-lain</span><span>{formatCurrency(detail.allowances?.tLain || 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">Adm Bank</span><span>{formatCurrency(detail.allowances?.admBank || 0)}</span></div>
                                            <div className="flex justify-between pt-1.5 border-t border-slate-600 mt-1.5 font-bold text-emerald-400">
                                                <span>JUMLAH A</span><span>{formatCurrency(detail.totalAllowances)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section B: Potongan */}
                                    <div>
                                        <h4 className="font-bold text-[10px] mb-2 text-rose-400 uppercase">B. Potongan</h4>
                                        <div className="space-y-1.5 text-[10px]">
                                            <div className="flex justify-between"><span className="text-slate-300">JHT</span><span>{formatCurrency(detail.deductions?.jht || 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">JPN</span><span>{formatCurrency(detail.deductions?.jpn || 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">BPJS Kesehatan</span><span>{formatCurrency(detail.deductions?.bpjs || 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">PPh 21</span><span>{formatCurrency(detail.deductions?.pph21 || 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">Pot. Pinjaman</span><span>{formatCurrency(detail.deductions?.potPinjaman || 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">Iuran Koperasi</span><span>{formatCurrency(detail.deductions?.iuranKoperasi || 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-300">Lain-Lain</span><span>{formatCurrency(detail.deductions?.lain || 0)}</span></div>
                                            <div className="flex justify-between pt-1.5 border-t border-slate-600 mt-1.5 font-bold text-rose-400">
                                                <span>JUMLAH B</span><span>{formatCurrency(detail.totalDeductions)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 pt-2">
                    <div className="text-[10px] md:text-xs text-muted-foreground order-2 md:order-1">
                        Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai{' '}
                        {Math.min(currentPage * itemsPerPage, filteredDetails.length)} dari{' '}
                        {filteredDetails.length} karyawan
                    </div>
                    <div className="flex items-center gap-1.5 order-1 md:order-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="h-8 md:h-9 text-[10px] md:text-sm px-2"
                        >
                            <ChevronLeft className="h-3.5 w-3.5 md:mr-1" />
                            <span className="hidden md:inline">Sebelumnya</span>
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                .map((p, i, arr) => (
                                    <React.Fragment key={p}>
                                        {i > 0 && arr[i - 1] !== p - 1 && (
                                            <span className="px-1 text-slate-300 text-[10px]">...</span>
                                        )}
                                        <Button
                                            variant={p === currentPage ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setCurrentPage(p)}
                                            className={`h-8 w-8 md:h-9 md:w-9 text-[10px] md:text-sm p-0 ${p === currentPage ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                                        >
                                            {p}
                                        </Button>
                                    </React.Fragment>
                                ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="h-8 md:h-9 text-[10px] md:text-sm px-2"
                        >
                            <span className="hidden md:inline">Selanjutnya</span>
                            <ChevronRight className="h-3.5 w-3.5 md:ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
