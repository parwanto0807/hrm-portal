// src/config/passport.config.js
import { packages } from '../utils/require.js';
import config from './env.js';
import { prisma } from './prisma.js';
import { generateTokens } from '../utils/jwt.utils.js';

// Load passport packages
const passport = packages.passport();
const GoogleStrategy = packages['passport-google-oauth20']().Strategy;
const JwtStrategy = packages['passport-jwt']().Strategy;
const ExtractJwt = packages['passport-jwt']().ExtractJwt;

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackUrl,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('📱 Google OAuth profile received:', profile.id);

      let user = await prisma.user.findUnique({
        where: { email: profile.emails?.[0]?.value }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            image: profile.photos?.[0]?.value,
            role: 'EMPLOYEE'
          }
        });
        console.log('✅ User created:', user.email);
      }

      await prisma.account.upsert({
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
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: Math.floor(Date.now() / 1000) + 3600
        }
      });

      const tokens = generateTokens(user);
      console.log('✅ Tokens generated for user:', user.email);
      
      return done(null, { user, tokens });
    } catch (error) {
      console.error('❌ Google strategy error:', error);
      return done(error);
    }
  }
));

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.secret
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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
      return done(null, false);
    }

    if (!user.isActive) {
      return done(new Error('User account is inactive'), false);
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize/Deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
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
    done(null, user);
  } catch (error) {
    done(error);
  }
});

console.log('✅ Passport strategies initialized');

export default passport;