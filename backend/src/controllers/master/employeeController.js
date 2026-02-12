// src/controllers/master/employeeController.js
import { prisma } from '../../config/prisma.js';
import { format } from 'date-fns';

// Get all employees with pagination, search, and filters
export const getEmployees = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            kdCmpy = '', 
            kdFact = '', 
            kdBag = '',
            kdDept = '',
            kdSeksie = '',
            kdJab = '',
            kdSts = '',
            kdOut = ''
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        console.log('GET EMPLOYEES QUERY:', req.query);

        // Build where clause
        const where = {
            AND: [
                search ? {
                    OR: [
                        { emplId: { contains: search, mode: 'insensitive' } },
                        { nik: { contains: search, mode: 'insensitive' } },
                        { nama: { contains: search, mode: 'insensitive' } }
                    ]
                } : {},
                kdCmpy ? { kdCmpy } : {},
                kdFact ? { kdFact } : {},
                kdBag ? { kdBag } : {},
                kdDept ? { kdDept } : {},
                kdSeksie ? { kdSeksie } : {},
                kdJab ? { kdJab } : {},
                kdSts ? { kdSts } : {},
                kdOut !== '' ? { kdOut: kdOut === 'true' } : {}
            ]
        };

        console.log('GET EMPLOYEES WHERE:', JSON.stringify(where, null, 2));

        // Get total count
        const total = await prisma.karyawan.count({ where });

        // Get employees with relations
        const employees = await prisma.karyawan.findMany({
            where,
            skip,
            take,
            include: {
                company: { select: { kodeCmpy: true, company: true } },
                fact: { select: { kdFact: true, nmFact: true } },
                bag: { select: { kdBag: true, nmBag: true } },
                dept: { select: { kdDept: true, nmDept: true } },
                sie: { select: { kdSeksie: true, nmSeksie: true } },
                jabatan: { select: { kdJab: true, nmJab: true } },
                bank: { select: { bankCode: true, bankNama: true } },
                agama: { select: { kdAgm: true, nmAgm: true } }, // Added
                pkt: { select: { kdPkt: true, nmPkt: true } },   // Added
                superior: { select: { nama: true, emplId: true } },
                superior2: { select: { nama: true, emplId: true } },
                jnsJamRef: { select: { id: true, kdJam: true, jnsJam: true } },
                groupShiftRef: { select: { id: true, groupShift: true, groupName: true } }
            },
            orderBy: [
                { dept: { nmDept: 'asc' } },
                { nama: 'asc' }
            ]
        });

        if (employees.length > 0) {
            console.log('FIRST EMPLOYEE DATA:', JSON.stringify(employees[0], null, 2));
        }

        // Map relations for frontend compatibility
        const mappedEmployees = employees.map(emp => ({
            ...emp,
            jnsJam: emp.jnsJamRef,
            groupShift: emp.groupShiftRef,
            jnsJamRef: undefined,
            groupShiftRef: undefined
        }));

        res.status(200).json({
            success: true,
            data: mappedEmployees,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employees',
            error: error.message
        });
    }
};

// Get single employee by ID with full details
export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await prisma.karyawan.findUnique({
            where: { id },
            include: {
                company: true,
                fact: true,
                bag: true,
                dept: true,
                sie: true,
                jabatan: true,
                pkt: true,
                agama: true,
                sekolah: true,
                bank: true,
                keluarga: true,
                sekolahHist: true,
                kontrak: true,
                superior2: true,
                jnsJamRef: true,
                groupShiftRef: true
            }
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Map relations for frontend compatibility
        const mappedEmployee = {
            ...employee,
            jnsJam: employee.jnsJamRef,
            groupShift: employee.groupShiftRef,
            jnsJamRef: undefined,
            groupShiftRef: undefined
        };

        res.status(200).json({
            success: true,
            data: mappedEmployee
        });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee',
            error: error.message
        });
    }
};

