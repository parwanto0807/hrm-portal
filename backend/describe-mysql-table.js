import { getMysqlPool } from './src/config/mysqlClient.js';

async function describeTable() {
    const pool = await getMysqlPool();
    if (!pool) process.exit(1);
    try {
        const [rows] = await pool.query('DESCRIBE gaji');
        console.log('MYSQL_GAJI_DESC:' + JSON.stringify(rows));
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

describeTable();
