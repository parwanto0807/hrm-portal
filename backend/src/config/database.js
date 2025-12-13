import { PrismaClient } from '../generated/prisma/index.js'; // Import dari custom path
import config from './env.js'; // Import config Zod Anda

const globalForPrisma = global;

// Inisialisasi Prisma Client dengan URL dari config env.js Anda
export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: config.database.url, // Mengambil URL yang sudah divalidasi Zod
    },
  },
  // Opsi log (opsional, bagus untuk debug)
  log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (config.env !== 'production') {
  globalForPrisma.prisma = prisma;
}