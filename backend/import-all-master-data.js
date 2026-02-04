// Comprehensive script to import ALL master data from MySQL to PostgreSQL
import { getMysqlPool } from './src/config/mysqlClient.js';
import { prisma } from './src/config/prisma.js';

const stats = {
    companies: { total: 0, imported: 0, errors: 0 },
    banks: { total: 0, imported: 0, errors: 0 },
    factories: { total: 0, imported: 0, errors: 0 },
    divisions: { total: 0, imported: 0, errors: 0 },
    departments: { total: 0, imported: 0, errors: 0 },
    sections: { total: 0, imported: 0, errors: 0 },
    positions: { total: 0, imported: 0, errors: 0 },
    levels: { total: 0, imported: 0, errors: 0 },
    religions: { total: 0, imported: 0, errors: 0 },
    education: { total: 0, imported: 0, errors: 0 },
    shiftGroups: { total: 0, imported: 0, errors: 0 }
};

async function importAllMasterData() {
    const pool = await getMysqlPool();
    if (!pool) {
        console.error('❌ MySQL not configured');
        return;
    }

    try {
        console.log('🚀 Starting Master Data Import...\n');

        // 1. Import Religions (mstagm)
        console.log('📚 Importing Religions...');
        const [mysqlAgm] = await pool.query('SELECT * FROM mstagm');
        stats.religions.total = mysqlAgm.length;
        for (const row of mysqlAgm) {
            try {
                await prisma.mstAgm.upsert({
                    where: { kdAgm: row.CKD_AGM },
                    update: { nmAgm: row.CNM_AGM, keterangan: row.KETERANGAN },
                    create: { kdAgm: row.CKD_AGM, nmAgm: row.CNM_AGM, keterangan: row.KETERANGAN }
                });
                stats.religions.imported++;
            } catch (err) { stats.religions.errors++; }
        }
        console.log(`✅ Religions: ${stats.religions.imported}/${stats.religions.total}\n`);

        // 2. Import Education (mstskl)
        console.log('🎓 Importing Education Levels...');
        const [mysqlSkl] = await pool.query('SELECT * FROM mstskl');
        stats.education.total = mysqlSkl.length;
        for (const row of mysqlSkl) {
            try {
                await prisma.mstSkl.upsert({
                    where: { kdSkl: row.CKD_SKL },
                    update: { nmSkl: row.CNM_SKL, keterangan: row.KETERANGAN },
                    create: { kdSkl: row.CKD_SKL, nmSkl: row.CNM_SKL, keterangan: row.KETERANGAN }
                });
                stats.education.imported++;
            } catch (err) { stats.education.errors++; }
        }
        console.log(`✅ Education: ${stats.education.imported}/${stats.education.total}\n`);

        // 3. Import Banks
        console.log('🏦 Importing Banks...');
        const [mysqlBanks] = await pool.query('SELECT * FROM bank');
        stats.banks.total = mysqlBanks.length;
        for (const row of mysqlBanks) {
            try {
                await prisma.bank.upsert({
                    where: { bankCode: row.BANK_CODE },
                    update: { bankNama: row.BANK_NAMA },
                    create: { bankCode: row.BANK_CODE, bankNama: row.BANK_NAMA }
                });
                stats.banks.imported++;
            } catch (err) { stats.banks.errors++; }
        }
        console.log(`✅ Banks: ${stats.banks.imported}/${stats.banks.total}\n`);

        // 4. Import Factories
        console.log('🏭 Importing Factories...');
        const [mysqlFact] = await pool.query('SELECT * FROM mstfact');
        stats.factories.total = mysqlFact.length;
        for (const row of mysqlFact) {
            try {
                await prisma.mstFact.upsert({
                    where: { kdFact: row.CKD_FACT },
                    update: { nmFact: row.CNM_FACT, keterangan: row.KETERANGAN },
                    create: { kdFact: row.CKD_FACT, nmFact: row.CNM_FACT, keterangan: row.KETERANGAN }
                });
                stats.factories.imported++;
            } catch (err) { stats.factories.errors++; }
        }
        console.log(`✅ Factories: ${stats.factories.imported}/${stats.factories.total}\n`);

        // 5. Import Divisions (mstbag)
        console.log('🏢 Importing Divisions...');
        const [mysqlBag] = await pool.query('SELECT * FROM mstbag');
        stats.divisions.total = mysqlBag.length;
        for (const row of mysqlBag) {
            try {
                await prisma.mstBag.upsert({
                    where: { kdBag: row.CKD_BAG },
                    update: { nmBag: row.CNM_BAG, keterangan: row.KETERANGAN },
                    create: { kdBag: row.CKD_BAG, nmBag: row.CNM_BAG, keterangan: row.KETERANGAN }
                });
                stats.divisions.imported++;
            } catch (err) { stats.divisions.errors++; }
        }
        console.log(`✅ Divisions: ${stats.divisions.imported}/${stats.divisions.total}\n`);

        // 6. Import Departments (mstdept)
        console.log('📂 Importing Departments...');
        const [mysqlDept] = await pool.query('SELECT * FROM mstdept');
        stats.departments.total = mysqlDept.length;
        for (const row of mysqlDept) {
            try {
                await prisma.mstDept.upsert({
                    where: { kdDept: row.CKD_DEPT },
                    update: { nmDept: row.CNM_DEPT, kdBag: row.CKD_BAG, keterangan: row.KETERANGAN },
                    create: { kdDept: row.CKD_DEPT, nmDept: row.CNM_DEPT, kdBag: row.CKD_BAG, keterangan: row.KETERANGAN }
                });
                stats.departments.imported++;
            } catch (err) { stats.departments.errors++; }
        }
        console.log(`✅ Departments: ${stats.departments.imported}/${stats.departments.total}\n`);

        // 7. Import Sections (mstsie)
        console.log('📑 Importing Sections...');
        const [mysqlSie] = await pool.query('SELECT * FROM mstsie');
        stats.sections.total = mysqlSie.length;
        for (const row of mysqlSie) {
            try {
                await prisma.mstSie.upsert({
                    where: { kdSeksie: row.CKD_SIE },
                    update: { nmSeksie: row.CNM_SIE, kdBag: row.CKD_BAG, kdDept: row.CKD_DEPT, keterangan: row.KETERANGAN },
                    create: { kdSeksie: row.CKD_SIE, nmSeksie: row.CNM_SIE, kdBag: row.CKD_BAG, kdDept: row.CKD_DEPT, keterangan: row.KETERANGAN }
                });
                stats.sections.imported++;
            } catch (err) { stats.sections.errors++; }
        }
        console.log(`✅ Sections: ${stats.sections.imported}/${stats.sections.total}\n`);

        // 8. Import Positions (mstjab)
        console.log('💼 Importing Positions...');
        const [mysqlJab] = await pool.query('SELECT * FROM mstjab');
        stats.positions.total = mysqlJab.length;
        for (const row of mysqlJab) {
            try {
                await prisma.mstJab.upsert({
                    where: { kdJab: row.CKD_JAB },
                    update: { 
                        nmJab: row.CNM_JAB,
                        nTjabatan: row.NTJABATAN,
                        nTransport: row.NTRANSPORT,
                        keterangan: row.KETERANGAN
                    },
                    create: {
                        kdJab: row.CKD_JAB,
                        nmJab: row.CNM_JAB,
                        nTjabatan: row.NTJABATAN,
                        nTransport: row.NTRANSPORT,
                        nShiftAll: row.NSHIFT_ALL,
                        nPremiHdr: row.NPREMI_HDR,
                        persenRmh: row.PERSEN_RMH,
                        persenPph: row.PERSEN_PPH,
                        keterangan: row.KETERANGAN
                    }
                });
                stats.positions.imported++;
            } catch (err) { stats.positions.errors++; }
        }
        console.log(`✅ Positions: ${stats.positions.imported}/${stats.positions.total}\n`);

        // 9. Import Levels (mstpkt)
        console.log('📊 Importing Employee Levels...');
        const [mysqlPkt] = await pool.query('SELECT * FROM mstpkt');
        stats.levels.total = mysqlPkt.length;
        for (const row of mysqlPkt) {
            try {
                await prisma.mstPkt.upsert({
                    where: { kdPkt: row.CKD_PKT },
                    update: { nmPkt: row.CNM_PKT, keterangan: row.KETERANGAN },
                    create: { kdPkt: row.CKD_PKT, nmPkt: row.CNM_PKT, keterangan: row.KETERANGAN }
                });
                stats.levels.imported++;
            } catch (err) { stats.levels.errors++; }
        }
        console.log(`✅ Levels: ${stats.levels.imported}/${stats.levels.total}\n`);

        // 10. Import Shift Groups
        console.log('🔄 Importing Shift Groups...');
        const [mysqlShifts] = await pool.query('SELECT * FROM groupshift');
        stats.shiftGroups.total = mysqlShifts.length;
        for (const row of mysqlShifts) {
            try {
                await prisma.groupShift.upsert({
                    where: { groupShift: row.GROUP_SHIFT },
                    update: { 
                        groupName: row.GROUP_NAME || '',
                        isActive: row.is_active !== undefined ? row.is_active : true
                    },
                    create: { 
                        groupShift: row.GROUP_SHIFT,
                        groupName: row.GROUP_NAME || '',
                        isActive: row.is_active !== undefined ? row.is_active : true
                    }
                });
                stats.shiftGroups.imported++;
            } catch (err) { stats.shiftGroups.errors++; }
        }
        console.log(`✅ Shift Groups: ${stats.shiftGroups.imported}/${stats.shiftGroups.total}\n`);

        // Summary
        console.log('═══════════════════════════════════════');
        console.log('✅ MASTER DATA IMPORT COMPLETE!');
        console.log('═══════════════════════════════════════');
        console.log(`📊 Companies:     ${stats.companies.imported}/${stats.companies.total}`);
        console.log(`🏦 Banks:         ${stats.banks.imported}/${stats.banks.total}`);
        console.log(`🏭 Factories:     ${stats.factories.imported}/${stats.factories.total}`);
        console.log(`🏢 Divisions:     ${stats.divisions.imported}/${stats.divisions.total}`);
        console.log(`📂 Departments:   ${stats.departments.imported}/${stats.departments.total}`);
        console.log(`📑 Sections:      ${stats.sections.imported}/${stats.sections.total}`);
        console.log(`💼 Positions:     ${stats.positions.imported}/${stats.positions.total}`);
        console.log(`📊 Levels:        ${stats.levels.imported}/${stats.levels.total}`);
        console.log(`📚 Religions:     ${stats.religions.imported}/${stats.religions.total}`);
        console.log(`🎓 Education:     ${stats.education.imported}/${stats.education.total}`);
        console.log(`🔄 Shift Groups:  ${stats.shiftGroups.imported}/${stats.shiftGroups.total}`);
        console.log('═══════════════════════════════════════');
        console.log('\n✨ You can now import employees!');

    } catch (error) {
        console.error('❌ Import failed:', error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

importAllMasterData();
