import jwt from 'jsonwebtoken';
import config from '../../config/env.js';
import { prisma } from '../../config/prisma.js';

// ==========================================
// HELPER FUNCTIONS (Internal)
// ==========================================

/**
 * Generate Access & Refresh Tokens
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: '15m' } // Access token pendek (keamanan)
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '7d' } // Refresh token panjang (kenyamanan)
  );

  return { accessToken, refreshToken };
};

/**
 * Standard Response Sender (Cookie + JSON)
 * Menggantikan utils/jwtToken.js agar logic terkumpul disini
 */
const sendTokenResponse = (user, statusCode, res) => {
  const tokens = generateTokens(user);

  // Set HttpOnly Cookie untuk Refresh Token (Anti XSS)
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only di production
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
  });

  // Hapus password dari object user sebelum dikirim ke frontend
  const { password, ...userWithoutPassword } = user;

  res.status(statusCode).json({
    success: true,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    },
    user: userWithoutPassword
  });
};

// ==========================================
// MAIN CONTROLLERS
// ==========================================

// 1. Google Login (Client-Side Popup Flow)
// Menggunakan Access Token dari Frontend untuk fetch data ke Google
export const googleLogin = async (req, res) => {
  const { token } = req.body; // Access Token (ya29...)

  try {
    // A. Fetch Data User dari Google
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!googleResponse.ok) {
      throw new Error('Token Google tidak valid atau kadaluwarsa');
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
    res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan saat login Google", 
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

    // ⚠️ PENTING: Di Production gunakan bcrypt.compare(password, user.password)
    const isPasswordValid = user.password === password; 

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Login gagal', error: error.message });
  }
};

// 3. Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token tidak ditemukan' });
    }

    // Verifikasi Token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
    
    // Cek User di DB (Security Check)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Generate Access Token Baru Saja (Refresh token lama tetap dipakai atau dirotasi tergantung kebijakan)
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      tokens: {
        accessToken,
        refreshToken: token 
      }
    });

  } catch (error) {
    res.status(403).json({ success: false, message: 'Refresh token tidak valid atau kadaluwarsa' });
  }
};

// 4. Logout
export const logout = (req, res) => {
  try {
    // Hapus Cookie
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    
    res.status(200).json({ success: true, message: 'Berhasil logout' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal logout' });
  }
};

// 5. Google Callback Handler (Opsional - Jika pakai Passport/Redirect Flow)
export const googleCallbackHandler = async (req, res) => {
    // Logika Passport Callback (sesuai request Anda sebelumnya)
    try {
      if (!req.user) throw new Error('No user data');
      const { user, tokens } = req.user;
  
      const redirectUrl = req.session?.redirectUrl || `${config.frontendUrl}/auth/callback`;
      const frontendUrl = new URL(redirectUrl);
      
      frontendUrl.searchParams.append('accessToken', tokens.accessToken);
      frontendUrl.searchParams.append('refreshToken', tokens.refreshToken);
      frontendUrl.searchParams.append('success', 'true');
      
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
      backendUrl: config.serverUrl,
    }
  });
};