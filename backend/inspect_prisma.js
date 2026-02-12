
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));

// Inspect Gaji fields by forcing an error or checking dmmf if available (not directly)
// OR just try a findFirst without where to see what we get
async function inspect() {
    try {
        const sample = await prisma.gaji.findFirst();
        console.log('Sample Gaji Record Keys:', sample ? JSON.stringify(Object.keys(sample)) : 'No records found');
    } catch (e) {
        console.error('Error inspecting:', e);
    } finally {
        await prisma.$disconnect();
    }
}

inspect();
