// src/config/prisma.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
  errorFormat: 'pretty'
});

// Connection check
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Add query logging in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    console.log('📝 Query:', e.query);
    console.log('⏱️  Duration:', `${e.duration}ms`);
  });
}

export { prisma };