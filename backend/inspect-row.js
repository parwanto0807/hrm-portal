import { getMysqlPool } from './src/config/mysqlClient.js';

async function inspectRow() {
    const pool = await getMysqlPool();
    if (!pool) process.exit(1);
    try {
        const [rows] = await pool.query('SELECT * FROM gaji WHERE PPH_EMPL != 0 LIMIT 1');
        if (rows.length > 0) {
            console.log('KEYS:' + JSON.stringify(Object.keys(rows[0])));
            console.log('SAMPLE_ROW:' + JSON.stringify(rows[0]));
        } else {
            console.log('NO_DATA');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

inspectRow();
