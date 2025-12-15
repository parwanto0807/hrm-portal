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

        const user = await prisma.user.findUnique({
            where: {
                id: userId // Sesuai schema: id String @id
            },
            select: {
                // Hanya ambil data yang diperlukan untuk Navbar
                id: true,
                name: true,
                email: true,
                image: true, // Sesuai schema: image String?
                role: true
            }
        });

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error("Error getProfile:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};