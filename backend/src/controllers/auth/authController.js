import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js'; // Pastikan path ini benar

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Verifikasi Token ke Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub: googleId } = ticket.getPayload();

    // 2. Cari atau Buat User di Database (Sesuai Schema Anda)
    // Kita gunakan prisma transaction agar User dan Account terbuat bersamaan
    const user = await prisma.$transaction(async (tx) => {
      
      // A. Cek apakah user dengan email ini sudah ada?
      let existingUser = await tx.user.findUnique({
        where: { email: email },
        include: { accounts: true }
      });

      if (!existingUser) {
        // B. Jika belum ada, Buat User BARU + Relasi Account
        existingUser = await tx.user.create({
          data: {
            email,
            name,
            image: picture, // ✅ Sesuai schema (bukan avatar)
            role: 'EMPLOYEE', // ✅ Sesuai Enum (Huruf Besar)
            accounts: {
              create: {
                provider: 'google',
                providerAccountId: googleId,
                type: 'oauth',
                // Field lain di tabel Account opsional (String?) jadi aman dikosongkan
              }
            }
          }
        });
      } else {
        // C. Jika user sudah ada, cek apakah Account Google sudah tertaut?
        const linkedAccount = existingUser.accounts.find(
          acc => acc.provider === 'google' && acc.providerAccountId === googleId
        );

        // Jika belum tertaut (misal dulu login email biasa, sekarang pakai Google), tautkan sekarang
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
        
        // Opsional: Update foto/nama user jika berubah di Google
        await tx.user.update({
            where: { id: existingUser.id },
            data: { 
                name: name,
                image: picture
            }
        });
      }

      return existingUser;
    });

    // 3. Buat JWT Token Aplikasi
    const appToken = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: "Login Berhasil",
      token: appToken,
      user: { 
        name: user.name, 
        role: user.role,
        image: user.image
      }
    });

  } catch (error) {
    console.error("Auth Error:", error); // Lihat error detail di terminal
    res.status(500).json({ 
        message: "Terjadi kesalahan saat login", 
        error: error.message 
    });
  }
};