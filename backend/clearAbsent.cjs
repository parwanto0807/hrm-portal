const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('⏳ Clearing AttLog table...');
    const resultAttLog = await prisma.attLog.deleteMany({});
    console.log(`✅ Cleared ${resultAttLog.count} records from AttLog table.`);

    console.log('⏳ Clearing Absent table...');
    const result = await prisma.absent.deleteMany({});
    console.log(`✅ Cleared ${result.count} records from Absent table.`);
  } catch (e) {
    console.error('❌ Error clearing records:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
