import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Shift Patterns...');

  const patterns = [
    {
      name: 'Pola 2 Shift (Mingguan)',
      description: '1 minggu Shift 1, 1 minggu Shift 2, Sabtu-Minggu Libur',
      pattern: 'S1,S1,S1,S1,S1,OFF,OFF,S2,S2,S2,S2,S2,OFF,OFF',
    },
    {
      name: 'Pola 3 Shift (Mingguan)',
      description: '1 minggu Shift 3, 1 minggu Shift 2, 1 minggu Shift 1, Sabtu-Minggu Libur',
      pattern: 'S3,S3,S3,S3,S3,OFF,OFF,S2,S2,S2,S2,S2,OFF,OFF,S1,S1,S1,S1,S1,OFF,OFF',
    },
    {
      name: 'Shift Normal (5-2)',
      description: 'Senin-Jumat Kerja, Sabtu-Minggu Libur',
      pattern: 'S1,S1,S1,S1,S1,OFF,OFF',
    },
    {
      name: 'Rotasi Longshift (14 Hari)',
      description: '1 minggu Longshift 1, 1 minggu Longshift 2, Sabtu-Minggu Libur',
      pattern: 'LS1,LS1,LS1,LS1,LS1,OFF,OFF,LS2,LS2,LS2,LS2,LS2,OFF,OFF',
    }
  ];

  for (const p of patterns) {
    const existing = await prisma.shiftPattern.findFirst({
      where: { name: p.name }
    });

    if (!existing) {
      await prisma.shiftPattern.create({
        data: p
      });
      console.log(`Created pattern: ${p.name}`);
    } else {
      console.log(`Pattern already exists: ${p.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
