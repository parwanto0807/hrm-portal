// src/server.js
import app from './app.js';
import config from './config/env.js';
import { prisma } from './config/prisma.js';
import { initCronTasks } from './tasks/cronTasks.js';

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

// Initialize Scheduled Tasks
initCronTasks();

// Ensure system user exists for logging
const ensureSystemUser = async () => {
  try {
    // Check if system position exists, if not create a dummy one
    let systemPos = await prisma.sysUserPosition.findUnique({ where: { legacyId: 0 } });
    if (!systemPos) {
      systemPos = await prisma.sysUserPosition.create({
        data: {
          legacyId: 0,
          positionCode: 'SYS',
          positionName: 'System',
          remark: 'System predefined position',
          active: true
        }
      });
    }

    // Check if dummy karyawan exists for system user
    let systemKaryawan = await prisma.karyawan.findUnique({ where: { emplId: 'SYSTEM' } });
    if (!systemKaryawan) {
      systemKaryawan = await prisma.karyawan.create({
        data: {
          emplId: 'SYSTEM',
          nik: 'SYSTEM',
          nama: 'System Process',
          kdSts: 'AKTIF'
        }
      });
    }

    const systemUser = await prisma.sysUser.findUnique({
      where: { username: 'system' }
    });

    if (!systemUser) {
      await prisma.sysUser.create({
        data: {
          username: 'system',
          email: 'system@local.host',
          password: 'system_no_login',
          name: 'System Agent',
          nik: 'SYSTEM',
          emplId: 'SYSTEM',
          legacyId: 0,
          positionId: 0,
          active: true
        }
      });

    } else if (systemUser.legacyId === null || systemUser.legacyId === undefined) {
      // Ensure existing system user has legacyId: 0
      await prisma.sysUser.update({
        where: { id: systemUser.id },
        data: { legacyId: 0 }
      });

    }
  } catch (error) {
    console.warn('⚠️ Could not initialize system user:', error.message);
  }
};

ensureSystemUser();

const server = app.listen(PORT, () => {
  // Server started

});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down server...');
  
  try {
    await prisma.$disconnect();

    
    server.close(() => {

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