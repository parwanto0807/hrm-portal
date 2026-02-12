import { packages } from './utils/require.js';
import config from './config/env.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

// Import Routes
import userRoute from './routes/auth/userRoutes.js';
import authRoute from './routes/auth/authRoutes.js';
import companyRouter from './routes/company/companyRouters.js';
import uploadRouter from './routes/uploadRoutes.js';
import mysqlRoute from './routes/mysql.routes.js';
import bankRoute from './routes/bankRoutes.js';
import positionRoute from './routes/positionRoutes.js';
import orgRoute from './routes/master/orgStructureRoutes.js';
import employeeLevelRoute from './routes/master/employeeLevelRoutes.js';
import factoryRoute from './routes/master/factoryRoutes.js';
import employeeRoute from './routes/master/employeeRoutes.js';
import payrollRoute from './routes/payrollRoutes.js';
import requestRoute from './routes/requestRoutes.js';
import menuRoute from './routes/menuRoutes.js';
import absentRoute from './routes/absentRoutes.js';
import holidayRoute from './routes/master/holidayRoutes.js';
import rbacRoute from './routes/rbacRoutes.js';
import historyRoute from './routes/historyRoutes.js';
import shiftRoute from './routes/shiftRoutes.js';
import dashboardRoute from './routes/dashboardRoutes.js';
import notificationRoute from './routes/notification.routes.js';


import { auditLog } from './middleware/audit.middleware.js';

const express = packages.express();
const cors = packages.cors();
const helmet = packages.helmet();
const morgan = packages.morgan();
const session = packages.session();
const passport = packages.passport();

const app = express();

// 1. Trust Proxy (Wajib ON jika deploy di Vercel/Heroku/AWS/VPS dengan Nginx)
app.set('trust proxy', 1);

// COOP Policy untuk Google Login Popup
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ==========================================
// 🔧 CONFIG CORS PRODUCTION READY
// ==========================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://solusiit.id',     // HARDCODED PRODUCTION DOMAIN
  'https://www.solusiit.id',
  config.cors.origin,       // Pastikan .env production sudah diisi URL frontend asli
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
      console.log('🚫 CORS Blocked Origin:', origin);
      console.log('Allowed Origins:', allowedOrigins);
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
app.use(auditLog);
app.use(express.static(path.join(process.cwd(), 'public'))); // Serve static files
app.use('/api/public', express.static(path.join(process.cwd(), 'public'))); // Serve static files via API route (for Nginx proxy compatibility)
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
app.use('/api/notifications', notificationRoute);
app.use('/api/auth', authRoute); 
app.use('/api/users', userRoute);
app.use('/api/company', companyRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/mysql', mysqlRoute);
app.use('/api/banks', bankRoute);
app.use('/api/positions', positionRoute);
app.use('/api/org', orgRoute);
app.use('/api/levels', employeeLevelRoute);
app.use('/api/factories', factoryRoute);
app.use('/api/employees', employeeRoute);
app.use('/api/payroll', payrollRoute);
app.use('/api/requests', requestRoute);
app.use('/api/menus', menuRoute);
app.use('/api/rbac', rbacRoute);
app.use('/api/history', historyRoute);
app.use('/api/absent', absentRoute);
app.use('/api/holidays', holidayRoute);
app.use('/api/shifts', shiftRoute);
app.use('/api/dashboard', dashboardRoute);


// Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 App Error:', err); // Tetap log error di console server production

  const statusCode = err.statusCode || 500;
  
  // FORCE SHOW ERROR IN PRODUCTION FOR DEBUGGING
  // const message = config.env === 'production' && statusCode === 500 ? 'Internal server error' : err.message;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.env === 'development' && { stack: err.stack })
  });
});

export default app;