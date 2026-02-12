import { getMysqlPool } from './src/config/mysqlClient.js';

async function run() {
    try {
        const pool = await getMysqlPool();
        const [rows] = await pool.query('SELECT * FROM gaji WHERE EMPL_ID = ? AND PERIOD = ?', ['000000014', '202601']);
        console.log('MYSQL_ROW:');
        console.log(JSON.stringify(rows[0], null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
