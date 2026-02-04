"use client";

import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { PayrollDetail } from '@/types/payroll';

interface PayrollSlipDetailProps {
    detail: PayrollDetail;
    colSpan?: number;
}

export function PayrollSlipDetail({ detail, colSpan = 9 }: PayrollSlipDetailProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatHours = (hours: number | undefined) => {
        return hours ? `${hours.toFixed(2)} Jam` : '0.00 Jam';
    };

    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-0 border-0">
                <div className="p-6 text-white">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 pb-4 border-b border-slate-700">
                        <div>
                            <div className="text-xs text-slate-400 uppercase font-bold mb-1">TMK (Tanggal Masuk Kerja)</div>
                            <div className="text-sm font-medium">
                                {detail.joinDate ? new Date(detail.joinDate).toLocaleDateString('id-ID') : '-'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 uppercase font-bold mb-1">Status Pajak (PTKP)</div>
                            <div className="text-sm font-medium">{detail.taxStatus || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 uppercase font-bold mb-1">Jam Lembur</div>
                            <div className="text-sm font-medium">{formatHours(detail.lemburHours)}</div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Section A: Pendapatan */}
                        <div>
                            <h4 className="font-bold text-sm mb-3 text-emerald-400 uppercase tracking-wide">A. Pendapatan (Income)</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Gaji Pokok</span>
                                    <span className="font-medium">{formatCurrency(detail.baseSalary)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Upah Dibayarkan</span>
                                    <span className="font-medium">{formatCurrency(detail.pokokTrm || detail.baseSalary)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Tunjangan Jabatan</span>
                                    <span className="font-medium">{formatCurrency(detail.allowances?.tJabatan || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Tunjangan Khusus</span>
                                    <span className="font-medium">{formatCurrency(detail.allowances?.tKhusus || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Lembur ({formatHours(detail.lemburHours)})</span>
                                    <span className="font-medium">{formatCurrency(detail.allowances?.lembur || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Rapel</span>
                                    <span className="font-medium">{formatCurrency(detail.allowances?.rapel || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Lain-lain</span>
                                    <span className="font-medium">{formatCurrency(detail.allowances?.tLain || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Adm Bank</span>
                                    <span className="font-medium">{formatCurrency(detail.allowances?.admBank || 0)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-t border-slate-600 mt-2 pt-2">
                                    <span className="font-bold text-emerald-400 uppercase">JUMLAH A</span>
                                    <span className="font-bold text-emerald-400">{formatCurrency(detail.totalAllowances)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section B: Potongan */}
                        <div>
                            <h4 className="font-bold text-sm mb-3 text-rose-400 uppercase tracking-wide">B. Potongan (Deductions)</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Jaminan Hari Tua (JHT)</span>
                                    <span className="font-medium">{formatCurrency(detail.deductions?.jht || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Jaminan Pensiun (JPN)</span>
                                    <span className="font-medium">{formatCurrency(detail.deductions?.jpn || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">BPJS Kesehatan</span>
                                    <span className="font-medium">{formatCurrency(detail.deductions?.bpjs || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">PPh 21</span>
                                    <span className="font-medium">{formatCurrency(detail.deductions?.pph21 || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Pot. Pinjaman</span>
                                    <span className="font-medium">{formatCurrency(detail.deductions?.potPinjaman || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Iuran Koperasi</span>
                                    <span className="font-medium">{formatCurrency(detail.deductions?.iuranKoperasi || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-300">Lain-Lain</span>
                                    <span className="font-medium">{formatCurrency(detail.deductions?.lain || 0)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-t border-slate-600 mt-2 pt-2">
                                    <span className="font-bold text-rose-400 uppercase">JUMLAH B</span>
                                    <span className="font-bold text-rose-400">{formatCurrency(detail.totalDeductions)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Net Salary Summary */}
                    <div className="mt-6 pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold uppercase">Gaji Dibayarkan (Net Salary)</span>
                            <span className="text-2xl font-black text-emerald-400">{formatCurrency(detail.netSalary)}</span>
                        </div>
                    </div>
                </div>
            </TableCell>
        </TableRow>
    );
}
