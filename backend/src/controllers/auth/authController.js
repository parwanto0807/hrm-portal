import config from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import fetch from 'node-fetch'; 
import { sendTokenResponse } from '../../utils/jwtToken.js';
import { verifyToken } from '../../utils/jwt.utils.js';
import { sysLog } from '../../utils/logger.js';
import { ensureSysUser } from '../../utils/userSync.js';
import bcrypt from 'bcryptjs';

// 1. Google Login (Client-Side Popup Flow)
export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
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

    // 🚀 SECURITY: Restrict login to authorized active employees only
    const employeeRecord = await prisma.karyawan.findFirst({
      where: { 
        email: { equals: email, mode: 'insensitive' },
        kdSts: 'AKTIF' // Only allow active employees
      }
    });

    if (!employeeRecord) {
      return res.status(403).json({
        success: false,
        message: 'Akses Ditolak: Email Anda tidak terdaftar sebagai karyawan aktif. Silakan hubungi HR.',
        code: 'UNAUTHORIZED_EMAIL'
      });
    }

    // Database Transaction (Create or Update)
    const user = await prisma.$transaction(async (tx) => {
      let existingUser = await tx.user.findUnique({
        where: { email: email },
        include: { accounts: true }
      });

      if (!existingUser) {
        existingUser = await tx.user.create({
          data: {
            email,
            name: employeeRecord.nama || name, // Prioritize official employee name
            image: picture,
            role: 'EMPLOYEE',
            isActive: true,
            accounts: {
              create: {
                provider: 'google',
                providerAccountId: googleId,
                type: 'oauth',
              }
            }
          }
        });

        // 🔗 AUTO-LINK: Link User back to Karyawan record
        await tx.karyawan.update({
            where: { id: employeeRecord.id },
            data: { userId: existingUser.id }
        });
      } else {
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
        
        existingUser = await tx.user.update({
          where: { id: existingUser.id },
          data: { 
              name: employeeRecord.nama || name, // Sync official name
              image: picture 
          }
        });
      }

      return existingUser;
    });

    // Log the successful Google login
    const sysUser = await ensureSysUser(employeeRecord.emplId);
    sysLog({
        logUser: sysUser?.username || user.email,
        modul: 'AUTH',
        action: 'LOGIN',
        data: { method: 'GOOGLE', email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    // 🔍 DEEP SYNC: Forcing employee name override to ensure dashboard shows correct name
    if (employeeRecord && employeeRecord.nama) {
        if (user.name !== employeeRecord.nama) {

            await prisma.user.update({
                where: { id: user.id },
                data: { name: employeeRecord.nama }
            });
            user.name = employeeRecord.nama; // Ensure the object sent to client is correct
        }
    }

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error("Auth Error:", error);
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

    // Check if user has a password (might be OAuth only)
    if (!user.password) {
        return res.status(401).json({ success: false, message: 'Silakan login menggunakan Google' });
    }

    // 🔥 SECURITY: Use bcrypt to compare hashed password
    // Supporting both hashed and plain (for migration)
    let isPasswordValid = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
        // Fallback for legacy plain text passwords
        isPasswordValid = user.password === password;
        
        // 🔒 Migration: If valid plain text, hash it and save for next time
        if (isPasswordValid) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { 
                    password: hashedPassword,
                    // If employee record already exists, sync name now
                    name: (await prisma.karyawan.findFirst({ where: { userId: user.id } }))?.nama || user.name
                }
            });

        }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    // Log the successful login
    const employee = await prisma.karyawan.findFirst({ where: { userId: user.id } });
    const sysUser = employee ? await ensureSysUser(employee.emplId) : null;
    
    sysLog({
        logUser: sysUser?.username || user.email,
        modul: 'AUTH',
        action: 'LOGIN',
        data: { method: 'MANUAL', email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    // Use employee name as primary name if available and sync to DB
    if (employee && employee.nama) {
        if (user.name !== employee.nama) {
            await prisma.user.update({
                where: { id: user.id },
                data: { name: employee.nama }
            });
            user.name = employee.nama;
        }
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
      return res.status(401).json({ success: false, message: 'Refresh token tidak ditemukan, silakan login ulang' });
    }

    const decoded = verifyToken(token, 'refresh');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Use employee name as primary name if available and sync to DB
    const employee = await prisma.karyawan.findFirst({ where: { userId: user.id } });
    if (employee && employee.nama) {
        if (user.name !== employee.nama) {
            await prisma.user.update({
                where: { id: user.id },
                data: { name: employee.nama }
            });
            user.name = employee.nama;
        }
    }

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

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    
    res.status(200).json({ success: true, message: 'Berhasil logout' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal logout' });
  }
};

// 5. Google Callback Handler
export const googleCallbackHandler = async (req, res) => {
    try {
      if (!req.user) throw new Error('No user data');
      const { user, tokens } = req.user;
  
      const redirectUrl = req.session?.redirectUrl || `${config.frontendUrl}/auth/callback`;
      const frontendUrl = new URL(redirectUrl);
      
      const employee = await prisma.karyawan.findFirst({ where: { userId: user.id } });
      const displayName = employee?.nama || user.name;

      frontendUrl.searchParams.append('accessToken', tokens.accessToken);
      frontendUrl.searchParams.append('refreshToken', tokens.refreshToken);
      frontendUrl.searchParams.append('userId', user.id);
      frontendUrl.searchParams.append('email', encodeURIComponent(user.email));
      frontendUrl.searchParams.append('name', encodeURIComponent(displayName));
      frontendUrl.searchParams.append('role', user.role || 'EMPLOYEE');
      frontendUrl.searchParams.append('image', encodeURIComponent(user.image || ''));
      frontendUrl.searchParams.append('success', 'true');
      
      const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
      };

      const accessTokenExpiry = 2 * 60 * 60 * 1000; // 2 hours
      const refreshTokenExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days

      res.cookie('accessToken', tokens.accessToken, { 
        ...cookieOptions, 
        expires: new Date(Date.now() + accessTokenExpiry) 
      });
      res.cookie('refreshToken', tokens.refreshToken, { 
        ...cookieOptions, 
        expires: new Date(Date.now() + refreshTokenExpiry)
      });

      // Log the successful Google Login (Passport/Redirect Flow)
      const sysUser = employee ? await ensureSysUser(employee.emplId) : null;

      sysLog({
          logUser: sysUser?.username || user.email,
          modul: 'AUTH',
          action: 'LOGIN',
          data: { method: 'GOOGLE_CALLBACK', email: user.email },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
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
      backendUrl: config.serverUrl,
    }
  });
};