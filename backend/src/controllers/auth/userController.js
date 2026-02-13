// controllers/userController.js
import { prisma } from '../../config/prisma.js'; 

export const getProfile = async (req, res) => {
    try {
        // Asumsi: Middleware auth sudah menaruh decoded token/session ke req.userId
        // Jika middleware Anda menaruhnya di req.user.id, sesuaikan baris ini.
        const userId = req.userId; 

        if (!userId) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        // 1. Fetch User
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                fcmToken: true // Include fcmToken in user selection
            }
        });

        if (!user) {
            console.warn(`[getProfile] User not found: ${userId}`);
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        // 2. Fetch Employee - Try by userId first, then fallback to email
        const employeeInclude = {
            jabatan: { select: { nmJab: true } },
            dept: { select: { nmDept: true } },
            bag: { select: { nmBag: true } },
            sie: { select: { nmSeksie: true } },
            agama: { select: { nmAgm: true } },
            bank: { select: { bankNama: true } },
            sekolah: { select: { nmSkl: true } },
            company: { select: { company: true } },
            pkt: { select: { nmPkt: true } }
        };

        let employee = await prisma.karyawan.findUnique({
            where: { userId: user.id },
            include: employeeInclude
        });

        if (!employee && user.email) {

            employee = await prisma.karyawan.findFirst({
                where: { 
                    email: { equals: user.email, mode: 'insensitive' }
                },
                include: employeeInclude
            });

            // Auto-heal: If found by email, update userId
            if (employee && !employee.userId) {

                await prisma.karyawan.update({
                    where: { id: employee.id },
                    data: { userId: user.id }
                });
            }
        }

        // Use employee name as primary name if available
        if (employee && employee.nama) {
            user.name = employee.nama;
        }

        res.status(200).json({
            ...user,
            emplId: employee ? employee.emplId : undefined, // Top-level emplId for convenience
            employee
        });
    } catch (error) {
        console.error("Error getProfile:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

/**
 * Update user's FCM token for push notifications
 */
export const updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        
        if (!fcmToken) {
            return res.status(400).json({ success: false, message: 'FCM Token is required' });
        }

        // Use req.userId or req.user.id depending on your auth middleware
        const userId = req.userId || (req.user && req.user.id);

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { fcmToken }
        });

        res.json({ success: true, message: 'FCM Token updated successfully' });
    } catch (error) {
        console.error('❌ Update FCM Token error:', error);
        res.status(500).json({ success: false, message: 'Failed to update FCM Token' });
    }
};