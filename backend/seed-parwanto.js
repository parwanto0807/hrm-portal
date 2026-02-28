
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedParwanto() {
    console.log('--- Seeding Payroll Data for PARWANTO ---');
    const emplId = '000000699';
    const targetPeriods = ['202510', '202511', '202512', '202601', '202602'];

    try {
        // 1. Get Template
        const template = await prisma.gaji.findFirst({
            where: { emplId, period: '202509' }
        });

        if (!template) {
            console.error('❌ Template record (202509) not found for Parwanto!');
            return;
        }
        console.log('✅ Found template record from 202509');

        // 2. Ensure Periods exist
        for (const pid of targetPeriods) {
            const year = parseInt(pid.substring(0, 4));
            const month = parseInt(pid.substring(4, 6));
            
            await prisma.periode.upsert({
                where: { periodeId: pid },
                update: {},
                create: {
                    periodeId: pid,
                    awal: new Date(year, month - 1, 1),
                    akhir: new Date(year, month, 0),
                    tahun: year,
                    bulan: month,
                    nama: `Periode ${pid}`,
                    kdCmpy: template.kdCmpy || '001',
                    dataDefa: false,
                    tutup: false
                }
            });
            console.log(`✅ Period ${pid} checked/created`);
        }

        // 3. Create Gaji records
        for (const pid of targetPeriods) {
            const { id, createdAt, updatedAt, ...rest } = template;
            const year = parseInt(pid.substring(0, 4));
            const month = parseInt(pid.substring(4, 6));
            
            const newData = {
                ...rest,
                period: pid,
                tglProses: new Date(year, month - 1, 28), // Simulate end of month processing
                paidDate: new Date(year, month - 1, 28),
                closing: true
            };

            await prisma.gaji.upsert({
                where: { gaji_unique: { period: pid, emplId: emplId } },
                update: newData,
                create: newData
            });
            console.log(`🚀 Created/Updated Gaji for period ${pid}`);
        }

        console.log('\n✨ Seeding completed successfully!');

    } catch (err) {
        console.error('❌ Error during seeding:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seedParwanto();
