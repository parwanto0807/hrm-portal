import { prisma } from '../config/prisma.js';
import { calculateLate, calculateEarly } from '../utils/attendanceUtils.js';

/**
 * Get attendance records with pagination and filters
 */
export const getAttendance = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            kdDept = '',
            kdSeksie = '',
            kdJab = '',
            startDate,
            endDate
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Role-based data isolation for EMPLOYEE
        const isEmployee = req.user.role === 'EMPLOYEE';
        const employeeFilter = isEmployee ? { emplId: req.user.emplId } : {};

        // Build where clause
        const where = {
            AND: [
                employeeFilter,
                search ? {
                    OR: [
                        { emplId: { contains: search, mode: 'insensitive' } },
                        { nik: { contains: search, mode: 'insensitive' } },
                        { nama: { contains: search, mode: 'insensitive' } },
                        { karyawan: { nama: { contains: search, mode: 'insensitive' } } },
                        { karyawan: { nik: { contains: search, mode: 'insensitive' } } },
                        { karyawan: { emplId: { contains: search, mode: 'insensitive' } } }
                    ]
                } : {},
                (kdDept && kdDept !== 'all') ? { kdDept } : {}, // Use Absent column
                (kdSeksie && kdSeksie !== 'all') ? { kdSeksie } : {}, // Use Absent column
                (kdJab && kdJab !== 'all') ? { karyawan: { kdJab } } : {}, // Use Relation (Absent doesn't have kdJab)
                (startDate && endDate) ? {
                    tglAbsen: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                } : {}
            ]
        };

        console.log('Constructed Where Clause:', JSON.stringify(where, null, 2));


        const [total, records] = await Promise.all([
            prisma.absent.count({ where }),
            prisma.absent.findMany({
                where,
                skip,
                take,
                include: {
                    karyawan: {
                        select: {
                            nama: true,
                            nik: true,
                            emplId: true,
                            dept: { select: { nmDept: true } },
                            sie: { select: { nmSeksie: true } },
                            jabatan: { select: { nmJab: true } }
                        }
                    },
                    jnsJam: true,
                    descAbsen: true
                },
                orderBy: { tglAbsen: 'desc' }
            })
        ]);

        res.status(200).json({
            success: true,
            data: records,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update attendance record
 */
export const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Perform validation (optional logic like realMasuk <= realKeluar can be checked here or frontend)
        
        // Recalculate lambat and cepat based on provided times
        const lambat = calculateLate(data.stdMasuk, data.realMasuk);
        const cepat = calculateEarly(data.stdKeluar, data.realKeluar);

        const updated = await prisma.absent.update({
            where: { id },
            data: {
                stdMasuk: data.stdMasuk,
                stdKeluar: data.stdKeluar,
                realMasuk: data.realMasuk,
                realKeluar: data.realKeluar,
                lambat: lambat,
                cepat: cepat,
                kdAbsen: data.kdAbsen,
                kodeDesc: data.kodeDesc,
                totLmb: data.totLmb ? parseFloat(data.totLmb) : undefined,
                ketLmb: data.ketLmb,
                // Add any other editable fields
                updatedAt: new Date()
            },
            include: {
                karyawan: {
                    select: { nama: true }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Data absensi berhasil diperbarui',
            data: updated
        });
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get attendance statistics
 */
export const getAttendanceStats = async (req, res) => {
    try {
        const { startDate, endDate, kdDept, kdSeksie, kdJab } = req.query;

        console.log('--- GET /absent ---');
        console.log('Query Params:', req.query);

        // Role-based data isolation for EMPLOYEE
        const isEmployee = req.user.role === 'EMPLOYEE';
        const employeeFilter = isEmployee ? { emplId: req.user.emplId } : {};

        const where = {
            AND: [
                employeeFilter,
                (startDate && endDate) ? {
                    tglAbsen: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                } : {
                    // Default to last 90 days if no dates provided to ensure data visibility
                    tglAbsen: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 90)),
                        lte: new Date()
                    }
                },
                (kdDept && kdDept !== 'all') ? { karyawan: { kdDept } } : {},
                (kdSeksie && kdSeksie !== 'all') ? { karyawan: { kdSeksie } } : {},
                (kdJab && kdJab !== 'all') ? { karyawan: { kdJab } } : {}
            ]
        };

        const totalRecords = await prisma.absent.count({ where });
        
        // Count statuses
        // Note: In this schema, kdAbsen 'H' usually means Present
        const presentCount = await prisma.absent.count({
            where: { ...where, kdAbsen: 'H' }
        });

        // Late count (where lambat > 0)
        const lateCount = await prisma.absent.count({
            where: { ...where, lambat: { gt: 0 } }
        });

        // Absent count (where kdAbsen is not 'H' and maybe not 'L' for leave?)
        const absentCount = await prisma.absent.count({
            where: { 
                ...where, 
                NOT: { kdAbsen: 'H' }
            }
        });

        res.status(200).json({
            success: true,
            stats: {
                total: totalRecords,
                presentCount,
                lateCount,
                absentCount,
                presentPercentage: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,
                latePercentage: totalRecords > 0 ? (lateCount / totalRecords) * 100 : 0,
                absentPercentage: totalRecords > 0 ? (absentCount / totalRecords) * 100 : 0
            }
        });
    } catch (error) {
        console.error('Error fetching attendance stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
