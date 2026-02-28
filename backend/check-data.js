
import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function checkData() {
    try {
        console.log('--- Database Audit ---');
        
        // 1. Postgres Latest Periods
        const pgPeriods = await prisma.gaji.findMany({
            select: { period: true },
            distinct: ['period'],
            orderBy: { period: 'desc' },
            take: 10
        });
        console.log('\n[Postgres] Latest Gaji Periods:', pgPeriods.map(p => p.period));

        // 2. Parwanto in Postgres
        const parwantoPg = await prisma.karyawan.findFirst({
            where: { nama: { contains: 'PARWANTO', mode: 'insensitive' } }
        });
        if (parwantoPg) {
            console.log(`\n[Postgres] PARWANTO found: ${parwantoPg.nama} (${parwantoPg.emplId})`);
            const gajiParwanto = await prisma.gaji.findMany({
                where: { emplId: parwantoPg.emplId },
                orderBy: { period: 'desc' },
                take: 5
            });
            console.log('Postgres Gaji:', gajiParwanto.map(g => ({ period: g.period, gBersih: g.gBersih })));
        } else {
            console.log('\n[Postgres] PARWANTO NOT found');
        }

        // 3. MySQL Audit
        console.log('\n[MySQL] Using config:', {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            database: process.env.MYSQL_DATABASE
        });
        const pool = await mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'grafindo_hrm'
        });

        const [myPeriods] = await pool.query('SELECT DISTINCT PERIOD FROM gaji ORDER BY PERIOD DESC LIMIT 10');
        console.log('\n[MySQL] Latest Gaji Periods:', myPeriods.map(p => p.PERIOD));

        const [parwantoMy] = await pool.query('SELECT EMPL_ID, NAMA FROM karyawan WHERE NAMA LIKE ?', ['%PARWANTO%']);
        if (parwantoMy.length > 0) {
            const p = parwantoMy[0];
            console.log(`\n[MySQL] PARWANTO found: ${p.NAMA} (${p.EMPL_ID})`);
            const [gajiMy] = await pool.query('SELECT PERIOD, GBERSIH FROM gaji WHERE EMPL_ID = ? ORDER BY PERIOD DESC LIMIT 5', [p.EMPL_ID]);
            console.log('MySQL Gaji:', gajiMy);
        }

        await pool.end();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
