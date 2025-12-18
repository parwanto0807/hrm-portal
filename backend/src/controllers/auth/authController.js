// src/controllers/authController.js

import config from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import fetch from 'node-fetch'; // 1. Use node-fetch for consistent HTTP requests

// Import Helper Modular yang sudah Anda buat sebelumnya
import { sendTokenResponse } from '../../utils/jwtToken.js'; // Mengurus Response & Cookie
import { verifyToken } from '../../utils/jwt.utils.js';      // Mengurus Verifikasi Token

// ==========================================
// MAIN CONTROLLERS
// ==========================================

// 1. Google Login (Client-Side Popup Flow)
export const googleLogin = async (req, res) => {
  const { token } = req.body; // Access Token Google (ya29...)

  try {
    // A. Fetch Data User dari Google
    // Menggunakan node-fetch
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!googleResponse.ok) {
      throw new Error(`Google API Error: ${googleResponse.status} ${googleResponse.statusText}`);
    }

    const payload = await googleResponse.json();
    const { email, name, picture, sub: googleId } = payload;

    console.log(`✅ Google User Verified: ${email}`);

    // B. Database Transaction (Create or Update)
    const user = await prisma.$transaction(async (tx) => {
      let existingUser = await tx.user.findUnique({
        where: { email: email },
        include: { accounts: true }
      });

      if (!existingUser) {
        // Buat User Baru
        existingUser = await tx.user.create({
          data: {
            email,
            name,
            image: picture,
            role: 'EMPLOYEE',
            accounts: {
              create: {
                provider: 'google',
                providerAccountId: googleId,
                type: 'oauth',
              }
            }
          }
        });
      } else {
        // User Ada, Cek/Update Account Linking
        const linkedAccount = existingUser.accounts.find(
          acc => acc.provider === 'google' && acc.providerAccountId === googleId
        );

        if (!linkedAccount) {
          await tx.account.create({
            data: {
              userId: existingUser.id,
              provider: 'google',
              providerAccountId: googleId,
              type: 'oauth'
            }
          });
        }
        
        // Update data profil terbaru dari Google
        await tx.user.update({
          where: { id: existingUser.id },
          data: { name, image: picture }
        });
      }

      return existingUser;
    });

    // C. Kirim Response Sukses
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error("Auth Error:", error);
    // DEBUG: Kirim detail error ke frontend agar tahu penyebabnya (Fetch error / DB error)
    res.status(500).json({ 
      success: false,
      message: `Login Gagal: ${error.message}`, 
      error: error.message 
    });
  }
};

// 2. Manual Login (Email & Password)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    // ⚠️ PENTING: Di Production pastikan menggunakan bcrypt.compare
    const isPasswordValid = user.password === password; 

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    // Menggunakan helper agar konsisten (Set Cookie + JSON)
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Login gagal', error: error.message });
  }
};

// 3. Refresh Token
export const refreshToken = async (req, res) => {
  try {
    // Ambil token dari Cookie (Prioritas) atau Body
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token tidak ditemukan, silakan login ulang' });
    }

    // 1. Verifikasi Token menggunakan helper modular 'verifyToken'
    // Helper ini akan throw error jika token invalid/expired
    const decoded = verifyToken(token, 'refresh');
    
    // 2. Cek User di DB (Security Check)
    // Perhatikan: decoded.userId sesuai dengan logic di jwt.utils.js
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
    }

    // 3. Generate Token Baru & Update Cookie (Token Rotation)
    // Kita panggil sendTokenResponse lagi untuk memperbarui masa aktif Access & Refresh Token
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error("Refresh Error:", error.message);
    res.status(403).json({ success: false, message: 'Refresh token tidak valid atau kadaluwarsa' });
  }
};

// 4. Logout
export const logout = (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    };

    // Hapus KEDUA cookie (accessToken dan refreshToken)
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    
    res.status(200).json({ success: true, message: 'Berhasil logout' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal logout' });
  }
};

// 5. Google Callback Handler (Opsional - Jika pakai Passport/Redirect Flow)
export const googleCallbackHandler = async (req, res) => {
    try {
      if (!req.user) throw new Error('No user data');
      const { user, tokens } = req.user;
  
      const redirectUrl = req.session?.redirectUrl || `${config.frontendUrl}/auth/callback`;
      const frontendUrl = new URL(redirectUrl);
      
      // Mengirim token via URL params (kurang aman dibanding cookie, tapi standar untuk redirect flow)
      frontendUrl.searchParams.append('accessToken', tokens.accessToken);
      frontendUrl.searchParams.append('refreshToken', tokens.refreshToken);
      frontendUrl.searchParams.append('success', 'true');
      
      // CHANGE: Set cookie agar Server Actions (Next.js) bisa membacanya
      const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
      };

      res.cookie('accessToken', tokens.accessToken, { 
        ...cookieOptions, 
        expires: new Date(Date.now() + 15 * 60 * 1000) 
      });
      res.cookie('refreshToken', tokens.refreshToken, { 
        ...cookieOptions, 
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      res.redirect(frontendUrl.toString());
    } catch (error) {
      res.redirect(`${config.frontendUrl}/login?error=auth_failed`);
    }
};

// 6. Debug Config
export const getDebugConfig = (req, res) => {
  res.json({
    success: true,
    config: {
      env: process.env.NODE_ENV,
      frontendUrl: config.frontendUrl,
      backendUrl: config.serverUrl, // Asumsi config.serverUrl ada di env.js
    }
  });
};