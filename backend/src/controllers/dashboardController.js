// src/controllers/dashboardController.js
import { prisma } from '../config/prisma.js';

/**
 * Get statistics for the employee dashboard
 */
export const getEmployeeStats = async (req, res) => {
    try {
        const emplId = req.user.emplId;

        if (!emplId) {
            return res.status(400).json({
                success: false,
                message: 'Akun anda belum terhubung dengan data karyawan. Silakan hubungi HR.'
            });
        }

        // 1. Get Current Default Period
        const currentPeriod = await prisma.periode.findFirst({
            where: { dataDefa: true }
        });

        // Current Year for Leave Balance
        const now = new Date();
        const currentYearStr = now.getFullYear().toString();

        // Target Period for Attendance
        // If no default period, fallback to current month/year format YYYYMM
        const fallbackPeriod = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        const targetPeriod = currentPeriod ? currentPeriod.periodeId : fallbackPeriod;

        // 2. Fetch Stats, Employee Info, and Recent Activities in Parallel
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        threeDaysAgo.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [hcuti, hadirCount, ijinSakitCount, employeeInfo, recentActivities] = await Promise.all([
            // Sisa Cuti (Remaining Leave)
            prisma.hcuti.findFirst({
                where: { emplId, tahun: currentYearStr }
            }),
            // Hadir Count
            prisma.absent.count({
                where: { emplId, periode: targetPeriod, kdAbsen: 'H' }
            }),
            // Ijin/Sakit Count
            prisma.absent.count({
                where: { emplId, periode: targetPeriod, kdAbsen: { in: ['I', 'S', 'P'] }
                }
            }),
            // Basic Employee Info
            prisma.karyawan.findUnique({
                where: { emplId },
                select: {
                    nama: true,
                    jabatan: { select: { nmJab: true } },
                    dept: { select: { nmDept: true } },
                    groupShift: true,
                    kdCmpy: true
                }
            }),
            // Recent Activities (Last 3 Days)
            prisma.attLog.findMany({
                where: { 
                    emplId,
                    attTime: { gte: threeDaysAgo }
                },
                orderBy: { attTime: 'desc' },
                take: 10
            })
        ]);

        // Get today's shift schedule from Dshift and TimeWork
        let todayShift = null;
        if (employeeInfo?.groupShift && employeeInfo?.kdCmpy) {
            const dayOfMonth = today.getDate(); // 1-31
            const shiftFieldName = `shift${String(dayOfMonth).padStart(2, '0')}`; // shift01, shift02, etc.

            const dshift = await prisma.dshift.findFirst({
                where: {
                    periode: targetPeriod,
                    kdCmpy: employeeInfo.kdCmpy,
                    groupShift: employeeInfo.groupShift
                }
            });

            if (dshift && dshift[shiftFieldName]) {
                const shiftCode = dshift[shiftFieldName];
                
                // Get shift times from TimeWork
                const timeWork = await prisma.timeWork.findFirst({
                    where: {
                        tanggal: today,
                        kdCmpy: employeeInfo.kdCmpy,
                        shiftCode: shiftCode
                    }
                });

                if (timeWork) {
                    todayShift = {
                        shiftCode: shiftCode,
                        in: timeWork.timeIn,
                        out: timeWork.timeOut,
                        dayName: timeWork.dayName
                    };
                }
            }
        }

        res.status(200).json({
            success: true,
            data: {
                sisaCuti: hcuti ? hcuti.totalSisa : 0,
                hadir: hadirCount,
                ijinSakit: ijinSakitCount,
                employee: {
                    position: employeeInfo?.jabatan?.nmJab || 'Karyawan',
                    department: employeeInfo?.dept?.nmDept || 'General'
                },
                todayShift: todayShift,
                recentActivities: recentActivities.map(log => ({
                    id: log.id,
                    type: log.status === '0' ? 'Clock In' : 'Clock Out',
                    time: log.attTime,
                    location: log.lat && log.long ? `${log.lat},${log.long}` : 'Unknown',
                    distance: log.distance
                })),
                periodInfo: currentPeriod ? currentPeriod.nama : `Bulan ${now.getMonth() + 1}`
            }
        });
    } catch (error) {
        console.error('Error fetching employee dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil statistik dashboard',
            error: error.message
        });
    }
};
