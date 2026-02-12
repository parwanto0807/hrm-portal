import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const types = await prisma.jnsJam.findMany();
    console.log('Shift Types:');
    types.forEach(t => {
      console.log(`${t.kdJam} - ${t.jnsJam} [${t.awalJam || t.jamMasuk}-${t.akhirJam || t.jamKeluar}]`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