// Get employee payroll summary
export const getEmployeePayroll = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await prisma.karyawan.findUnique({
            where: { id },
            select: {
                id: true,
                emplId: true,
                nama: true,
                pokokBln: true,
                tTransport: true,
                tMakan: true,
                tJabatan: true,
                tKeluarga: true,
                tKomunikasi: true,
                tKhusus: true,
                tLmbtetap: true,
                fixOther: true,
                kdTransp: true,
                kdMakan: true
            }
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Calculate total salary
        const totalSalary = 
            parseFloat(employee.pokokBln || 0) +
            (employee.kdTransp ? parseFloat(employee.tTransport || 0) : 0) +
            (employee.kdMakan ? parseFloat(employee.tMakan || 0) : 0) +
            parseFloat(employee.tJabatan || 0) +
            parseFloat(employee.tKeluarga || 0) +
            parseFloat(employee.tKomunikasi || 0) +
            parseFloat(employee.tKhusus || 0) +
            parseFloat(employee.tLmbtetap || 0) +
            parseFloat(employee.fixOther || 0);

        // Build payroll breakdown
        const payroll = {
            baseSalary: parseFloat(employee.pokokBln || 0),
            allowances: {
                transport: employee.kdTransp ? parseFloat(employee.tTransport || 0) : 0,
                meal: employee.kdMakan ? parseFloat(employee.tMakan || 0) : 0,
                position: parseFloat(employee.tJabatan || 0),
                family: parseFloat(employee.tKeluarga || 0),
                communication: parseFloat(employee.tKomunikasi || 0),
                special: parseFloat(employee.tKhusus || 0),
                overtime: parseFloat(employee.tLmbtetap || 0),
                other: parseFloat(employee.fixOther || 0)
            },
            totalSalary,
            _verified: totalSalary > 0,
            _warnings: []
        };

        // Add warnings for data quality
        if (totalSalary === 0) {
            payroll._warnings.push('Total salary is 0 - check employee status');
        }
        if (employee.pokokBln === 0) {
            payroll._warnings.push('Base salary is 0 - verify data mapping');
        }

        res.status(200).json({
            success: true,
            data: {
                employee: {
                    id: employee.id,
                    emplId: employee.emplId,
                    nama: employee.nama
                },
                payroll
            }
        });
    } catch (error) {
        console.error('Error fetching employee payroll:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee payroll',
            error: error.message
        });
    }
};

// Get employee payroll history (from Gaji table)
export const getPayrollHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Get Employee to find emplId
        const employee = await prisma.karyawan.findUnique({
            where: { id },
            select: { emplId: true, nama: true }
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // 2. Fetch Payroll History
        const history = await prisma.gaji.findMany({
            where: { emplId: employee.emplId },
            include: {
                periodeRef: {
                    select: {
                        nama: true,
                        tahun: true,
                        bulan: true
                    }
                }
            },
            orderBy: { tglProses: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: history.map(record => ({
                id: record.id,
                period: record.period,
                periodName: record.periodeRef?.nama || record.period,
                processDate: record.tglProses,
                basicSalary: parseFloat(record.pokokBln || 0),
                grossSalary: parseFloat(record.gKotor || 0),
                netSalary: parseFloat(record.gBersih || 0),
                takeHomePay: parseFloat(record.gBersih || 0) // Assuming THP = GBersih for now
            }))
        });

    } catch (error) {
        console.error('Error fetching payroll history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payroll history',
            error: error.message
        });
    }
};

