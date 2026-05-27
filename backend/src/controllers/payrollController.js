import { prisma } from '../config/prisma.js';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import * as jspdf from 'jspdf';
import {
    runPayrollForPeriode,
    hitungGajiKaryawan,
    closingPeriode,
    reopenPeriode,
} from '../services/payrollEngine.js';

// Get aggregated payroll periods
export const getPayrollPeriods = async (req, res) => {
    try {
        const isEmployee = req.user.role === 'EMPLOYEE';
        const emplId = req.user.emplId;

        if (isEmployee && !emplId) {
            return res.status(400).json({
                success: false,
                message: 'Your account is not linked to an employee record'
            });
        }

        // Group salaries by period
        const periods = await prisma.gaji.groupBy({
            by: ['period'],
            where: isEmployee ? { emplId: emplId } : {},
            _count: {
                _all: true
            },
            _sum: {
                gBersih: true, 
                gKotor: true
            },
            orderBy: {
                period: 'desc'
            }
        });

        // Enrich with Period details
        const periodDetails = await prisma.periode.findMany({
            where: {
                periodeId: { in: periods.map(p => p.period) }
            }
        });

        // Merge data
        const result = periods.map(p => {
            const detail = periodDetails.find(d => d.periodeId === p.period);
            return {
                id: p.period,
                name: (detail && detail.nama) ? detail.nama : p.period,
                year: detail ? detail.tahun : null,
                month: detail ? detail.bulan : null,
                startDate: detail ? detail.awal : null,
                endDate: detail ? detail.akhir : null,
                totalEmployees: p._count._all,
                totalAmount: p._sum.gBersih || 0,
                status: detail?.tutup ? 'Closed' : 'Open'
            };
        });

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error fetching payroll periods:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payroll periods',
            error: error.message
        });
    }
};

