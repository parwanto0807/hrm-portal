import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting manual SQL migration to add UUID columns...');

  // 1. Add id columns to master tables if they don't exist
  // We use gen_random_uuid() for Postgres to auto-populate existing rows
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE jnsjam ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid()');
    await prisma.$executeRawUnsafe('ALTER TABLE groupshift ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid()');
    console.log('Added id columns to jnsjam and groupshift.');
  } catch (e) {
    console.log('Note: Some columns might already exist or need extension: ' + e.message);
  }

  // 2. Add FK columns to dependent tables
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE absent ADD COLUMN IF NOT EXISTS jns_jam_id UUID');
    await prisma.$executeRawUnsafe('ALTER TABLE absent ADD COLUMN IF NOT EXISTS group_shift_id UUID');
    await prisma.$executeRawUnsafe('ALTER TABLE dshift ADD COLUMN IF NOT EXISTS group_shift_id UUID');
    await prisma.$executeRawUnsafe('ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS jns_jam_id UUID');
    await prisma.$executeRawUnsafe('ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS group_shift_id UUID');
    await prisma.$executeRawUnsafe('ALTER TABLE lembur ADD COLUMN IF NOT EXISTS jns_jam_id UUID');
    console.log('Added FK columns to dependent tables.');
  } catch (e) {
    console.log('Error adding FK columns: ' + e.message);
  }

  // 3. Populate FK columns based on codes
  console.log('Populating FK columns based on existing codes...');
  
  // Absent -> JnsJam
  await prisma.$executeRawUnsafe(`
    UPDATE absent a 
    SET jns_jam_id = j.id 
    FROM jnsjam j 
    WHERE a."KD_JAM" = j."KD_JAM" AND a.jns_jam_id IS NULL
  `);

  // Absent -> GroupShift
  await prisma.$executeRawUnsafe(`
    UPDATE absent a 
    SET group_shift_id = g.id 
    FROM groupshift g 
    WHERE a."GROUP_SHIFT" = g."GROUP_SHIFT" AND a.group_shift_id IS NULL
  `);

  // Dshift -> GroupShift
  await prisma.$executeRawUnsafe(`
    UPDATE dshift d 
    SET group_shift_id = g.id 
    FROM groupshift g 
    WHERE d."GROUP_SHIFT" = g."GROUP_SHIFT" AND d.group_shift_id IS NULL
  `);

  // Karyawan -> JnsJam
  await prisma.$executeRawUnsafe(`
    UPDATE karyawan k 
    SET jns_jam_id = j.id 
    FROM jnsjam j 
    WHERE k."KD_JAM" = j."KD_JAM" AND k.jns_jam_id IS NULL
  `);

  // Karyawan -> GroupShift
  await prisma.$executeRawUnsafe(`
    UPDATE karyawan k 
    SET group_shift_id = g.id 
    FROM groupshift g 
    WHERE k."GROUP_SHIFT" = g."GROUP_SHIFT" AND k.group_shift_id IS NULL
  `);

  // Lembur -> JnsJam
  await prisma.$executeRawUnsafe(`
    UPDATE lembur l 
    SET jns_jam_id = j.id 
    FROM jnsjam j 
    WHERE l."KD_JAM" = j."KD_JAM" AND l.jns_jam_id IS NULL
  `);

  console.log('Migration scripts completed.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
