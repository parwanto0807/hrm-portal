// src/app.js
import { packages } from './utils/require.js';
import config from './config/env.js';

// ✅ Import Cookie Parser (Standard Import karena support ESM/CJS interop)
import cookieParser from 'cookie-parser';

// ✅ Import Routes yang sudah kita buat
import userRoute from './routes/auth/userRoutes.js';
import authRoute from './routes/auth/authRoutes.js'; // Asumsi Anda sudah membuat file ini untuk login

// Load CommonJS packages
const express = packages.express();
const cors = packages.cors();
const helmet = packages.helmet();
const morgan = packages.morgan();
const session = packages.session();
const passport = packages.passport();

const app = express();

app.set('trust proxy', 1);

// Middleware
app.use(helmet());

// Update CORS untuk mengizinkan Credentials (Cookie)
app.use(cors({
  origin: config.cors.origin, // Pastikan ini URL frontend (misal: http://localhost:3000)
  credentials: true, // WAJIB: Agar browser mau mengirim cookie/token balik ke server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Pasang Cookie Parser (Sebelum Session & Routes)
app.use(cookieParser());

app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.env === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: config.env === 'production' ? 'none' : 'lax'
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Import passport config
import './config/passport.config.js';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'HRM Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: config.env
  });
});

// ✅ MOUNT ROUTES (Daftarkan Route Disini)
// Prefix '/api/auth' untuk login/google
app.use('/api/auth', authRoute); 

// Prefix '/api/users' untuk profile/crud user
app.use('/api/users', userRoute);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to HRM Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      health: '/api/health'
    },
    docs: `${config.serverUrl}/api/health`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 App Error:', err);

  const statusCode = err.statusCode || 500;
  const message = config.env === 'development' 
    ? err.message 
    : 'Internal server error';

  const response = {
    success: false,
    error: message,
    ...(config.env === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
});

export default app;