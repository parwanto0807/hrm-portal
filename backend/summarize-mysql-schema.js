import { getMysqlPool } from './src/config/mysqlClient.js';

async function summarizeSchema() {
    const pool = await getMysqlPool();
    if (!pool) process.exit(1);
    const tables = ['gaji', 'potongan', 'tunjangan', 'rapel', 'pphthn'];
    const summary = {};
    try {
        for (const table of tables) {
            const [rows] = await pool.query(`DESCRIBE ${table}`);
            summary[table] = rows.map(r => r.Field);
        }
        console.log('MYSQL_SCHEMA_SUMMARY:' + JSON.stringify(summary));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

summarizeSchema();
