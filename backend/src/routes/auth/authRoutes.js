// src/routes/auth.routes.js
import { Router } from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const router = Router();
const passport = require('passport');
import config from '../../config/env.js';

// Google OAuth Login
router.get('/google', (req, res, next) => {
  console.log('🔐 Initiating Google OAuth...');
  console.log('Client ID:', config.google.clientId ? 'Set' : 'Not set');
  console.log('Callback URL:', config.google.callbackUrl);
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
});

// Google OAuth Callback
router.get('/google/callback',
  (req, res, next) => {
    console.log('📱 Google callback received');

if (req.query.error === 'access_denied') {
      console.log('🚫 User cancelled login');
      
      // ❌ HAPUS BARIS LAMA INI:
      // return res.redirect(`${config.frontendUrl}/login?error=cancelled`);

      // ✅ GANTI DENGAN INI:
      // Ini akan melempar user ke http://localhost:3002/auth/google
      return res.redirect(`${config.frontendUrl}/auth/google`); 
    }
    passport.authenticate('google', { 
      failureRedirect: `${config.frontendUrl}/login?error=auth_failed`,
      session: false
    })(req, res, next);
  },
  (req, res) => {
    try {
      console.log('✅ Google auth successful');
      
      if (!req.user || !req.user.tokens) {
        throw new Error('User or tokens missing from strategy response');
      }

      const { tokens, user } = req.user;

      console.log('🎟️ Redirecting to frontend for:', user.email);

      // Encode tokens untuk keamanan (optional)
      const redirectUrl = `${config.frontendUrl}/auth/callback` + 
        `?accessToken=${encodeURIComponent(tokens.accessToken)}` + 
        `&refreshToken=${encodeURIComponent(tokens.refreshToken)}` +
        `&userId=${user.id}` +
        `&success=true`;

      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Callback processing error:', error);
      res.redirect(`${config.frontendUrl}/login?error=server_error`);
    }
  }
);

// Debug endpoint untuk check config
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    config: {
      googleClientId: config.google.clientId ? 'Configured' : 'NOT CONFIGURED',
      googleCallbackUrl: config.google.callbackUrl,
      frontendUrl: config.frontendUrl,
      backendUrl: config.serverUrl
    },
    urls: {
      googleOAuth: `${config.serverUrl}/api/auth/google`,
      googleCallback: `${config.serverUrl}/api/auth/google/callback`,
      frontendCallback: `${config.frontendUrl}/auth/callback`
    },
    instructions: '1. Go to /api/auth/google to start OAuth flow'
  });
});

// Test endpoint tanpa passport
router.get('/test-simple', (req, res) => {
  res.json({
    success: true,
    message: 'Auth route is working!',
    timestamp: new Date().toISOString()
  });
});

export default router;