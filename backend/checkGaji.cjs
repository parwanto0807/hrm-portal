const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const data = await prisma.gaji.findMany({ select: { period: true, gKotor: true, tPph21: true } });
        console.log('Rows:', data.length);
        console.log('Total gKotor:', data.reduce((sum, r) => sum + parseFloat(r.gKotor || 0), 0));
        console.log('Total tPph21:', data.reduce((sum, r) => sum + parseFloat(r.tPph21 || 0), 0));
        
        // Show some samples
        if (data.length > 0) {
            console.log('Sample rows:', data.slice(0, 5));
        }
    } finally {
        await prisma.$disconnect();
    }
}
main();
