import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function manualUpdate() {
    try {
        const record = await prisma.gaji.findFirst();
        if (!record) {
            console.log('No records found in Postgres');
            process.exit(0);
        }
        
        console.log(`Updating record ${record.emplId} for period ${record.period}`);
        const updated = await prisma.gaji.update({
            where: { id: record.id },
            data: { pphEmpl: 123.45 }
        });
        
        console.log(`Updated record pphEmpl: ${updated.pphEmpl}`);
        
        // Verify it persists
        const refetched = await prisma.gaji.findUnique({
            where: { id: record.id }
        });
        console.log(`Refetched pphEmpl: ${refetched.pphEmpl}`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

manualUpdate();
