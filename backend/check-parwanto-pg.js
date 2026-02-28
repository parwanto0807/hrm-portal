
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkParwantoPG() {
    console.log('--- Postgres Check for PARWANTO ---');
    try {
        const parwanto = await prisma.karyawan.findFirst({
            where: { nama: { contains: 'PARWANTO', mode: 'insensitive' } }
        });
        
        if (!parwanto) {
            console.log('❌ Employee PARWANTO not found in Postgres');
            return;
        }

        console.log(`✅ Found PARWANTO: ${parwanto.nama} (${parwanto.emplId})`);
        
        const gaji = await prisma.gaji.findMany({
            where: { emplId: parwanto.emplId },
            orderBy: { period: 'desc' }
        });

        console.log(`📊 Found ${gaji.length} gaji records`);
        gaji.forEach(g => {
            console.log(`- Period: ${g.period}, G-Bersih: ${g.gBersih}, Date: ${g.tglProses}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkParwantoPG();
