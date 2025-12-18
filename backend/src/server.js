// src/server.js
import app from './app.js';
import config from './config/env.js';
import { prisma } from './config/prisma.js';

// Routes are already setup in app.js

// Health check endpoint (harus sebelum 404)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'HRM Backend API',
    timestamp: new Date().toISOString()
  });
});

// ---------------------------------------------------------
// PERBAIKAN: Hapus path '*' dan biarkan kosong
// Karena ini ditaruh di paling bawah, otomatis akan menangkap
// semua request yang tidak cocok dengan route di atasnya.
// ---------------------------------------------------------
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: config.env === 'development' ? err.message : 'Internal server error',
    ...(config.env === 'development' && { stack: err.stack })
  });
});

const PORT = config.port || 5002;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${config.env} mode
📡 Listening on: ${config.serverUrl}
🔗 Frontend: ${config.frontendUrl}
💾 Database: Connected
  `);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down server...');
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
    
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
    
    setTimeout(() => {
      console.error('❌ Force shutdown');
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error('❌ Shutdown error:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);