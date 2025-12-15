// controllers/authController.js
import { OAuth2Client } from 'google-auth-library';
import prisma from '../../config/prisma.js';
import { sendTokenResponse } from '../utils/jwtToken.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub: googleId } = ticket.getPayload();

    const user = await prisma.$transaction(async (tx) => {
      let existingUser = await tx.user.findUnique({
        where: { email: email },
        include: { accounts: true }
      });

      if (!existingUser) {
        existingUser = await tx.user.create({
          data: {
            email,
            name,
            image: picture,
            role: 'EMPLOYEE',
            accounts: {
              create: {
                provider: 'google',
                providerAccountId: googleId,
                type: 'oauth',
              }
            }
          }
        });
      } else {
        // Cek tautan akun
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
        
        // Update foto terbaru
        await tx.user.update({
          where: { id: existingUser.id },
          data: { name, image: picture }
        });
      }

      return existingUser;
    });

    // Kirim response dengan format yang diharapkan frontend
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan saat login", 
      error: error.message 
    });
  }
};