// Buat periode payroll baru (hanya buat periode, belum kalkulasi)
export const createPayrollPeriod = async (req, res) => {
    try {
        const { name, startDate, endDate, notes, kdCmpy } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'startDate dan endDate wajib diisi' });
        }

        const periodId = format(new Date(startDate), 'yyyyMM');

        const existing = await prisma.periode.findUnique({ where: { periodeId: periodId } });
        if (existing) {
            return res.status(400).json({ success: false, message: `Periode ${periodId} sudah ada` });
        }

        const newPeriod = await prisma.periode.create({
            data: {
                periodeId: periodId,
                nama: name || `Periode ${periodId}`,
                tahun: new Date(startDate).getFullYear(),
                bulan: new Date(startDate).getMonth() + 1,
                awal: new Date(startDate),
                akhir: new Date(endDate),
                tutup: false,
                kdCmpy: kdCmpy || null,
            }
        });

        res.status(201).json({
            success: true,
            data: newPeriod,
            message: `Periode ${periodId} berhasil dibuat. Gunakan endpoint /calculate untuk menjalankan kalkulasi gaji.`,
        });

    } catch (error) {
        console.error('Error creating payroll period:', error);
        res.status(500).json({ success: false, message: 'Gagal membuat periode', error: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// KALKULASI PAYROLL — menggunakan Payroll Engine
// ════════════════════════════════════════════════════════════════

/**
 * POST /api/payroll/periods/:id/calculate
 * Jalankan kalkulasi gaji untuk seluruh karyawan aktif
 */
export const calculatePayroll = async (req, res) => {
    try {
        const { id: periodeId } = req.params;
        const { kdCmpy } = req.query;
        const changedBy = req.user?.email || req.user?.id || 'SYSTEM';
        const ipAddress = req.ip || req.headers['x-forwarded-for'];

        // Cek akses — hanya HR_MANAGER ke atas
        const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'];
        if (!allowedRoles.includes(req.user?.role)) {
            return res.status(403).json({ success: false, message: 'Akses ditolak' });
        }

        const result = await runPayrollForPeriode(periodeId, kdCmpy || null, changedBy, ipAddress);

        res.status(200).json({
            success: true,
            message: `Kalkulasi selesai: ${result.berhasil} berhasil, ${result.gagal} gagal`,
            data: result,
        });

    } catch (error) {
        console.error('Error calculating payroll:', error);
        res.status(500).json({ success: false, message: error.message || 'Gagal kalkulasi payroll' });
    }
};

/**
 * POST /api/payroll/periods/:id/close
 * Closing periode — kunci data agar tidak bisa diubah
 */
export const closePeriod = async (req, res) => {
    try {
        const { id: periodeId } = req.params;
        const changedBy = req.user?.email || req.user?.id || 'SYSTEM';
        const ipAddress = req.ip || req.headers['x-forwarded-for'];

        // Hanya SUPER_ADMIN dan ADMIN
        if (!['SUPER_ADMIN', 'ADMIN'].includes(req.user?.role)) {
            return res.status(403).json({ success: false, message: 'Hanya ADMIN yang dapat closing periode' });
        }

        const result = await closingPeriode(periodeId, changedBy, ipAddress);

        res.status(200).json({
            success: true,
            message: `Periode ${periodeId} berhasil di-closing`,
            data: result,
        });

    } catch (error) {
        console.error('Error closing period:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/payroll/periods/:id/reopen
 * Buka kembali periode yang sudah di-closing (hanya SUPER_ADMIN)
 */
export const reopenPeriod = async (req, res) => {
    try {
        const { id: periodeId } = req.params;
        const changedBy = req.user?.email || req.user?.id || 'SYSTEM';
        const ipAddress = req.ip || req.headers['x-forwarded-for'];

        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Hanya SUPER_ADMIN yang dapat reopen periode' });
        }

        const result = await reopenPeriode(periodeId, changedBy, ipAddress);

        res.status(200).json({
            success: true,
            message: `Periode ${periodeId} berhasil dibuka kembali`,
            data: result,
        });

    } catch (error) {
        console.error('Error reopening period:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/payroll/periods/:id/preview/:emplId
 * Preview kalkulasi gaji untuk satu karyawan (tanpa menyimpan)
 */
export const previewPayrollEmployee = async (req, res) => {
    try {
        const { id: periodeId, emplId } = req.params;

        // Karyawan hanya boleh preview gajinya sendiri
        if (req.user?.role === 'EMPLOYEE' && req.user?.emplId !== emplId) {
            return res.status(403).json({ success: false, message: 'Akses ditolak' });
        }

        const periode = await prisma.periode.findUnique({ where: { periodeId } });
        if (!periode) return res.status(404).json({ success: false, message: 'Periode tidak ditemukan' });

        const employee = await prisma.karyawan.findUnique({
            where: { emplId },
            include: { ptkpRef: { select: { type: true, wPajak: true } } },
        });
        if (!employee) return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });

        const [absenRows, lemburRows, tunjanganRows, potonganRows, pinjamDetRows, tarifTERRows] = await Promise.all([
            prisma.absent.findMany({ where: { periode: periodeId, emplId } }),
            prisma.lembur.findMany({ where: { periode: periodeId, emplId, approved: true } }),
            prisma.tunjangan.findMany({ where: { period: periodeId, emplId, status: true } }),
            prisma.potongan.findMany({ where: { period: periodeId, emplId, status: true } }),
            prisma.pinjamDet.findMany({ where: { periode: periodeId, emplId } }),
            prisma.tarifTER.findMany({ where: { tahun: periode.tahun, isActive: true } }),
        ]);

        const konfigBpjs = await prisma.konfigBpjs.findFirst({
            where: { kdCmpy: employee.kdCmpy, isActive: true },
            orderBy: { validDate: 'desc' },
        });

        const parameter = await prisma.parameter.findFirst({
            where: { kdCmpy: employee.kdCmpy, isActive: true },
            orderBy: { validDate: 'desc' },
        });

        const payload = await hitungGajiKaryawan({
            employee, periode, absenRows, lemburRows, tunjanganRows,
            potonganRows, pinjamDetRows, tarifTERRows, konfigBpjs,
            umk: Number(parameter?.umk || 0),
        });

        const { _validasi, tglProses, ...previewData } = payload;

        res.status(200).json({
            success: true,
            data: {
                ...previewData,
                validasi: _validasi,
                karyawan: { nama: employee.nama, nik: employee.nik },
                periode:  { id: periode.periodeId, nama: periode.nama },
            },
        });

    } catch (error) {
        console.error('Error preview payroll:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/payroll/config/bpjs
 * Ambil konfigurasi BPJS aktif per perusahaan
 */
export const getKonfigBpjs = async (req, res) => {
    try {
        const { kdCmpy } = req.query;
        const data = await prisma.konfigBpjs.findMany({
            where: { ...(kdCmpy ? { kdCmpy } : {}), isActive: true },
            orderBy: [{ kdCmpy: 'asc' }, { validDate: 'desc' }],
            include: { company: { select: { company: true } } },
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/payroll/config/bpjs
 * Simpan konfigurasi BPJS baru
 */
export const saveKonfigBpjs = async (req, res) => {
    try {
        if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(req.user?.role)) {
            return res.status(403).json({ success: false, message: 'Akses ditolak' });
        }
        const data = await prisma.konfigBpjs.create({ data: req.body });
        res.status(201).json({ success: true, data, message: 'Konfigurasi BPJS berhasil disimpan' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/payroll/config/tarif-ter
 * Ambil semua tarif TER
 */
export const getTarifTER = async (req, res) => {
    try {
        const { tahun } = req.query;
        const data = await prisma.tarifTER.findMany({
            where: { ...(tahun ? { tahun: parseInt(tahun) } : {}), isActive: true },
            orderBy: [{ kategori: 'asc' }, { batasMin: 'asc' }],
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/payroll/log/:periodeId
 * Ambil audit trail perubahan payroll
 */
export const getPayrollLog = async (req, res) => {
    try {
        const { periodeId } = req.params;
        const { emplId } = req.query;
        const data = await prisma.payrollLog.findMany({
            where: { period: periodeId, ...(emplId ? { emplId } : {}) },
            orderBy: { changedAt: 'desc' },
            take: 200,
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get payroll detail for a specific period (UPDATED for RICH SLIP)
export const getPayrollDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Get Period Info with Summary stats
        const period = await prisma.periode.findUnique({
            where: { periodeId: id }
        });

        if (!period) {
            return res.status(404).json({
                success: false,
                message: 'Payroll period not found'
            });
        }

        // 2. Get Salary Details
        const isEmployee = req.user.role === 'EMPLOYEE';
        const emplId = req.user.emplId;

        if (isEmployee && !emplId) {
            return res.status(400).json({
                success: false,
                message: 'Your account is not linked to an employee record'
            });
        }

        const salaries = await prisma.gaji.findMany({
            where: { 
                period: id,
                ...(isEmployee ? { emplId } : {})
            },
            orderBy: { emplId: 'asc' }
        });

        // Fetch employees manually
        const employeeIds = salaries.map(s => s.emplId);
        
        let employees = [];
        let ptkpMap = [];

        if (employeeIds.length > 0) {
            employees = await prisma.karyawan.findMany({
                where: { emplId: { in: employeeIds } },
                select: {
                    emplId: true,
                    nama: true,
                    jabatan: { select: { nmJab: true }},
                    dept: { select: { nmDept: true }},
                    sie: { select: { nmSeksie: true }},
                    nik: true,
                    tglMsk: true, // TMK
                    kdPtkp: true
                }
            });

            // Fetch PTKP Map
            ptkpMap = await prisma.ptkp.findMany();
        }
        
        // 3. Construct Response
        const employeeDetails = salaries.map(s => {
            const emp = employees.find(u => u.emplId === s.emplId);
            const ptkpInfo = ptkpMap.find(p => p.kode === emp?.kdPtkp);
            
            // Calculate components for Section A (Pendapatan/Income)
            const pokokTrm = Number(s.pokokTrm || 0); // Upah Dibayarkan
            
            const allowances = {
                tJabatan: Number(s.tJabatan || 0),
                tTransport: Number(s.tTransport || 0),
                tMakan: Number(s.tMakan || 0),
                tKhusus: Number(s.tKhusus || 0),
                totUShift: Number(s.totUShift || 0),
                mealOt: Number(s.mealOt || 0),
                tunjMedik: Number(s.tunjMedik || 0),
                rapel: Number(s.rapel || 0) + Number(s.tunjRapel || 0),
                lembur: Number(s.totULembur || 0),
                thr: Number(s.thr || 0),
                tLain: Number(s.tunjLain || 0) + Number(s.tLain || 0),
                admBank: Number(s.admBank || 0)
            };

            const deductions = {
                jht: Number(s.jhtEmpl || 0),
                jpn: Number(s.jpnEmpl || 0),
                bpjs: Number(s.jknEmpl || 0),
                jkk: Number(s.jkk || 0),
                jkm: Number(s.jkm || 0),
                jpk: Number(s.jpk || 0),
                pph21: Number(s.tPph21 || 0),
                pphEmpl: Number(s.pphEmpl || 0),
                pphThr: Number(s.pphThr || 0),
                potPinjaman: Number(s.potRumah || 0) + Number(s.pinjam || 0),
                iuranKoperasi: Number(s.koperasi || 0),
                potAbsen: Number(s.ptAbsen || 0),
                lain: Number(s.ptLain || 0)
            };
            
            // JUMLAH A = Semua Tunjangan + Lembur + THR + Upah Dibayarkan
            const totalAllowances = pokokTrm + 
                                   allowances.tJabatan + 
                                   allowances.tTransport + 
                                   allowances.tMakan + 
                                   allowances.tKhusus + 
                                   allowances.totUShift + 
                                   allowances.mealOt + 
                                   allowances.tunjMedik + 
                                   allowances.lembur + 
                                   allowances.rapel + 
                                   allowances.thr + 
                                   allowances.tLain + 
                                   allowances.admBank;
            
            // JUMLAH B = Semua Potongan kecuali yang dibayar perusahaan (JKK, JKM, JPK)
            const totalDeductions = deductions.jht + 
                                   deductions.jpn + 
                                   deductions.bpjs + 
                                   deductions.pph21 + 
                                   deductions.pphEmpl + 
                                   deductions.pphThr + 
                                   deductions.potPinjaman + 
                                   deductions.iuranKoperasi + 
                                   deductions.potAbsen + 
                                   deductions.lain;

            return {
                id: s.id,
                employeeId: s.emplId,
                employeeName: emp?.nama || 'Unknown',
                employeeIdNumber: emp?.nik || '-',
                position: emp?.jabatan?.nmJab || '-',
                department: emp?.dept?.nmDept || '-',
                section: emp?.sie?.nmSeksie || '-',
                
                // New Fields for Slip
                joinDate: emp?.tglMsk,
                taxStatus: ptkpInfo ? ptkpInfo.type : (emp?.kdPtkp ? `${emp.kdPtkp}` : '-'),
                
                baseSalary: Number(s.pokokBln || 0),
                pokokTrm: pokokTrm, // Add this field explicitly
                
                // Detailed Breakdown
                allowances,
                deductions,

                // Explicit Summary
                totalAllowances,
                totalDeductions,
                
                netSalary: Number(s.gBersih || 0), 
                grossSalary: Number(s.gKotor || 0),

                // Extra
                lemburHours: Number(s.totJLembur || 0)
            };
        });

        const summary = {
            period: {
                id: period.periodeId,
                name: period.nama || `Periode ${period.periodeId}`,
                startDate: period.awal,
                endDate: period.akhir,
                status: period.tutup ? 'Closed' : 'Open'
            },
            employeeCount: salaries.length,
            totalNetSalary: salaries.reduce((sum, s) => sum + Number(s.gBersih), 0),
            totalDeductions: employeeDetails.reduce((sum, e) => sum + e.totalDeductions, 0),
            totalAllowances: employeeDetails.reduce((sum, e) => sum + e.totalAllowances, 0)
        };

        res.status(200).json({
            success: true,
            data: {
                summary,
                employees: employeeDetails
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payroll details',
            error: error.message
        });
    }
};

// Generate password protected PDF payslip
export const generateProtectedPayslip = async (req, res, next) => {
    try {
        const { periodId, employeeId } = req.body;
        const currentUser = req.user;
        
        // Security check: Employees can only generate their own slip
        if (currentUser.role === 'EMPLOYEE' && currentUser.emplId !== employeeId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only generate your own payslip'
            });
        }

        // 1. Fetch Employee Details including Birth Date
        const employee = await prisma.karyawan.findUnique({
            where: { emplId: employeeId },
            include: {
                jabatan: { select: { nmJab: true }},
                dept: { select: { nmDept: true }},
                sie: { select: { nmSeksie: true }},
            }
        });

        if (!employee || !employee.tglLhr) {
            return res.status(404).json({
                success: false,
                message: 'Employee birth date not found for password protection'
            });
        }

        // Use UTC-safe formatting to avoid timezone shifts
        const rawDate = new Date(employee.tglLhr);
        const day = String(rawDate.getUTCDate()).padStart(2, '0');
        const month = String(rawDate.getUTCMonth() + 1).padStart(2, '0');
        const year = rawDate.getUTCFullYear();
        const password = `${day}${month}${year}`;

        // 2. Fetch Salary Data
        const salary = await prisma.gaji.findFirst({
            where: { period: periodId, emplId: employeeId }
        });

        if (!salary) {
            return res.status(404).json({
                success: false,
                message: 'Salary record not found for this period'
            });
        }

        const period = await prisma.periode.findUnique({
            where: { periodeId: periodId }
        });

        // Helper for safe date formatting
        const safeFormat = (date, formatStr) => {
            try {
                if (!date) return '-';
                const d = new Date(date);
                if (isNaN(d.getTime())) return '-';
                return format(d, formatStr);
            } catch (e) {
                return '-';
            }
        };

        // 3. Generate PDF using jsPDF (Server-side)

        const doc = new jspdf.jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [210, 148],
            encryption: {
                userPassword: password,
                ownerPassword: 'ADMIN_OWNER_KEY_12345',
                userPermissions: ['print']
            }
        });

        // --- PDF LAYOUT LOGIC (Replicated from frontend) ---
        const width = 210;
        const height = 148;
        const margin = 15;
        const bgDarkBlue = '#001f3f';
        const textWhite = '#FFFFFF';

        doc.setFillColor(bgDarkBlue);
        doc.rect(0, 0, width, height, 'F');
        
        // Rails and Watermark (Subtle pattern)
        doc.setTextColor('#1a2f44');
        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        const patternText = "PT. GRAFINDO MITRASEMESTA   ";
        const textWidth = doc.getTextWidth(patternText);
        for (let y = 4; y < height; y += 3.5) {
            const xOffset = (y % 7 === 0) ? 0 : 10;
            for (let x = -20; x < width; x += textWidth) {
                doc.text(patternText, x + xOffset, y);
            }
        }

        doc.setFillColor(textWhite);
        doc.rect(0, 0, 13, height, 'F');
        doc.rect(width - 13, 0, 13, height, 'F');

        // Continuous Form Holes (Black)
        doc.setFillColor('#000000');
        const holeRadius = 2;
        const holeSpacing = 12.7; // 1/2 inch standard
        const startHoleY = 6;
        for (let y = startHoleY; y < height; y += holeSpacing) {
            doc.circle(6, y, holeRadius, 'F');
            doc.circle(width - 6, y, holeRadius, 'F');
        }

        // Perforation Lines
        doc.setDrawColor('#cccccc');
        doc.setLineWidth(0.5);
        doc.setLineDashPattern([2, 2], 0);
        doc.line(13, 0, 13, height);
        doc.line(width - 13, 0, width - 13, height);
        doc.setLineDashPattern([], 0); // Reset to solid

        doc.setTextColor(textWhite);
        doc.setFont('courier', 'bold');
        doc.setFontSize(12);
        doc.text('SLIP GAJI KARYAWAN', width / 2, 15, { align: 'center' });
        
        const periodNameStr = (period && period.nama) ? period.nama : String(periodId);
        doc.text(`BULAN ${periodNameStr.toUpperCase()}`, width / 2, 20, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('courier', 'normal');
        doc.text(`Nama    : ${employee.nama}`, 20, 30);
        doc.text(`N I K   : ${employee.nik || '-'}`, 20, 35);
        if (employee.tglMsk) {
            doc.text(`TMK ${safeFormat(employee.tglMsk, 'dd/MM/yyyy')}`, 70, 35);
        }

        doc.text(`Bagian  : ${employee.sie?.nmSeksie || employee.dept?.nmDept || '-'}`, 125, 30);
        doc.text(`Jabatan : ${employee.jabatan?.nmJab || '-'}`, 125, 35);

        // Body with amounts
        const formatRp = (num) => new Intl.NumberFormat('id-ID').format(Number(num || 0));
        let yPos = 55;
        doc.text('A. Pendapatan', 20, yPos);
        doc.text('B. Potongan', 110, yPos);
        yPos += 7;

        const earnings = [
            { label: 'Gaji Pokok', value: salary.pokokBln },
            { label: 'Upah Dibayarkan', value: salary.pokokTrm || salary.pokokBln },
            { label: 'Tunjangan Jabatan', value: salary.tJabatan },
            { label: 'Tunjangan Khusus', value: salary.tKhusus },
            { label: `Lembur`, value: salary.totULembur },
            { label: 'Rapel', value: Number(salary.rapel || 0) + Number(salary.tunjRapel || 0) },
            { label: 'Lain-lain', value: salary.tunjLain || salary.tLain }
        ];

        const deductions = [
            { label: 'JHT (Jaminan Hari Tua)', value: salary.jhtEmpl },
            { label: 'JPN (Jaminan Pensiun)', value: salary.jpnEmpl },
            { label: 'BPJS Kesehatan', value: salary.jknEmpl },
            { label: 'JKK (Jaminan Kec. Kerja)', value: salary.jkk },
            { label: 'JKM (Jaminan Kematian)', value: salary.jkm },
            { label: 'JPK (Jaminan Pemeliharaan)', value: salary.jpk },
            { label: 'Pph 21', value: salary.tPph21 },
            { label: 'Pph Employee', value: salary.pphEmpl },
            { label: 'Pot. Pinjaman', value: salary.potRumah },
            { label: 'Pot. Absensi', value: salary.ptAbsen }
        ];

        for (let i = 0; i < Math.max(earnings.length, deductions.length); i++) {
            if (earnings[i]) {
                doc.text(earnings[i].label, 25, yPos);
                doc.text(formatRp(earnings[i].value), 100, yPos, { align: 'right' });
            }
            if (deductions[i]) {
                doc.text(deductions[i].label, 115, yPos);
                doc.text(formatRp(deductions[i].value), 190, yPos, { align: 'right' });
            }
            yPos += 5;
        }
        
        yPos += 10; // Slightly less padding if many lines
        const totalA = Number(salary.pokokTrm || salary.pokokBln || 0) + Number(salary.tJabatan || 0) + Number(salary.tKhusus || 0) + Number(salary.totULembur || 0) + Number(salary.rapel || 0) + Number(salary.tunjRapel || 0) + Number(salary.tunjLain || 0) + Number(salary.tLain || 0);
        // Exclude employer-paid BPJS (jkk, jkm, jpk) from totalB
        const totalB = Number(salary.jhtEmpl || 0) + Number(salary.jpnEmpl || 0) + Number(salary.jknEmpl || 0) + Number(salary.tPph21 || 0) + Number(salary.pphEmpl || 0) + Number(salary.potRumah || 0) + Number(salary.ptAbsen || 0);

        // Draw lines with more gap from text
        doc.line(60, yPos - 4, 100, yPos - 4);
        doc.line(150, yPos - 4, 190, yPos - 4);

        doc.text('JUMLAH A', 60, yPos);
        doc.text(formatRp(totalA), 100, yPos, { align: 'right' });
        doc.text('JUMLAH B', 150, yPos);
        doc.text(formatRp(totalB), 190, yPos, { align: 'right' });

        yPos += 10;
        doc.setFont('courier', 'bold');
        doc.text('GAJI DIBAYARKAN', 150, yPos, { align: 'right' });
        doc.text(formatRp(salary.gBersih), 190, yPos, { align: 'right' });

        // --- PDF GENERATION COMPLETE ---

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        // 5. Send result

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Slip_Gaji_${periodId}_${employeeId}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('CRITICAL Error generating protected PDF:', error);
        next(error);
    }
};

// ── Skala Upah ─────────────────────────────────────────────────

export const getSkalaUpah = async (req, res) => {
    try {
        const { tahun } = req.query;
        let where = {};
        
        if (tahun) {
            where = {
                validDate: {
                    gte: new Date(`${tahun}-01-01`),
                    lte: new Date(`${tahun}-12-31`)
                }
            };
        }
        
        const data = await prisma.skalaUpah.findMany({
            where,
            orderBy: [{ kdCmpy: 'asc' }, { upahMin: 'asc' }],
        });
        
        // Map database fields back to frontend expected fields
        const mappedData = data.map(item => ({
            ...item,
            tahun: new Date(item.validDate).getFullYear(),
            umk: parseFloat(item.upahMid || 0),
            upahMin: parseFloat(item.upahMin || 0),
            upahMaks: parseFloat(item.upahMax || 0),
            nmJab: item.namaGol || '' // Or fetch from MstJab if needed, but for now map it safely
        }));
        
        res.status(200).json({ success: true, data: mappedData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const saveSkalaUpah = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        
        // Format data for Prisma
        const prismaData = {
            kdCmpy: data.kdCmpy,
            kdJab: data.kdJab || null,
            golongan: data.golongan || '',
            namaGol: data.nmJab || data.namaGol || null, // save nmJab to namaGol as fallback
            upahMin: parseFloat(data.upahMin || 0),
            upahMid: parseFloat(data.umk || 0), // map umk to upahMid
            upahMax: parseFloat(data.upahMaks || data.upahMax || 0), // map upahMaks to upahMax
            validDate: data.validDate ? new Date(data.validDate) : new Date(),
            isActive: data.isActive !== undefined ? data.isActive : true
        };

        let result;
        if (id) {
            result = await prisma.skalaUpah.update({
                where: { id },
                data: prismaData,
            });
        } else {
            result = await prisma.skalaUpah.create({
                data: prismaData,
            });
        }
        
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSkalaUpah = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.skalaUpah.delete({
            where: { id },
        });
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