// Create new employee
export const createEmployee = async (req, res) => {
    try {
        const data = req.body;

        // Check if employee ID already exists
        const existing = await prisma.karyawan.findUnique({
            where: { emplId: data.emplId }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID already exists'
            });
        }

        // Sanitize data for Prisma
        const sanitizedData = {
            ...data,
            // Dates
            tglLhr: data.tglLhr ? new Date(data.tglLhr) : null,
            tglMsk: data.tglMsk ? new Date(data.tglMsk) : null,
            tglAngkat: data.tglAngkat ? new Date(data.tglAngkat) : null,
            tglOut: data.tglOut ? new Date(data.tglOut) : null,
            tglNpwp: data.tglNpwp ? new Date(data.tglNpwp) : null,
            tglNikah: data.tglNikah ? new Date(data.tglNikah) : null,
            // Numbers
            jmlAnak: Number(data.jmlAnak) || 0,
            pokokBln: Number(data.pokokBln) || 0,
            tTransport: Number(data.tTransport) || 0,
            tMakan: Number(data.tMakan) || 0,
            tJabatan: Number(data.tJabatan) || 0,
            tKeluarga: Number(data.tKeluarga) || 0,
            tKomunikasi: Number(data.tKomunikasi) || 0,
            tKhusus: Number(data.tKhusus) || 0,
            tLmbtetap: Number(data.tLmbtetap) || 0,
            fixOther: Number(data.fixOther) || 0,
            kdPtkp: Number(data.kdPtkp) || 1,
            potRumah: Number(data.potRumah) || 0,
            // Enums/Strings
            email: data.email || null,
            nik: data.nik || null,
            idAbsen: data.idAbsen || null,
            ktpNo: data.ktpNo || null,
            npwp: data.npwp || null,
            kdSex: data.kdSex || 'LAKILAKI',
            kdAgm: data.kdAgm || null,
            kdSkl: data.kdSkl || null,
            alamat1: data.alamat1 || null,
            alamat2: data.alamat2 || null,
            kota: data.kota || null,
            kdPos: data.kdPos || null,
            kdSts: data.kdSts || 'AKTIF',
            kdJns: data.kdJns || 'KONTRAK',
            kdDept: data.kdDept || null,
            kdJab: data.kdJab || null,
            kdPkt: data.kdPkt || null,
            kdCmpy: data.kdCmpy || null,
            kdFact: data.kdFact || null,
            bankCode: data.bankCode || null,
            bankUnit: data.bankUnit || null,
            bankRekNo: data.bankRekNo || null,
            bankRekName: data.bankRekName || null,
            noBpjsTk: data.noBpjsTk || null,
            noBpjsKes: data.noBpjsKes || null,
            noAnggota: data.noAnggota || null,
            superiorId: (data.superiorId === 'none' || !data.superiorId) ? null : data.superiorId,
            superior2Id: (data.superior2Id === 'none' || !data.superior2Id) ? null : data.superior2Id,
            jnsJamId: (data.jnsJamId === 'none' || !data.jnsJamId) ? null : data.jnsJamId,
            groupShiftId: (data.groupShiftId === 'none' || !data.groupShiftId) ? null : data.groupShiftId,
            // Booleans
            kdBpjsTk: data.kdBpjsTk ?? true,
            kdBpjsKes: data.kdBpjsKes ?? true,
            kdTransp: data.kdTransp ?? true,
            kdMakan: data.kdMakan ?? true,
            kdOut: data.kdOut ?? false,
            kdLmb: data.kdLmb ?? true,
            kdSpl: data.kdSpl ?? true,
            kdPjk: data.kdPjk ?? true,
            kdKoperasi: data.kdKoperasi ?? false,
            kdptRumah: data.kdptRumah ?? false,
            kdSpsi: data.kdSpsi ?? false,
            // Metadata
            createdBy: req.user?.email || 'system',
            updatedBy: req.user?.email || 'system'
        };

        const employee = await prisma.$transaction(async (tx) => {
            // ==========================================
            // 🔗 AUTOMATED LINKAGE: KARYAWAN TO USER
            // ==========================================
            if (sanitizedData.email) {
                const linkedUser = await tx.user.findFirst({
                    where: { email: { equals: sanitizedData.email, mode: 'insensitive' } }
                });
                if (linkedUser) {
                    sanitizedData.userId = linkedUser.id;
                }
            }

            const created = await tx.karyawan.create({
                data: sanitizedData,
                include: {
                    company: true,
                    fact: true,
                    bag: true,
                    dept: true,
                    jabatan: true
                }
            });
            return created;
        });

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee
        });
    } catch (error) {
        console.error('CRITICAL: Error creating employee:', error);
        if (error.code) console.error('Prisma Error Code:', error.code);
        if (error.meta) console.error('Prisma Error Meta:', error.meta);
        
        res.status(500).json({
            success: false,
            message: 'Failed to create employee',
            error: error.message
        });
    }
};

