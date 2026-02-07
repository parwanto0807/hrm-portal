const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const targetNik = '000000067';
    // Check range
    const startDate = new Date('2025-12-14'); // The specific Sunday
    const endDate = new Date('2025-12-14');

    console.log(`\n🔍 Checking Postgres Absent for NIK: ${targetNik} on Sunday 14-Dec-2025`);

    // Find the record
    const absentRec = await prisma.absent.findFirst({
        where: {
            karyawan: { nik: targetNik },
            tglAbsen: {
                gte: startDate,
                lte: endDate
            }
        },
        select: {
            tglAbsen: true,
            nik: true,
            kdAbsen: true,
            kdJam: true,
            stdMasuk: true,
            stdKeluar: true,
            realMasuk: true,
            realKeluar: true,
            lambat: true,
            cepat: true,
            karyawan: {
                select: { nama: true }
            }
        }
    });

    if (!absentRec) {
        console.log('❌ No record found in Postgres yet.');
    } else {
        console.log('✅ Record Found:');
        console.table([absentRec]);
        
        if (absentRec.kdJam === null && absentRec.kdAbsen === 'H') {
             console.log('SUCCESS: Schedule is NULL (Off Day) but Status is Hadir (Worked on Off Day).');
        } else if (absentRec.kdJam === 'JK1') {
             console.log('FAILURE: Schedule is still JK1.');
        } else {
             console.log('RESULT: Check table above.');
        }
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
