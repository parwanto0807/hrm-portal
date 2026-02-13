// src/config/prisma.js
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['warn', 'error'],
  errorFormat: 'pretty'
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Connection check
prisma.$connect()
  .then(() => {

  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    // Don't exit process in dev, it kills the nodemon watcher too aggressively sometimes
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

// Add query logging details in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {

  });
}

export { prisma };