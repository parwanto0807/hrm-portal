import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const desc = await prisma.descAbsen.findMany();
    console.log('Absence Descriptions:');
    desc.forEach(d => {
      console.log(`${d.kodeDesc} - ${d.keterangan}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
