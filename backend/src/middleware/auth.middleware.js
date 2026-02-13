import jwt from "jsonwebtoken";
import config from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ensureSysUser } from '../utils/userSync.js';

// ============================================================================
// 1. AUTH ERROR HANDLER
// ============================================================================
export const authErrorHandler = (error, req, res, next) => {
  if (error.message && (error.message.includes('access_denied') || error.message.includes('cancelled'))) {
    return res.redirect(`${config.frontendUrl}/login?status=cancelled`);
  }
  next(error);
};

// ============================================================================
// 2. PROTECT (Dulu bernama verifyUser)
// Middleware untuk memastikan user sudah login (via Cookie atau Header)
// ============================================================================
export const protect = async (req, res, next) => {
  let token;

  // A. PRIORITAS 1: Ambil Token dari Cookie (Untuk Browser/Next.js)
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // B. PRIORITAS 2: Ambil Token dari Header (Untuk Postman/Mobile)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // C. Jika token tidak ditemukan
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Silakan login terlebih dahulu."
    });
  }

  try {
    // D. Verifikasi Token
    const secret = process.env.JWT_SECRET || config.jwt.secret;
    const decoded = jwt.verify(token, secret);
    


    // E. Cek User di Database
    const userIdToCheck = decoded.userId || decoded.id;

    const user = await prisma.user.findUnique({
      where: { id: userIdToCheck },
      select: { id: true, role: true, email: true, name: true, fcmToken: true }
    });

    if (!user) {
      console.warn('⚠️  User not found in DB for ID:', userIdToCheck);
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan atau akun telah dinonaktifkan."
      });
    }

    // F. Tempel data user ke Request
    req.user = user;        
    req.userId = user.id;
    req.userRole = user.role;
    req.userEmail = user.email;

    // G. Find linked employee by userId or email
    const employee = await prisma.karyawan.findFirst({
      where: { 
        OR: [
          { userId: user.id },
          { email: { equals: user.email, mode: 'insensitive' } }
        ]
      },
      select: { emplId: true, nama: true }
    });
    
    if (employee) {
      req.user.emplId = employee.emplId;
      req.user.namaKaryawan = employee.nama;
    }
    
    // Ensure legacy SysUser exists for notifications/logs for ALL users
    // If no emplId, use email as the identifier
    const sysUser = await ensureSysUser(req.user.emplId || user.email);
    if (sysUser) {
      req.user.username = sysUser.username;
      req.user.legacyId = sysUser.legacyId;
      // If we didn't have an emplId but sysUser does, use it
      if (!req.user.emplId && sysUser.emplId) {
        req.user.emplId = sysUser.emplId;
      }
    }

    next();

  } catch (error) {
    console.error('❌ Protect middleware error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: "Sesi telah berakhir. Silakan login kembali.",
        code: "TOKEN_EXPIRED"
      });
    }
    
    return res.status(403).json({
      success: false,
      message: "Token tidak valid: " + error.message
    });
  }
};

// ============================================================================
// 3. AUTHORIZE (Dulu bernama adminOnly, sekarang lebih fleksibel)
// Middleware untuk membatasi akses berdasarkan Role
// Cara pakai: authorize('ADMIN', 'MANAGER')
// ============================================================================
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "User belum terautentikasi." 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} tidak diizinkan mengakses halaman ini.`
      });
    }
    
    next();
  };
};