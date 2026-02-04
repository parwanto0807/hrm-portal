import { getMysqlPool } from './src/config/mysqlClient.js';

async function listTables() {
    const pool = await getMysqlPool();
    if (!pool) {
        console.error('No MySQL pool available');
        process.exit(1);
    }
    try {
        const [rows] = await pool.query('SHOW TABLES');
        const tables = rows.map(row => Object.values(row)[0]);
        console.log('MYSQL_TABLES:' + JSON.stringify(tables));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listTables();
