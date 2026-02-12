import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verify() {
    try {
        console.log('--- VERIFICATION START ---');
        
        // 1. Check Record Counts
        const counts = {
            Karyawan: await prisma.karyawan.count(),
            Gaji: await prisma.gaji.count(),
            Potongan: await prisma.potongan.count(),
            PinjamDet: await prisma.pinjamDet.count(),
            PinjamHdr: await prisma.pinjamHdr.count(),
            Tunjangan: await prisma.tunjangan.count(),
            Rapel: await prisma.rapel.count(),
            JnsJam: await prisma.jnsJam.count(),
            GroupShift: await prisma.groupShift.count()
        };
        console.log('--- COUNTS ---');
        console.log(JSON.stringify(counts, null, 2));

        // 2. Check Recent UUID Population in Gaji
        const recentGaji = await prisma.gaji.findFirst({
            orderBy: { createdAt: 'desc' },
            take: 1
        });
        
        if (recentGaji) {
            console.log('--- RECENT GAJI RECORD ---');
            console.log('ID:', recentGaji.id);
            console.log('Period:', recentGaji.period);
            console.log('Empl ID:', recentGaji.emplId);
            console.log('Company UUID:', recentGaji.companyId); // Should be populated
            console.log('Fact UUID:', recentGaji.factId);       // Should be populated
            console.log('Bag UUID:', recentGaji.bagId);         // Should be populated
            console.log('Dept UUID:', recentGaji.deptId);       // Should be populated
            console.log('Sie UUID:', recentGaji.sieId);         // Should be populated
            console.log('Jabatan UUID:', recentGaji.jabatanId); // Should be populated
        } else {
            console.log('❌ No Gaji records found.');
        }

        // 3. Check Karyawan UUIDs
        const recentKaryawan = await prisma.karyawan.findFirst({
             orderBy: { createdAt: 'desc' },
             take: 1
        });

        if (recentKaryawan) {
            console.log('--- RECENT KARYAWAN RECORD ---');
            console.log('ID:', recentKaryawan.id);
            console.log('Empl ID:', recentKaryawan.emplId);
            console.log('JnsJam UUID:', recentKaryawan.jnsJamId);
            console.log('GroupShift UUID:', recentKaryawan.groupShiftId);
        } else {
             console.log('❌ No Karyawan records found.');
        }

        console.log('--- VERIFICATION END ---');

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
