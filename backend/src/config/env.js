// src/config/env.js
import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5002,
  serverUrl: process.env.SERVER_URL || 'http://localhost:5002',
  frontendUrl: process.env.CLIENT_URL || 'http://localhost:3002',
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : ['http://localhost:3002'],
    credentials: true
  },
  
  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'your-development-session-secret-123',
    maxAge: 24 * 60 * 60 * 1000
  },
  
  // JWT Configuration (TAMBAHKAN INI)
  jwt: {
    secret: process.env.JWT_SECRET || 'development-jwt-secret-key-456',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret-789',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  // Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: `${process.env.SERVER_URL || 'http://localhost:5002'}/api/auth/google/callback`
  }
};

// Debug log
console.log('\n⚙️  CONFIGURATION LOADED:');
console.log('=========================');
console.log('Environment:', config.env);
console.log('Server URL:', config.serverUrl);
console.log('Frontend URL:', config.frontendUrl);
console.log('CORS Origin:', config.cors.origin);
console.log('Google Client ID:', config.google.clientId ? '✅ Set' : '❌ NOT SET');
console.log('JWT Secret:', config.jwt.secret ? '✅ Set' : '⚠️  Using default');
console.log('Session Secret:', config.session.secret ? '✅ Set' : '⚠️  Using default');
console.log('=========================\n');

export default config;