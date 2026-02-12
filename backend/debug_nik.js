import { getMysqlPool } from './src/config/mysqlClient.js';
import { prisma } from './src/config/prisma.js';
import dotenv from 'dotenv';
dotenv.config();

async function debugNik() {
    const pool = await getMysqlPool();
    try {
        const [mysqlLogs] = await pool.query("SELECT nik, id_absen FROM att_log WHERE tanggal >= '2026-01-01' LIMIT 5");
        console.log('Sample MySQL Logs:', mysqlLogs);

        for (const log of mysqlLogs) {
            const cleanNik = log.nik.trim();
            const karyawan = await prisma.karyawan.findUnique({ where: { nik: cleanNik } });
            console.log(`Matching Nik [${cleanNik}]:`, karyawan ? 'FOUND' : 'NOT FOUND');
            
            if (!karyawan) {
                // Peek at some karyawan NIKs to see what's in there
                const someKaryawan = await prisma.karyawan.findMany({ take: 3, select: { nik: true } });
                console.log('Sample Postgres Karyawan NIKs:', someKaryawan);
                break;
            }
        }
    } catch (err) {
        console.error('Debug Error:', err);
    } finally {
        await pool.end();
        await prisma.$disconnect();
    }
}

debugNik();
