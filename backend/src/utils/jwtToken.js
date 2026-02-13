// src/utils/jwtToken.js
import { generateTokens } from './jwt.utils.js'; // Import dari file yang baru Anda kirim

export const sendTokenResponse = (user, statusCode, res) => {
  // 1. Panggil fungsi generate dari jwt.utils.js
  const { accessToken, refreshToken, expiresIn } = generateTokens(user);

  // 2. Setup Opsi Cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  };

  // 3. Set Cookie Access Token (Dynamic basis)
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + expiresIn) 
  });

  // 4. Set Cookie Refresh Token (7 hari default)
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // 5. Hapus password agar tidak terkirim ke frontend
  const { password, ...userWithoutPassword } = user;

  // 6. Kirim JSON
  res.status(statusCode).json({
    success: true,
    tokens: { accessToken, refreshToken },
    user: userWithoutPassword
  });
};