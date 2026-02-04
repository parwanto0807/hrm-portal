import { getMysqlPool } from './src/config/mysqlClient.js';

async function inspectKaryawan() {
    const pool = await getMysqlPool();
    if (!pool) {
        console.error('Failed to connect to MySQL');
        process.exit(1);
    }
    
    try {
        console.log('=== KARYAWAN TABLE STRUCTURE ===\n');
        
        // Get column structure
        const [columns] = await pool.query(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                COLUMN_TYPE,
                IS_NULLABLE,
                COLUMN_DEFAULT,
                COLUMN_KEY
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'karyawan' 
            AND TABLE_SCHEMA = DATABASE()
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log(`Total Columns: ${columns.length}\n`);
        
        // Filter payroll-related columns
        const payrollColumns = columns.filter(col => 
            col.COLUMN_NAME.includes('POKOK') ||
            col.COLUMN_NAME.includes('TRANSPORT') ||
            col.COLUMN_NAME.includes('MAKAN') ||
            col.COLUMN_NAME.includes('JABATAN') ||
            col.COLUMN_NAME.includes('KELUARGA') ||
            col.COLUMN_NAME.includes('BERAS') ||
            col.COLUMN_NAME.includes('KESEHATAN') ||
            col.COLUMN_NAME.includes('LEMBUR') ||
            col.COLUMN_NAME.includes('TUNJANGAN') ||
            col.COLUMN_NAME.includes('GAJI')
        );
        
        console.log('=== PAYROLL-RELATED COLUMNS ===');
        payrollColumns.forEach(col => {
            console.log(`${col.COLUMN_NAME.padEnd(20)} | ${col.COLUMN_TYPE.padEnd(15)} | Default: ${col.COLUMN_DEFAULT || 'NULL'}`);
        });
        
        // Get sample data
        console.log('\n=== SAMPLE DATA (First 2 Records) ===');
        const [sample] = await pool.query('SELECT EMPL_ID, NAMA, POKOK_BLN, TTRANSPORT, TMAKAN, TJABATAN, TKELUARGA FROM karyawan LIMIT 2');
        console.log(JSON.stringify(sample, null, 2));
        
        // Save full structure to file
        const fs = await import('fs/promises');
        await fs.writeFile(
            'C:\\Users\\parwa\\.gemini\\antigravity\\brain\\eb54c282-2f23-45fd-b24e-f233e691eece\\mysql_karyawan_columns.json',
            JSON.stringify({ columns, payrollColumns, sample }, null, 2)
        );
        
        console.log('\n✅ Full structure saved to mysql_karyawan_columns.json');
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

inspectKaryawan();
