import { prisma } from '../config/prisma.js';
import { format } from 'date-fns';

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
        console.error('Error fetching payroll details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payroll details',
            error: error.message
        });
    }
};
