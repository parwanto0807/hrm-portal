const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Generating dummy PPh 21 data for year 2026 & 2025...');
        
        // Dapatkan data gaji yang period-nya 2025 atau 2026 dan gKotor > 0
        const data = await prisma.gaji.findMany({ 
            where: { 
                gKotor: { gt: 0 },
                OR: [
                    { period: { startsWith: '2026' } },
                    { period: { startsWith: '2025' } },
                    { period: { startsWith: '2024' } },
                    { period: { startsWith: '2012' } }, // Some of the mock data was 2012
                ]
            },
            select: { id: true, gKotor: true }
        });
        
        console.log(`Found ${data.length} records to update...`);
        
        let count = 0;
        for (const row of data) {
            // Simulasi PPh 21 = 5% dari Gaji Kotor
            const pajak = parseFloat(row.gKotor) * 0.05;
            await prisma.gaji.update({
                where: { id: row.id },
                data: { tPph21: pajak }
            });
            count++;
            if (count % 500 === 0) console.log(`Updated ${count} records...`);
        }
        
        console.log('Finished updating PPh 21 data!');
    } finally {
        await prisma.$disconnect();
    }
}
main();
