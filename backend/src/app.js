// src/app.js
import { packages } from './utils/require.js';
import config from './config/env.js';

// Load CommonJS packages
const express = packages.express();
const cors = packages.cors();
const helmet = packages.helmet();
const morgan = packages.morgan();
const session = packages.session();
const passport = packages.passport();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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