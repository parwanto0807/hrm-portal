import { Router } from 'express';
import passport from 'passport';
import config from '../../config/env.js';

// Import Controller yang baru kita buat
import { 
  googleLogin, 
  googleCallbackHandler, 
  login, 
  refreshToken, 
  logout, 
  getDebugConfig, 
} from '../../controllers/auth/authController.js';

const router = Router();

// ==========================================
// GOOGLE AUTH
// ==========================================

// Endpoint login dari Frontend (Client-Side Flow / Popup)
router.post('/google', googleLogin);

// Endpoint Callback (Server-Side Flow / Redirect)
// Middleware Passport dipisah agar routing lebih jelas
const passportAuthMiddleware = (req, res, next) => {
  if (req.query.error === 'access_denied') {
    return res.redirect(`${config.frontendUrl}/auth/google?error=cancelled`);
  }
  passport.authenticate('google', {
    failureRedirect: `${config.frontendUrl}/auth/google?error=auth_failed`,
    session: false
  })(req, res, next);
};

router.get('/google/callback', passportAuthMiddleware, googleCallbackHandler);

// ==========================================
// STANDARD AUTH
// ==========================================

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// ==========================================
// UTILS / DEBUG
// ==========================================
router.get('/debug', getDebugConfig);

export default router;