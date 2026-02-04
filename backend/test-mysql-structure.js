// Quick test to check MySQL gaji table structure
import { getMysqlPool } from './src/config/mysqlClient.js';

const testMysqlStructure = async () => {
    const pool = await getMysqlPool();
    if (!pool) {
        console.log('❌ MySQL not configured');
        return;
    }

    try {
        // Get column names from gaji table
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'gaji' 
            AND TABLE_SCHEMA = DATABASE()
            ORDER BY ORDINAL_POSITION
        `);

        console.log('📋 MySQL GAJI Table Columns:');
        console.log('================================');
        columns.forEach((col, idx) => {
            console.log(`${idx + 1}. ${col.COLUMN_NAME}`);
        });

        // Get sample row to see actual data
        const [sampleRows] = await pool.query('SELECT * FROM gaji LIMIT 1');
        if (sampleRows.length > 0) {
            console.log('\n📊 Sample Row Keys:');
            console.log('================================');
            Object.keys(sampleRows[0]).forEach((key, idx) => {
                const value = sampleRows[0][key];
                const type = typeof value;
                const preview = value !== null && value !== undefined ? 
                    (type === 'string' ? value.substring(0, 20) : value) : 'NULL';
                console.log(`${idx + 1}. ${key} = ${preview} (${type})`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

testMysqlStructure();
