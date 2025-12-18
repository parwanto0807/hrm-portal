import { packages } from './utils/require.js';
import config from './config/env.js';
import cookieParser from 'cookie-parser';

// Import Routes
import userRoute from './routes/auth/userRoutes.js';
import authRoute from './routes/auth/authRoutes.js';
import companyRouter from './routes/company/companyRouters.js';

const express = packages.express();
const cors = packages.cors();
const helmet = packages.helmet();
const morgan = packages.morgan();
const session = packages.session();
const passport = packages.passport();

const app = express();

// 1. Trust Proxy (Wajib ON jika deploy di Vercel/Heroku/AWS/VPS dengan Nginx)
app.set('trust proxy', 1);

app.use(helmet());

// ==========================================
// 🔧 CONFIG CORS PRODUCTION READY
// ==========================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  config.cors.origin,       // Pastikan .env production sudah diisi URL frontend asli
  // Tambahkan domain production manual jika env belum diupdate:
  // 'https://nama-website-anda.com', 
  // 'https://admin.nama-website-anda.com' 
];

app.use(cors({
  origin: function (origin, callback) {
    // Izinkan request server-to-server (tanpa origin)
    if (!origin) return callback(null, true);
    
    // Perbaikan Logika:
    // Jika origin ada di whitelist ATAU environment BUKAN production, izinkan.
    if (allowedOrigins.indexOf(origin) !== -1 || config.env !== 'production') {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Logger: Gunakan 'combined' di production untuk log lebih detail
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ==========================================
// 🔧 SESSION CONFIG
// ==========================================
// Catatan: Untuk Production High-Traffic, disarankan pakai Redis/Postgres Store
// agar user tidak logout saat server restart.
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  proxy: true, // PENTING: Agar cookie secure terbaca di balik proxy (Load Balancer)
  cookie: {
    secure: config.env === 'production', // Wajib TRUE di production (HTTPS)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    // Jika Frontend & Backend beda domain (frontend.com & api.backend.com) pakai 'none'
    // Jika satu domain (app.com & app.com/api) pakai 'lax'
    sameSite: config.env === 'production' ? 'none' : 'lax' 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

import './config/passport.config.js';

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    env: config.env,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'HRM Backend API Running...' });
});

// Mount Routes
app.use('/api/auth', authRoute); 
app.use('/api/users', userRoute);
app.use('/api/company', companyRouter);

// Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 App Error:', err); // Tetap log error di console server production

  const statusCode = err.statusCode || 500;
  // Di Production, jangan tampilkan detail error sistem ke user
  const message = config.env === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.env === 'development' && { stack: err.stack })
  });
});

export default app;