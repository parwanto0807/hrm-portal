import { getMysqlPool } from './src/config/mysqlClient.js';

async function countData() {
    const pool = await getMysqlPool();
    if (!pool) process.exit(1);
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM gaji WHERE PPH_EMPL != 0');
        console.log('MYSQL_NON_ZERO_PPH_EMPL_COUNT:' + JSON.stringify(rows));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

countData();