// Update employee
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Explicitly map only valid scalar fields for Karyawan model
        const updatePayload = {
            emplId: data.emplId,
            nik: data.nik || null,
            idAbsen: data.idAbsen || null,
            nama: data.nama,
            email: data.email || null,
            handphone: data.handphone || null,
            telpon: data.telpon || null,
            // Dates
            tglLhr: data.tglLhr ? new Date(data.tglLhr) : null,
            tglMsk: data.tglMsk ? new Date(data.tglMsk) : null,
            tglAngkat: data.tglAngkat ? new Date(data.tglAngkat) : null,
            tglOut: data.tglOut ? new Date(data.tglOut) : null,
            tglNpwp: data.tglNpwp ? new Date(data.tglNpwp) : null,
            tglNikah: data.tglNikah ? new Date(data.tglNikah) : null,
            // Religion/Education (Foreign Keys - Scalar)
            kdAgm: data.kdAgm || null,
            kdSkl: data.kdSkl || null,
            // Org
            kdCmpy: data.kdCmpy || null,
            kdFact: data.kdFact || null,
            kdBag: data.kdBag || null,
            kdDept: data.kdDept || null,
            kdSeksie: data.kdSeksie || null,
            kdJab: data.kdJab || null,
            kdPkt: data.kdPkt || null,
            // Shift - Correct mapping to schema fields
            groupShift: (data.groupShiftId === 'none' || !data.groupShiftId) ? null : data.groupShiftId,
            kdJam: (data.jnsJamId === 'none' || !data.jnsJamId) ? null : data.jnsJamId,
            jnsJamKdJam: (data.jnsJamId === 'none' || !data.jnsJamId) ? null : data.jnsJamId,
            // Payroll
            pokokBln: Number(data.pokokBln) || 0,
            tTransport: Number(data.tTransport) || 0,
            tMakan: Number(data.tMakan) || 0,
            tJabatan: Number(data.tJabatan) || 0,
            tKeluarga: Number(data.tKeluarga) || 0,
            tKomunikasi: Number(data.tKomunikasi) || 0,
            tKhusus: Number(data.tKhusus) || 0,
            tLmbtetap: Number(data.tLmbtetap) || 0,
            fixOther: Number(data.fixOther) || 0,
            potRumah: Number(data.potRumah) || 0,
            kdPtkp: Number(data.kdPtkp) || 1,
            // IDs/Bank
            ktpNo: data.ktpNo || null,
            npwp: data.npwp || null,
            bankCode: data.bankCode || null,
            bankUnit: data.bankUnit || null,
            bankRekNo: data.bankRekNo || null,
            bankRekName: data.bankRekName || null,
            noBpjsTk: data.noBpjsTk || null,
            noBpjsKes: data.noBpjsKes || null,
            noAnggota: data.noAnggota || null,
            // Flags
            kdSex: data.kdSex || 'LAKILAKI',
            kdSts: data.kdSts || 'AKTIF',
            kdJns: data.kdJns || 'TETAP',
            kdBpjsTk: data.kdBpjsTk ?? true,
            kdBpjsKes: data.kdBpjsKes ?? true,
            kdTransp: data.kdTransp ?? true,
            kdMakan: data.kdMakan ?? true,
            kdLmb: data.kdLmb ?? true,
            kdSpl: data.kdSpl ?? true,
            kdPjk: data.kdPjk ?? true,
            kdKoperasi: data.kdKoperasi ?? false,
            kdptRumah: data.kdptRumah ?? false,
            kdSpsi: data.kdSpsi ?? false,
            kdOut: data.kdOut ?? false,
            // Superior
            superiorId: (data.superiorId === 'none' || !data.superiorId) ? null : data.superiorId,
            superior2Id: (data.superior2Id === 'none' || !data.superior2Id) ? null : data.superior2Id,
            // Metadata
            updatedBy: req.user?.email || 'system'
        };

        const employee = await prisma.$transaction(async (tx) => {
            // ==========================================
            // 🔗 AUTOMATED LINKAGE: KARYAWAN TO USER
            // ==========================================
            let finalUserId = null;
            if (updatePayload.email) {
                const linkedUser = await tx.user.findFirst({
                    where: { email: { equals: updatePayload.email, mode: 'insensitive' } }
                });
                if (linkedUser) {
                    finalUserId = linkedUser.id;
                }
            }
            
            updatePayload.userId = finalUserId;

            const updated = await tx.karyawan.update({
                where: { id },
                data: updatePayload,
                include: {
                    company: true,
                    fact: true,
                    bag: true,
                    dept: true,
                    jabatan: true
                }
            });
            return updated;
        });

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });
    } catch (error) {
        console.error('CRITICAL: Error updating employee:', error);
        if (error.code) console.error('Prisma Error Code:', error.code);
        if (error.meta) console.error('Prisma Error Meta:', error.meta);

        res.status(500).json({
            success: false,
            message: 'Failed to update employee',
            error: error.message
        });
    }
};

// Soft delete employee
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await prisma.karyawan.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                updatedBy: req.user?.email || 'system'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully',
            data: employee
        });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete employee',
            error: error.message
        });
    }
};

// Verify employee DOB for password protection
export const verifyDob = async (req, res) => {
    try {
        const { dob } = req.body; // Expected format: DDMMYYYY
        const emplId = req.user.emplId;

        if (!emplId) {
            return res.status(400).json({
                success: false,
                message: 'Account not linked to an employee'
            });
        }

        const employee = await prisma.karyawan.findUnique({
            where: { emplId },
            select: { tglLhr: true }
        });

        if (!employee || !employee.tglLhr) {
            console.log('VERIFY_DOB: Employee or tglLhr not found for emplId:', emplId);
            return res.status(404).json({
                success: false,
                message: 'Birth date not found in records'
            });
        }

        // Use UTC-safe formatting to avoid timezone shifts
        const rawDate = new Date(employee.tglLhr);
        const day = String(rawDate.getUTCDate()).padStart(2, '0');
        const month = String(rawDate.getUTCMonth() + 1).padStart(2, '0');
        const year = rawDate.getUTCFullYear();
        const storedDob = `${day}${month}${year}`;

        const inputDob = dob ? dob.trim() : '';

        if (inputDob === storedDob) {
            return res.status(200).json({
                success: true,
                message: 'Verification successful'
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Password salah'
            });
        }
    } catch (error) {
        console.error('Error verifying DOB:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed',
            error: error.message
        });
    }
};
