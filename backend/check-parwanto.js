
import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkParwanto() {
    console.log('--- Checking for PARWANTO ---');
    
    // 1. Check MySQL
    console.log('\n[MySQL]');
    let mysqlPool;
    try {
        mysqlPool = await mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            port: parseInt(process.env.MYSQL_PORT || 3306),
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'grafindo_hrm'
        });

        const [karyawan] = await mysqlPool.query('SELECT EMPL_ID, NIK, NAMA, KD_ST_KARY FROM karyawan WHERE NAMA LIKE ?', ['%PARWANTO%']);
        console.log('Karyawan found:', karyawan);

        if (karyawan.length > 0) {
            for (const k of karyawan) {
                // Table names and columns are case-sensitive or insensitive depending on OS, but I saw GBERSIH (with one S) and GBERSSIH in my thoughts, let me check the list from before.
                // From step 587: "gaji" has "GBERSIH" (capitalized, one S)
                const [gaji] = await mysqlPool.query('SELECT PERIOD, EMPL_ID, TGL_PROSES, GBERSIH FROM gaji WHERE EMPL_ID = ? ORDER BY PERIOD DESC LIMIT 5', [k.EMPL_ID]);
                console.log(`Gaji for ${k.NAMA} (${k.EMPL_ID}):`, gaji);
            }
        }
    } catch (err) {
        console.error('MySQL Error:', err.message);
    } finally {
        if (mysqlPool) await mysqlPool.end();
    }

    // 2. Check Postgres
    console.log('\n[Postgres]');
    const prisma = new PrismaClient();
    try {
        const karyawan = await prisma.karyawan.findMany({
            where: { nama: { contains: 'PARWANTO', mode: 'insensitive' } }
        });
        console.log('Karyawan found in Postgres:', karyawan.map(k => ({ id: k.id, emplId: k.emplId, nik: k.nik, nama: k.nama })));

        if (karyawan.length > 0) {
            for (const k of karyawan) {
                const gaji = await prisma.gaji.findMany({
                    where: { emplId: k.emplId },
                    orderBy: { period: 'desc' },
                    take: 5
                });
                console.log(`Gaji for ${k.nama} (${k.emplId}) in Postgres:`, gaji.map(g => ({ period: g.period, gBersih: g.gBersih, tglProses: g.tglProses })));
            }
        } else {
            console.log('No employee found in Postgres with name PARWANTO');
        }
    } catch (err) {
        console.error('Postgres Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkParwanto();
