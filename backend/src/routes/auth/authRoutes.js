// src/routes/auth.routes.js
import { Router } from 'express';
import passport from 'passport';
import config from '../../config/env.js';
import jwt from 'jsonwebtoken';
import {prisma} from '../../config/prisma.js';

const router = Router();

// Google OAuth Login
router.get('/google', (req, res, next) => {
  console.log('🔐 Initiating Google OAuth...');
  console.log('📋 Config check:', {
    clientId: config.google.clientId ? '✅ Set' : '❌ Not set',
    callbackUrl: config.google.callbackUrl,
    frontendUrl: config.frontendUrl
  });

  // Simpan redirect URL jika ada
  if (req.query.redirect) {
    req.session.redirectUrl = req.query.redirect;
    console.log('🎯 Stored redirect URL:', req.query.redirect);
  }

  passport.authenticate('google', { 
    scope: ['profile', 'email', 'openid'],
    accessType: 'offline',
    prompt: 'consent',
    session: false
  })(req, res, next);
});

// Google OAuth Callback
router.get('/google/callback',
  (req, res, next) => {
    console.log('📱 Google callback received');
    console.log('Query params:', req.query);

    if (req.query.error === 'access_denied') {
      console.log('🚫 User cancelled login');
      return res.redirect(`${config.frontendUrl}/auth/google?error=cancelled`);
    }

    passport.authenticate('google', {
      failureRedirect: `${config.frontendUrl}/auth/google?error=auth_failed`,
      session: false
    })(req, res, next);
  },
  async (req, res) => {
    try {
      console.log('✅ Google auth successful');
      
      // DEBUG: Log req.user structure
      console.log('🔍 req.user structure:', JSON.stringify(req.user, null, 2));
      
      if (!req.user) {
        console.error('❌ No user object from passport');
        throw new Error('Authentication failed - no user data');
      }

      // PENTING: Extract user dan tokens dari req.user
      const { user, tokens } = req.user;
      
      if (!user || !user.id) {
        console.error('❌ Invalid user object:', user);
        throw new Error('Invalid user data');
      }

      if (!tokens || !tokens.accessToken) {
        console.error('❌ Invalid tokens:', tokens);
        throw new Error('Token generation failed');
      }

      console.log('👤 User authenticated:', user.email);
      console.log('🎟️ Access token length:', tokens.accessToken.length);

      // Dapatkan redirect URL dari session atau default
      const redirectUrl = req.session?.redirectUrl || `${config.frontendUrl}/auth/callback`;
      
      // Hapus redirect URL dari session
      if (req.session?.redirectUrl) {
        delete req.session.redirectUrl;
      }

      // Build frontend callback URL dengan tokens
      const frontendUrl = new URL(redirectUrl);
      frontendUrl.searchParams.append('accessToken', tokens.accessToken);
      frontendUrl.searchParams.append('refreshToken', tokens.refreshToken);
      frontendUrl.searchParams.append('userId', user.id);
      frontendUrl.searchParams.append('success', 'true');
      frontendUrl.searchParams.append('email', user.email); // Tidak perlu encodeURIComponent!
      frontendUrl.searchParams.append('name', user.name || '');
      frontendUrl.searchParams.append('image', user.image || '');
      frontendUrl.searchParams.append('role', user.role || 'EMPLOYEE');
      
      if (user.name) {
        frontendUrl.searchParams.append('name', encodeURIComponent(user.name));
      }
      if (user.image) {
        frontendUrl.searchParams.append('image', encodeURIComponent(user.image));
      }
      if (user.role) {
        frontendUrl.searchParams.append('role', encodeURIComponent(user.role));
      }

      console.log('🎯 Redirecting to:', frontendUrl.toString());
      res.redirect(frontendUrl.toString());

    } catch (error) {
      console.error('❌ Callback processing error:', error);
      const errorUrl = `${config.frontendUrl}/auth/google?error=server_error&message=${encodeURIComponent(error.message)}`;
      res.redirect(errorUrl);
    }
  }
);

// Direct token exchange endpoint (untuk popup flow)
router.post('/google/token', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;
    
    console.log('🔑 Processing Google token exchange');
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // TODO: Implement Google OAuth token exchange
    // Untuk sekarang, kita akan arahkan ke OAuth flow
    const authUrl = `${config.serverUrl}/api/auth/google?redirect=${encodeURIComponent(redirectUri || config.frontendUrl)}`;
    
    res.json({
      success: true,
      redirect: authUrl,
      message: 'Please use OAuth redirect flow'
    });
    
  } catch (error) {
    console.error('❌ Token exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to exchange token',
      error: error.message
    });
  }
});

// Login dengan email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Email/password login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Cek password (asumsi menggunakan bcrypt)
    // Ganti dengan implementasi bcrypt yang sesuai
    const isPasswordValid = user.password === password; // SEMENTARA: ini tidak aman!
    // const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      { expiresIn: '7d' }
    );

    // Set cookie untuk refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
    });

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = user;

    console.log('✅ Login successful for:', email);

    res.json({
      success: true,
      tokens: {
        accessToken,
        refreshToken
      },
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
    
    // Cari user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      tokens: {
        accessToken,
        refreshToken // Return the same refresh token
      },
      user
    });

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    // Clear cookie
    res.clearCookie('refreshToken');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Debug endpoint
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    config: {
      googleClientId: config.google.clientId ? '✅ Configured' : '❌ NOT CONFIGURED',
      googleCallbackUrl: config.google.callbackUrl,
      frontendUrl: config.frontendUrl,
      backendUrl: config.serverUrl,
      nodeEnv: process.env.NODE_ENV,
      jwtSecret: process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'
    },
    endpoints: {
      googleOAuth: `${config.serverUrl}/api/auth/google`,
      googleCallback: `${config.serverUrl}/api/auth/google/callback`,
      login: `${config.serverUrl}/api/auth/login (POST)`,
      refresh: `${config.serverUrl}/api/auth/refresh (POST)`
    },
    cookies: req.cookies,
    session: req.session
  });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API is working!',
    timestamp: new Date().toISOString(),
    path: '/api/auth/test'
  });
});

export default router;