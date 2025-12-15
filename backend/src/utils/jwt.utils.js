// src/utils/jwt.utils.js
import { packages } from './require.js';
import config from '../config/env.js';

const jwt = packages.jsonwebtoken();

export const generateTokens = (user) => {
  try {
    if (!user || !user.id) {
      throw new Error('User object is invalid for token generation');
    }

    console.log('🔑 Generating tokens for user ID:', user.id);

    const accessToken = jwt.sign(
      { 
        userId: user.id,  // PENTING: gunakan userId, bukan id
        email: user.email,
        role: user.role || 'EMPLOYEE'
      },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiry || '15m' }
    );

    const refreshToken = jwt.sign(
      { 
        userId: user.id  // PENTING: gunakan userId
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry || '7d' }
    );

    console.log('✅ Tokens generated successfully');

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 * 1000
    };
  } catch (error) {
    console.error('❌ Token generation error:', error);
    throw error;
  }
};

export const verifyToken = (token, type = 'access') => {
  try {
    const secret = type === 'refresh' 
      ? config.jwt.refreshSecret 
      : config.jwt.secret;
    
    return jwt.verify(token, secret);
  } catch (error) {
    console.error(`❌ ${type} token verification error:`, error.message);
    throw error;
  }
};