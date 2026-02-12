import { getMysqlPool } from './src/config/mysqlClient.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simulateImport() {
    const pool = await getMysqlPool();
    if (!pool) process.exit(1);
    try {
        // Find a record with non-zero PPH_EMPL
        const [rows] = await pool.query('SELECT * FROM gaji WHERE PPH_EMPL != 0 LIMIT 1');
        if (rows.length === 0) {
            console.log('No non-zero PPH_EMPL records found in MySQL');
            process.exit(0);
        }
        const row = rows[0];
        console.log(`Simulating import for ${row.EMPL_ID} in ${row.PERIOD}`);
        console.log(`Original PPH_EMPL in MySQL: ${row.PPH_EMPL}`);

        // Mirror the logic in mysql.routes.js
        const gajiData = {
             // Tax fields
             tPph21: row.TPPH21 || 0,
             pphThr: row.PPH_THR || 0,
             pphEmpl: row.PPH_EMPL || 0,
             ptkpAmount: row.PTKP || 0,
        };
        
        console.log('gajiData for taxes:', JSON.stringify(gajiData));

        const result = await prisma.gaji.upsert({
            where: { gaji_unique: { period: row.PERIOD, emplId: row.EMPL_ID } },
            update: gajiData,
            create: {
                period: row.PERIOD,
                emplId: row.EMPL_ID,
                tglProses: new Date(),
                tglMsk: new Date(),
                ...gajiData
            }
        });

        console.log(`Result pphEmpl in Postgres: ${result.pphEmpl}`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

simulateImport();
