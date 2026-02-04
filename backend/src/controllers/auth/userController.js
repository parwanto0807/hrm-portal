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
                role: true
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
            console.log(`[getProfile] Fallback to email search for: ${user.email}`);
            employee = await prisma.karyawan.findFirst({
                where: { 
                    email: { equals: user.email, mode: 'insensitive' }
                },
                include: employeeInclude
            });

            // Auto-heal: If found by email, update userId
            if (employee && !employee.userId) {
                console.log(`[getProfile] Auto-healing linkage for: ${employee.nama}`);
                await prisma.karyawan.update({
                    where: { id: employee.id },
                    data: { userId: user.id }
                });
            }
        }

        console.log(`[getProfile] Success for ${user.email}. Linked employee: ${employee ? employee.nama : 'NONE'}`);

        res.status(200).json({
            ...user,
            employee
        });

    } catch (error) {
        console.error("Error getProfile:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};