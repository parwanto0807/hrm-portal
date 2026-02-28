
import { getMysqlPool } from './src/config/mysqlClient.js';

async function checkSchema() {
    const pool = await getMysqlPool();
    if (!pool) {
        console.error('❌ Could not get MySQL Pool');
        process.exit(1);
    }
    
    try {
        const tables = ['potongan', 'tunjangan', 'rapel', 'pinjamdet', 'gaji', 'periode'];
        for (const table of tables) {
            try {
                const [cols] = await pool.query(`SHOW COLUMNS FROM ${table}`);
                console.log(`--- ${table} ---`);
                console.log(cols.map(c => c.Field).join(', '));
            } catch (err) {
                console.error(`❌ Error checking table ${table}:`, err.message);
            }
        }
    } catch (err) {
        console.error('❌ Global error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

checkSchema();
