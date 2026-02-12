
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listColumns() {
    try {
        const tables = ['gaji', 'potongan', 'pinjamdet'];
        
        for (const table of tables) {
            console.log(`\n📋 Columns for table: ${table}`);
            const cols = await prisma.$queryRaw`
                SELECT column_name
                FROM information_schema.columns 
                WHERE table_name = ${table}
            `;
            console.log(cols.map(c => c.column_name).sort().join(', '));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listColumns();
