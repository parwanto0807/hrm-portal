const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateShifts() {
  await prisma.jnsJam.updateMany({ where: { kdJam: 'A' }, data: { jamMasuk: '08:00', jamKeluar: '17:00' } });
  await prisma.jnsJam.updateMany({ where: { kdJam: 'B' }, data: { jamMasuk: '08:00', jamKeluar: '16:00' } });
  await prisma.jnsJam.updateMany({ where: { kdJam: 'C' }, data: { jamMasuk: '08:00', jamKeluar: '20:00' } });
  await prisma.jnsJam.updateMany({ where: { kdJam: 'D' }, data: { jamMasuk: '07:00', jamKeluar: '16:00' } });
  await prisma.jnsJam.updateMany({ where: { kdJam: 'E' }, data: { jamMasuk: '07:00', jamKeluar: '19:00' } });
  console.log("Updated dummy shifts.");
}

updateShifts().catch(console.error).finally(() => prisma.$disconnect());
