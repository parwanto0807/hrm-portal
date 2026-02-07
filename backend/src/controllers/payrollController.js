import { prisma } from '../config/prisma.js';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import * as jspdf from 'jspdf';
import muhammara from 'muhammara';

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
                name: detail ? detail.nama : p.period,
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

// Create new payroll period and generate salaries
export const createPayrollPeriod = async (req, res) => {
    try {
        const { name, startDate, endDate, notes } = req.body;
        
        // 1. Create Period
        const periodId = format(new Date(startDate), 'yyyyMM'); // e.g. 202601
        
        // Check if period already exists
        const existingPeriod = await prisma.periode.findUnique({
            where: { periodeId: periodId }
        });

        if (existingPeriod) {
            return res.status(400).json({
                success: false,
                message: `Period ${periodId} already exists`
            });
        }

        const newPeriod = await prisma.periode.create({
            data: {
                periodeId: periodId,
                nama: name,
                tahun: new Date(startDate).getFullYear(),
                bulan: new Date(startDate).getMonth() + 1,
                awal: new Date(startDate),
                akhir: new Date(endDate),
                tutup: false,
                keterangan: notes
            }
        });

        // 2. Get Active Employees from Karyawan table
        const employees = await prisma.karyawan.findMany({
            where: { 
                kdSts: 'AKTIF'
            }
        });

// 3. Generate Salary Entries (Basic implementation)
        const salaryEntries = employees.map(emp => ({
            id: `${periodId}-${emp.emplId}`, // Use emplId for uniqueness combination
            period: periodId,
            emplId: emp.emplId,
            pokokBln: emp.pokokBln || 0,
            gBersih: emp.pokokBln || 0, // Initial net = gross for now
            gKotor: emp.pokokBln || 0,
            tglInput: new Date(),
            userInput: req.user?.id || 'SYSTEM' // Fallback if req.user is missing
        }));

        if (salaryEntries.length > 0) {
            await prisma.gaji.createMany({
                data: salaryEntries
            });
        }

        res.status(201).json({
            success: true,
            data: newPeriod,
            message: `Generated payroll for ${employees.length} employees`
        });

    } catch (error) {
        console.error('Error creating payroll period:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payroll period',
            error: error.message
        });
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
                rapel: Number(s.rapel || 0) + Number(s.tunjRapel || 0),
                lembur: Number(s.totULembur || 0),
                tLain: Number(s.tunjLain || 0) + Number(s.tLain || 0),
                admBank: Number(s.admBank || 0)
            };

            const deductions = {
                jht: Number(s.jhtEmpl || 0),
                jpn: Number(s.jpnEmpl || 0),
                bpjs: Number(s.jknEmpl || 0),
                pph21: Number(s.tPph21 || 0),
                potPinjaman: Number(s.potRumah || 0),
                iuranKoperasi: 0, // Placeholder
                lain: 0
            };
            
            // JUMLAH A = Upah Dibayarkan + Tunjangan Jabatan + Tunjangan Khusus + Lembur + Rapel + Lain-lain + Adm Bank
            const totalAllowances = pokokTrm + 
                                   allowances.tJabatan + 
                                   allowances.tKhusus + 
                                   allowances.lembur + 
                                   allowances.rapel + 
                                   allowances.tLain + 
                                   allowances.admBank;
            
            const totalDeductions = Object.values(deductions).reduce((acc, val) => acc + val, 0);

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
        console.log(`Generating PDF for ${employeeId} period ${periodId}`);
        const doc = new jspdf.jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [210, 148]
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
            { label: 'Pph 21', value: salary.tPph21 },
            { label: 'Pot. Pinjaman', value: salary.potRumah }
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
        
        yPos += 15; // Increased padding top for Totals section
        const totalA = Number(salary.pokokTrm || salary.pokokBln || 0) + Number(salary.tJabatan || 0) + Number(salary.tKhusus || 0) + Number(salary.totULembur || 0) + Number(salary.rapel || 0) + Number(salary.tunjRapel || 0) + Number(salary.tunjLain || 0) + Number(salary.tLain || 0);
        const totalB = Number(salary.jhtEmpl || 0) + Number(salary.jpnEmpl || 0) + Number(salary.jknEmpl || 0) + Number(salary.tPph21 || 0) + Number(salary.potRumah || 0);

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

        // 4. Encrypt using Muhammara (Recrypt)
        console.log('PDF generated, encrypting with recrypt...');
        const inStream = new muhammara.PDFRStreamForBuffer(pdfBuffer);
        const outStream = new muhammara.PDFWStreamForBuffer();
        
        muhammara.recrypt(inStream, outStream, {
            userPassword: password,
            ownerPassword: 'ADMIN_OWNER_KEY_12345',
            userProtectionFlag: 4 // Print only
        });

        console.log('PDF encrypted successfully');
        const finalBuffer = outStream.buffer;

        // 5. Send result
        console.log('Sending PDF to client...');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Slip_Gaji_${periodId}_${employeeId}.pdf`);
        res.send(finalBuffer);

    } catch (error) {
        console.error('CRITICAL Error generating protected PDF:', error);
        next(error);
    }
};
