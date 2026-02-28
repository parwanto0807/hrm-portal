
import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function deepAudit() {
    try {
        console.log('--- Deep Data Audit ---');
        
        // 1. Check for Parwanto 202509 in MySQL
        const pool = await mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'grafindo_hrm'
        });

        const [myGaji] = await pool.query('SELECT * FROM gaji WHERE EMPL_ID = ? AND PERIOD = ?', ['000000699', '202509']);
        console.log('\n[MySQL] Parwanto 202509 Record Count:', myGaji.length);
        if (myGaji.length > 0) {
            console.log('Sample MySQL Gaji:', { period: myGaji[0].PERIOD, gBersih: myGaji[0].GBERSIH });
        }

        // 2. Check for Parwanto 202509 in Postgres
        const pgGaji = await prisma.gaji.findMany({
            where: { emplId: '000000699', period: '202509' }
        });
        console.log('\n[Postgres] Parwanto 202509 Record Count:', pgGaji.length);
        if (pgGaji.length > 0) {
            console.log('Sample Postgres Gaji:', { period: pgGaji[0].period, gBersih: pgGaji[0].gBersih });
        }

        // 3. Inspect mysql.routes.js line 318
        const routesPath = path.join(__dirname, 'src', 'routes', 'mysql.routes.js');
        if (fs.existsSync(routesPath)) {
            const content = fs.readFileSync(routesPath, 'utf8');
            const lines = content.split('\n');
            const targetLine = lines[317]; // 0-indexed for line 318
            console.log('\n--- Line 318 Analysis ---');
            console.log('Content:', targetLine);
            console.log('Length:', targetLine.length);
            const bytes = Buffer.from(targetLine);
            console.log('Bytes:', bytes.toString('hex'));
        }

        await pool.end();
    } catch (err) {
        console.error('Audit Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

deepAudit();
