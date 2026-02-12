import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('Backing up data via raw query...');
  const jnsJam = await prisma.$queryRaw`SELECT * FROM jnsjam`;
  const groupShift = await prisma.$queryRaw`SELECT * FROM groupshift`;
  
  const backup = {
    jnsJam,
    groupShift
  };
  
  fs.writeFileSync('backup_refactor.json', JSON.stringify(backup, null, 2));
  console.log('Backup saved to backup_refactor.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());
