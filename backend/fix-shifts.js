import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Forcing column length update for jnsjam.KD_JAM...');
  await prisma.$executeRawUnsafe('ALTER TABLE jnsjam ALTER COLUMN "KD_JAM" TYPE varchar(10)');
  console.log('Success: KD_JAM is now varchar(10)');

  const shifts = [
    { kdJam: 'S1', jnsJam: 'Shift 1 (Pagi)', jamMasuk: '07:00', jamKeluar: '15:00' },
    { kdJam: 'S2', jnsJam: 'Shift 2 (Sore)', jamMasuk: '15:00', jamKeluar: '23:00' },
    { kdJam: 'S3', jnsJam: 'Shift 3 (Malam)', jamMasuk: '23:00', jamKeluar: '07:00' },
    { kdJam: 'LS1', jnsJam: 'Longshift 1', jamMasuk: '07:00', jamKeluar: '19:00' },
    { kdJam: 'LS2', jnsJam: 'Longshift 2', jamMasuk: '19:00', jamKeluar: '07:00' },
    { kdJam: 'OFF', jnsJam: 'Libur', jamMasuk: '00:00', jamKeluar: '00:00' }
  ];

  console.log('Upserting standard shift types...');
  for (const s of shifts) {
    await prisma.jnsJam.upsert({
      where: { kdJam: s.kdJam },
      update: s,
      create: s
    });
    console.log(`Upserted: ${s.kdJam}`);
  }
  console.log('All standard shifts ready.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
