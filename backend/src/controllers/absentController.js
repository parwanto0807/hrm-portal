import { prisma } from '../config/prisma.js';
import { processAttendanceImage } from '../utils/imageProcessor.js';
import firebaseAdmin from '../config/firebaseAdmin.js';
import { createNotification } from '../utils/notification.js';

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
            emplId, // Add this
            startDate,
            endDate
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Role-based data isolation for EMPLOYEE
        const userRole = req.user.role?.toUpperCase();
        const isEmployee = userRole === 'EMPLOYEE';
        
        // CRITICAL: If Employee, MUST have emplId. If not, return empty or error.
        if (isEmployee && !req.user.emplId) {
             console.warn(`Employee user ${req.user.id} has no emplId. Returning empty list.`);
             return res.status(200).json({
                success: true,
                data: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    totalPages: 0
                }
            });
        }

        // If explicit emplId is passed (e.g. for My Attendance page for Admins), use it.
        // Otherwise if role is EMPLOYEE, enforce their own emplId.
        const targetEmplId = isEmployee ? req.user.emplId : emplId;
        const employeeFilter = targetEmplId ? { emplId: targetEmplId } : {};

        console.log('--- GET /absent Debug ---');
        console.log('User Role:', userRole);
        console.log('Req EmplId:', req.user.emplId);
        console.log('Query EmplId:', emplId);
        console.log('Target EmplId:', targetEmplId);

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
        const userRole = req.user.role?.toUpperCase();
        const isEmployee = userRole === 'EMPLOYEE';

        // CRITICAL: If Employee, MUST have emplId. If not, return empty stats.
        if (isEmployee && !req.user.emplId) {
             return res.status(200).json({
                success: true,
                stats: {
                    total: 0,
                    presentCount: 0,
                    lateCount: 0,
                    absentCount: 0,
                    presentPercentage: 0,
                    latePercentage: 0,
                    absentPercentage: 0
                }
            });
        }

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

        // Denominator: Total potential working days (excluding 'O' - Off Schedule)
        const workingDaysCount = await prisma.absent.count({ 
            where: { ...where, NOT: { kdAbsen: 'O' } }
        });
        
        // Count statuses
        const presentCount = await prisma.absent.count({
            where: { ...where, kdAbsen: 'H' }
        });

        const lateCount = await prisma.absent.count({
            where: { ...where, lambat: { gt: 0 } }
        });

        const alphaCount = await prisma.absent.count({
            where: { ...where, kdAbsen: 'A' }
        });

        // The denominator for all percentages should be working days
        const denominator = workingDaysCount;

        res.status(200).json({
            success: true,
            stats: {
                total: denominator,
                presentCount,
                lateCount,
                absentCount: alphaCount,
                presentPercentage: denominator > 0 ? (presentCount / denominator) * 100 : 0,
                latePercentage: denominator > 0 ? (lateCount / denominator) * 100 : 0,
                absentPercentage: denominator > 0 ? (alphaCount / denominator) * 100 : 0
            }
        });
    } catch (error) {
        console.error('Error fetching attendance stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Check-In Status (Shift, Factory, Logs)
 */
export const getCheckInStatus = async (req, res) => {
    try {
        const emplId = req.user.emplId;
        if (!emplId) {
            return res.status(400).json({ success: false, message: 'Employee ID not found for user' });
        }

        // 1. Get Employee & Factory Info
        const employee = await prisma.karyawan.findUnique({
            where: { emplId },
            include: {
                fact: true // Relation name is 'fact' in schema
            }
        });

        let factory = null;
        if (employee && employee.fact) {
            factory = employee.fact;
        } else if (employee && employee.kdFact) {
             // Fallback if relation load fails but kdFact exists
             factory = await prisma.mstFact.findUnique({
                where: { kdFact: employee.kdFact }
            });
        }
        
        // 2. Get Today's Logs
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayLogs = await prisma.attLog.findMany({
            where: {
                emplId,
                attTime: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            orderBy: { attTime: 'desc' }
        });

        // 3. Determine Action
        let action = 'CHECK_IN';
        if (todayLogs.length > 0) {
            const lastLog = todayLogs[0];
            // If last status was '0' (In), next is 'CHECK_OUT'
            // If last status was '1' (Out), next is 'CHECK_IN'
            if (lastLog.status === '0') {
                action = 'CHECK_OUT';
            }
        }

        res.status(200).json({
            success: true,
            data: {
                shift: {
                    // Placeholder for shift logic, typically complex. 
                    // Returning standard office hours for now or specific if DB has it.
                    start: "08:00",
                    end: "17:00"
                },
                factory: factory ? {
                    name: factory.nmFact,
                    lat: parseFloat(factory.lat || 0),
                    long: parseFloat(factory.long || 0),
                    radius: parseInt(factory.radius || 100)
                } : null,
                logs: todayLogs,
                action
            }
        });

    } catch (error) {
        console.error('Error fetching check-in status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Submit Check-In/Out
 */
export const submitCheckIn = async (req, res) => {
    try {
        const emplId = req.user.emplId;
        const { lat, long, status, distance } = req.body;
        const file = req.file; // From Multer

        if (!emplId) return res.status(400).json({ success: false, message: 'Employee ID not found' });
        if (!lat || !long || !status) return res.status(400).json({ success: false, message: 'Missing required fields' });
        if (!file) return res.status(400).json({ success: false, message: 'Foto wajib diupload' });

        // 1. Process Image
        const photoPath = await processAttendanceImage(file.buffer, `att-${emplId}-${Date.now()}`);

        // 2. Fetch Karyawan to get NIK and idAbsen
        const karyawan = await prisma.karyawan.findUnique({
            where: { emplId }
        });

        if (!karyawan) {
            return res.status(404).json({ success: false, message: 'Employee data not found' });
        }

        const now = new Date();
        const jam = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Use YYYY-MM-DD for tanggal to match @db.Date behavior or parseDate 
        // In local timezone
        const year = now.getFullYear();
        const month = now.getMonth();
        const date = now.getDate();
        const midnight = new Date(year, month, date, 0, 0, 0, 0);

        // 3. Save to AttLog
        const newLog = await prisma.attLog.create({
            data: {
                emplId,
                nik: karyawan.nik,
                idAbsen: karyawan.idAbsen || '',
                tanggal: midnight,
                jam: jam,
                cflag: 'M', // 'M' for Mobile
                attTime: now,
                status, // '0' or '1'
                lat: String(lat),
                long: String(long),
                distance: parseInt(distance || 0),
                photo: photoPath,
                device: (req.headers['user-agent'] || 'Unknown').substring(0, 100)
            }
        });

        // 4. Send Push Notification (Async)
        const actionText = status === '0' ? 'Check-in' : 'Check-out';
        const notifTitle = `Absensi ${actionText} Berhasil`;
        const notifBody = `${actionText} berhasil pada pukul ${jam}`;

        if (firebaseAdmin && karyawan.userId) {
            const user = await prisma.user.findUnique({
                where: { id: karyawan.userId },
                select: { fcmToken: true }
            });

            if (user?.fcmToken) {
                const message = {
                    notification: {
                        title: notifTitle,
                        body: notifBody
                    },
                    token: user.fcmToken
                };

                firebaseAdmin.messaging().send(message)
                    .then(() => console.log('✅ Push notification sent successfully'))
                    .catch((error) => console.error('❌ Error sending push notification:', error));
            }
        }

        // 5. Save Notification to Database
        await createNotification({
            emplId,
            subject: notifTitle,
            note: notifBody,
            type: 1, // attendance type
            creatorUuid: req.user.id,
            url: '/dashboard/attendance' // Direct to attendance page
        });

        res.status(201).json({
            success: true,
            message: 'Attendance submitted successfully',
            data: newLog
        });

    } catch (error) {
        console.error('Error submitting check-in:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Calculate distance between two points in meters (Haversine)
 */
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d * 1000; // Distance in m
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
