import { getMysqlPool } from './src/config/mysqlClient.js';

async function listColumns() {
    const pool = await getMysqlPool();
    if (!pool) process.exit(1);
    try {
        const [rows] = await pool.query('DESCRIBE gaji');
        rows.forEach(row => {
            console.log(`COLUMN: ${row.Field}`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listColumns();
