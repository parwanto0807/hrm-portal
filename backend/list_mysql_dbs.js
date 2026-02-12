import mysql from 'mysql2/promise';

async function listDbs() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', 
            // no database selected
        });

        const [rows] = await connection.execute('SHOW DATABASES');
        console.log('Available Databases:');
        rows.forEach(row => console.log(`- ${row.Database}`));

        await connection.end();
    } catch (error) {
        console.error('❌ Failed to list databases:', error.message);
    }
}

listDbs();
