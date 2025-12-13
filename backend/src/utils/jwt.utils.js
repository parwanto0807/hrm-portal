// src/utils/jwt.utils.js
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

const generateTokens = (user) => {
  const accessTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const refreshTokenPayload = {
    userId: user.id
  };

  const accessToken = jwt.sign(
    accessTokenPayload,
    config.jwt.secret,
    { 
      expiresIn: config.jwt.expiresIn,
      issuer: 'hrm-backend',
      audience: 'hrm-frontend'
    }
  );

  const refreshToken = jwt.sign(
    refreshTokenPayload,
    config.jwt.refreshSecret,
    { 
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'hrm-backend',
      audience: 'hrm-frontend'
    }
  );

  return { 
    accessToken, 
    refreshToken,
    expiresIn: config.jwt.expiresIn
  };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'hrm-backend',
      audience: 'hrm-frontend'
    });
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'hrm-backend',
      audience: 'hrm-frontend'
    });
  } catch (error) {
    console.error('Refresh token verification failed:', error.message);
    return null;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

export {
  generateTokens,
  verifyToken,
  verifyRefreshToken,
  decodeToken
};