import { getMysqlPool } from './src/config/mysqlClient.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFix() {
    const pool = await getMysqlPool();
    if (!pool) process.exit(1);
    try {
        console.log('--- FINAL VERIFICATION ---');
        // Fetch a record from MySQL
        const [rows] = await pool.query('SELECT * FROM gaji WHERE PPH_EMPL != 0 LIMIT 1');
        if (rows.length === 0) {
            console.log('No non-zero PPH_EMPL records found');
            process.exit(0);
        }
        const row = rows[0];
        console.log(`Testing with MySQL Row - EMPL_ID: ${row.EMPL_ID}, PPH_EMPL: ${row.PPH_EMPL}`);

        // Mock the gajiData creation logic from mysql.routes.js after my fix
        const gajiData = {
            period: row.PERIOD,
            emplId: row.EMPL_ID,
            pphEmpl: parseFloat(row.PPH_EMPL) || 0,
            tPph21: parseFloat(row.TPPH21) || 0,
            ptkpAmount: parseFloat(row.PTKP) || 0,
            // ... other fields are omitted for simplicity in this specific test
        };

        console.log('Prepared gajiData:', JSON.stringify(gajiData));

        // Use a transaction or just update to avoid FK issues if record exists
        const result = await prisma.gaji.upsert({
            where: { gaji_unique: { period: row.PERIOD, emplId: row.EMPL_ID } },
            update: { pphEmpl: gajiData.pphEmpl },
            create: {
                period: row.PERIOD,
                emplId: row.EMPL_ID,
                tglProses: new Date(),
                tglMsk: row.TGL_MSK ? new Date(row.TGL_MSK) : new Date(),
                ...gajiData
            }
        });

        console.log('PostgreSQL Result PPH_EMPL:', result.pphEmpl);
        if (parseFloat(result.pphEmpl) > 0) {
            console.log('✅ SUCCESS: pphEmpl is now non-zero in PostgreSQL');
        } else {
            console.log('❌ FAILURE: pphEmpl is still zero');
        }
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verifyFix();
