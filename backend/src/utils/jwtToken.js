// utils/jwtToken.js
import jwt from 'jsonwebtoken';

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

export const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = signToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  // Simpan refreshToken di cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Hapus password dari response
  const { password, ...userWithoutPassword } = user;

  res.status(statusCode).json({
    success: true,
    tokens: {
      accessToken,  // Format yang diharapkan frontend
      refreshToken  // Juga kirim refreshToken di response
    },
    user: userWithoutPassword
  });
};