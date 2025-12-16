import config from '../config/env.js'; // Pastikan secret ada di sini
import jwt from "jsonwebtoken";
import { prisma } from '../config/prisma.js'; // Import Prisma client Anda

// 1. Error Handler untuk Redirect Google (Sudah Oke)
export const authErrorHandler = (error, req, res, next) => {
  if (error.message.includes('access_denied') || error.message.includes('cancelled')) {
    return res.redirect(`${config.frontendUrl}/login?status=cancelled`);
  }
  next(error);
};

// 2. Verify User (Versi Enterprise)
export const verifyUser = async (req, res, next) => {
    // A. Ambil Header
    const authHeader = req.headers['authorization'];
    
    // B. Validasi format "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false,
            message: "Akses ditolak. Format token harus 'Bearer <token>'" 
        });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "Akses ditolak. Token tidak ditemukan." 
        });
    }

    try {
        // C. Verifikasi Token
        // Menggunakan process.env.JWT_SECRET atau dari config
        const secret = process.env.JWT_SECRET || config.jwtSecret;
        const decoded = jwt.verify(token, secret);

        // --- LEVEL KEAMANAN TAMBAHAN (WAJIB UNTUK HRM) ---
        // Cek apakah user masih aktif di database.
        // Ini mencegah user yang sudah resign/banned mengakses sistem
        // meskipun mereka masih memegang token valid.
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true, email: true } // Hemat query, ambil yg perlu saja
        });

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "User tidak ditemukan atau akun telah dihapus." 
            });
        }

        // D. Tempel data user ke Request Object
        req.userId = user.id;
        req.userRole = user.role;
        req.userEmail = user.email;

        next();

    } catch (error) {
        // E. Penanganan Error Spesifik (Token Expired vs Invalid)
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ 
                success: false,
                message: "Sesi telah berakhir. Silakan login kembali.",
                code: "TOKEN_EXPIRED" // Kode ini berguna untuk Frontend minta Refresh Token
            });
        }
        
        return res.status(403).json({ 
            success: false,
            message: "Token tidak valid." 
        });
    }
};