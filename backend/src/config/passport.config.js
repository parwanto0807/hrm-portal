// src/config/passport.config.js
import { packages } from '../utils/require.js';
import config from './env.js';
import { prisma } from './prisma.js';
import { generateTokens } from '../utils/jwt.utils.js';

// Load passport packages
const passport = packages.passport();
const GoogleStrategy = packages['passport-google-oauth20']().Strategy;

console.log('🔄 Initializing Passport strategies...');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackUrl,
    passReqToCallback: true,
    scope: ['profile', 'email', 'openid'],
    accessType: 'offline',
    prompt: 'consent'
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('📱 Google OAuth profile received:', {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName
      });

      if (!profile.emails || !profile.emails[0]?.value) {
        console.error('❌ No email found in Google profile');
        return done(new Error('No email found in Google profile'));
      }

      const email = profile.emails[0].value;
      const name = profile.displayName || email.split('@')[0];
      const image = profile.photos?.[0]?.value;

      // Cari atau buat user dengan transaction
      const result = await prisma.$transaction(async (tx) => {
        // Cari user by email
        let user = await tx.user.findUnique({
          where: { email }
        });

        if (!user) {
          console.log('👤 Creating new user for:', email);
          
          user = await tx.user.create({
            data: {
              email,
              name,
              image,
              role: 'EMPLOYEE',
              isActive: true
            }
          });
          
          console.log('✅ New user created:', user.id);
        } else {
          console.log('👤 Existing user found:', user.id);
          
          // Update user info jika ada perubahan
          user = await tx.user.update({
            where: { id: user.id },
            data: { 
              name: name || user.name,
              image: image || user.image 
            }
          });
        }

        // Upsert account (Google)
        await tx.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: 'google',
              providerAccountId: profile.id
            }
          },
          update: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            updatedAt: new Date()
          },
          create: {
            userId: user.id,
            provider: 'google',
            providerAccountId: profile.id,
            type: 'oauth',
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: 'Bearer'
          }
        });

        return user;
      });

      // PENTING: Format user object dengan benar
      const userResponse = {
        id: result.id,
        email: result.email,
        name: result.name,
        image: result.image,
        role: result.role || 'EMPLOYEE'
      };

      // Generate tokens
      const tokens = generateTokens(userResponse);
      
      console.log('✅ Authentication successful for:', userResponse.email);
      console.log('🎟️ Tokens generated for user ID:', userResponse.id);
      
      // PENTING: Return object dengan structure yang benar
      return done(null, { 
        user: userResponse,
        tokens: tokens 
      });

    } catch (error) {
      console.error('❌ Google strategy error:', error);
      return done(error, false);
    }
  }
));

// Serialize/Deserialize user
passport.serializeUser((data, done) => {
  // Data adalah { user, tokens } dari strategy
  done(null, data.user?.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isActive: true
      }
    });
    
    if (!user) {
      return done(new Error('User not found'), null);
    }
    
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

console.log('✅ Passport strategies initialized successfully');

export default passport;