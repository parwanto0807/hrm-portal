
import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function finalCheck() {
    try {
        console.log('--- Final Check for PARWANTO ---');
        
        // 1. Get MySQL Config from Database
        const dbConfig = await prisma.mysqlConfig.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' }
        });

        const config = dbConfig ? {
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database
        } : {
            host: process.env.MYSQL_HOST || 'localhost',
            port: parseInt(process.env.MYSQL_PORT || 3306),
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'grafindo_hrm'
        };

        console.log('Using MySQL Config:', { ...config, password: '****' });

        const pool = await mysql.createPool(config);

        // 2. Check PARWANTO in MySQL
        const [myKaryawan] = await pool.query('SELECT EMPL_ID, NAMA FROM karyawan WHERE NAMA LIKE ?', ['%PARWANTO%']);
        if (myKaryawan.length > 0) {
            const p = myKaryawan[0];
            console.log(`\n[MySQL] PARWANTO: ${p.NAMA} (${p.EMPL_ID})`);
            const [myGaji] = await pool.query('SELECT PERIOD, GBERSIH, TGL_PROSES FROM gaji WHERE EMPL_ID = ? ORDER BY PERIOD DESC', [p.EMPL_ID]);
            console.log('MySQL Gaji records:', myGaji);
            
            if (myGaji.length === 0) {
                console.log('❌ No payroll records found in MySQL for PARWANTO');
            }
        } else {
            console.log('\n❌ PARWANTO not found in MySQL');
        }

        // 3. Check PARWANTO in Postgres
        const pgKaryawan = await prisma.karyawan.findFirst({
            where: { nama: { contains: 'PARWANTO', mode: 'insensitive' } }
        });
        if (pgKaryawan) {
            console.log(`\n[Postgres] PARWANTO: ${pgKaryawan.nama} (${pgKaryawan.emplId})`);
            const pgGaji = await prisma.gaji.findMany({
                where: { emplId: pgKaryawan.emplId },
                orderBy: { period: 'desc' }
            });
            console.log('Postgres Gaji records:', pgGaji.map(g => ({ period: g.period, gBersih: g.gBersih })));
        } else {
            console.log('\n❌ PARWANTO not found in Postgres');
        }

        await pool.end();
    } catch (err) {
        console.error('Final Check Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

finalCheck();
