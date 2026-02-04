// Quick script to import companies from MySQL to PostgreSQL
import { getMysqlPool } from './src/config/mysqlClient.js';
import { prisma } from './src/config/prisma.js';

async function importCompanies() {
    const pool = await getMysqlPool();
    if (!pool) {
        console.error('❌ MySQL not configured');
        return;
    }

    try {
        console.log('🏁 Starting Company Import...');
        
        const [mysqlCompanies] = await pool.query('SELECT * FROM company');
        console.log(`📊 Found ${mysqlCompanies.length} companies in MySQL`);

        let imported = 0;
        let errors = 0;

        for (const row of mysqlCompanies) {
            try {
                await prisma.company.upsert({
                    where: { kodeCmpy: row.KODE_CMPY },
                    update: {
                        company: row.COMPANY || null,
                        address1: row.ADDRESS1 || null,
                        tlp: row.TLP || null,
                        email: row.EMAIL || null
                    },
                    create: {
                        kodeCmpy: row.KODE_CMPY,
                        company: row.COMPANY || null,
                        address1: row.ADDRESS1 || null,
                        address2: row.ADDRESS2 || null,
                        address3: row.ADDRESS3 || null,
                        tlp: row.TLP || null,
                        fax: row.FAX || null,
                        npwp: row.NPWP || null,
                        director: row.DIRECTOR || null,
                        npwpDir: row.NPWPDIR || null,
                        logo: row.LOGO || null,
                        npp: row.NPP || null,
                        astekBayar: row.ASTEKBAYAR || null,
                        email: row.EMAIL || null,
                        homepage: row.HOMEPAGE || null,
                        hrdMng: row.HRDMNG || null,
                        npwpMng: row.NPWPMNG || null
                    }
                });
                imported++;
                console.log(`✅ Imported: ${row.KODE_CMPY} - ${row.COMPANY}`);
            } catch (err) {
                errors++;
                console.error(`❌ Error importing ${row.KODE_CMPY}:`, err.message);
            }
        }

        console.log(`\n✅ Company Import Complete!`);
        console.log(`   Imported: ${imported}`);
        console.log(`   Errors: ${errors}`);

        // Verify
        const count = await prisma.company.count();
        console.log(`\n📊 Total companies in PostgreSQL: ${count}`);

    } catch (error) {
        console.error('❌ Import failed:', error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

importCompanies();
