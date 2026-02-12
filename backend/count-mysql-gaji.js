import { getMysqlPool } from './src/config/mysqlClient.js';

async function countGaji() {
    const pool = await getMysqlPool();
    if (!pool) process.exit(1);
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as c FROM gaji');
        console.log('MYSQL_GAJI_COUNT:' + rows[0].c);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

countGaji();
