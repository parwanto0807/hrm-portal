// src/utils/jwt.utils.js
import { packages } from './require.js';
import config from '../config/env.js';

const jwt = packages.jsonwebtoken();

export const generateTokens = (user) => {
  try {
    if (!user || !user.id) {
      throw new Error('User object is invalid for token generation');
    }



    const accessToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role || 'EMPLOYEE'
      },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiry }
    );

    const refreshToken = jwt.sign(
      { 
        userId: user.id
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );



    // Helper to convert expiry string (e.g. '2h') to ms
    const ms = (val) => {
      if (!val) return 2 * 60 * 60 * 1000;
      if (typeof val === 'number') return val;
      const unit = val.slice(-1);
      const num = parseInt(val);
      if (unit === 'h') return num * 60 * 60 * 1000;
      if (unit === 'm') return num * 60 * 1000;
      if (unit === 'd') return num * 24 * 60 * 60 * 1000;
      return num * 1000;
    };

    return {
      accessToken,
      refreshToken,
      expiresIn: ms(config.jwt.accessExpiry)
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