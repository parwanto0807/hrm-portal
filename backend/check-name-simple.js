import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const farhanKaryawan = await prisma.karyawan.findMany({
      where: {
        OR: [
          { nama: { contains: 'Farhan', mode: 'insensitive' } },
          { email: { contains: 'farhan', mode: 'insensitive' } }
        ]
      },
      select: {
          nama: true,
          email: true,
          userId: true
      }
    });
    console.log('FARHAN_CHECK_RESULTS:');
    console.log(JSON.stringify(farhanKaryawan, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
