const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');
const prisma = new PrismaClient();

async function main() {
  try {
    const dbConfig = await prisma.mysqlConfig.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
    });

    const pool = mysql.createPool({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        dateStrings: true // Get dates as strings to avoid driver parsing
    });

    const [rows] = await pool.query(
        "SELECT TGL_ABSEN, KD_ABSEN, REALMASUK FROM absent WHERE NAMA LIKE '%ARISTUR WIYONO%' AND TGL_ABSEN BETWEEN '2025-11-01' AND '2025-11-10' ORDER BY TGL_ABSEN ASC"
    );

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    console.log('--- MySQL Raw Data (dateStrings: true) ---');
    rows.forEach(row => {
        const d = new Date(row.TGL_ABSEN);
        console.log(`Raw String: ${row.TGL_ABSEN} | Parsed Date Object: ${d.toISOString()} | Day: ${dayNames[d.getDay()]}`);
    });

    await pool.end();
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
