import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
    try {
        const count = await prisma.karyawan.count();
        console.log(`Total Karyawan: ${count}`);

        const sample = await prisma.karyawan.findMany({
            take: 5,
            select: {
                emplId: true,
                nama: true,
                pokokBln: true,
                kdSts: true
            }
        });

        console.log('Sample Karyawan Data:');
        console.log(JSON.stringify(sample, null, 2));

        const nonZeroSalary = await prisma.karyawan.count({
            where: {
                pokokBln: {
                    gt: 0
                }
            }
        });

        console.log(`Karyawan with salary > 0: ${nonZeroSalary}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
