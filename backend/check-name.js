import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const allKaryawan = await prisma.karyawan.findMany({
      select: { nama: true, email: true },
      take: 20
    });
    console.log('Sample Karyawan:', JSON.stringify(allKaryawan, null, 2));

    const farhanKaryawan = await prisma.karyawan.findMany({
      where: {
        OR: [
          { nama: { contains: 'Farhan', mode: 'insensitive' } },
          { email: { contains: 'farhan', mode: 'insensitive' } }
        ]
      }
    });
    console.log('Search Result:', JSON.stringify(farhanKaryawan, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
