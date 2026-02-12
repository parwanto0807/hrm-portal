import express from 'express';
import { getMysqlPool, testMysqlConnection } from '../config/mysqlClient.js';
import { prisma } from '../config/prisma.js';
import { calculateLate, calculateEarly, sanitizeAttendanceStatus } from '../utils/attendanceUtils.js';

const router = express.Router();

// Helper to parse MySQL dates safely in local timezone
const parseDate = (mysqlDate) => {
    if (!mysqlDate || mysqlDate === '0000-00-00' || mysqlDate === '0000-00-00 00:00:00') {
        return null;
    }
    try {
        if (typeof mysqlDate === 'string') {
            // Handle both YYYY-MM-DD and YYYY-MM-DD HH:mm:ss
            const [datePart, timePart] = mysqlDate.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            
            if (timePart) {
                const [hour, minute, second] = timePart.split(':').map(Number);
                return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
            }
            return new Date(Date.UTC(year, month - 1, day));
        }
        const d = new Date(mysqlDate);
        return isNaN(d.getTime()) ? null : d;
    } catch {
        return null;
    }
};

// --- INTERNAL HELPERS ---
const syncAttLogsInternal = async (pool, startDate, activeEmplIds = null) => {
    const stats = { total: 0, imported: 0, errors: 0 };
    const [mysqlLogs] = await pool.query(
        'SELECT * FROM att_log WHERE tanggal >= ?',
        [startDate]
    );
    stats.total = mysqlLogs.length;

    for (const row of mysqlLogs) {
        try {
            const cleanNik = row.nik.trim();
            const karyawan = await prisma.karyawan.findUnique({ where: { nik: cleanNik } });
            if (!karyawan) continue;

            // TRACK ACTIVITY FOR AUTO-ACTIVATION
            if (activeEmplIds) {
                activeEmplIds.add(karyawan.emplId);
            }

            await prisma.attLog.upsert({
                where: {
                    att_log_unique: {
                        nik: cleanNik,
                        tanggal: parseDate(row.tanggal),
                        jam: row.jam || '',
                        cflag: row.cflag || ''
                    }
                },
                update: { 
                    idAbsen: row.id_absen || '',
                    emplId: row.id_absen || '' // User requested emplId be filled from id_absen
                },
                create: {
                    nik: cleanNik,
                    idAbsen: row.id_absen || '',
                    emplId: row.id_absen || '', // User requested emplId be filled from id_absen
                    tanggal: parseDate(row.tanggal),
                    jam: row.jam || '',
                    cflag: row.cflag || ''
                }
            });
            stats.imported++;
        } catch (err) {
            console.error(`❌ Sync error for NIK ${row.nik}:`, err.message);
            stats.errors++;
        }
    }
    return stats;
};

const findRealInOutFromLogs = async (pool, nik, dateStr) => {
    try {
        // Query logs directly for this specific person and date
        const [logs] = await pool.query(
            'SELECT jam FROM att_log WHERE nik = ? AND tanggal = ? ORDER BY jam ASC', 
            [nik, dateStr]
        );
        
        if (logs.length === 0) return { realMasuk: null, realKeluar: null };

        const firstTap = logs[0].jam; 
        const lastTap = logs.length > 1 ? logs[logs.length - 1].jam : null;

        // Convert HH.mm to HH:mm for standard format if needed, 
        // but our DB seems to store CHAR(5) like "0800" or "08:00".
        // Based on previous logs, it's "HH.mm". We should standardize to HH:mm for PostgreSQL Time string.
        const fmt = (t) => t ? t.replace('.', ':') : null;

        return { 
            realMasuk: fmt(firstTap), 
            realKeluar: fmt(lastTap) 
        };
    } catch (e) {
        return { realMasuk: null, realKeluar: null };
    }
};

// Get Current Config
router.get('/config', async (req, res) => {
    try {
        let config = await prisma.mysqlConfig.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' }
        });
        
        if (!config) {
            // Return empty object if no config found
            return res.status(200).json({ success: true, config: null });
        }
        
        res.status(200).json({ success: true, config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Save/Update Config
router.post('/config', async (req, res) => {
    const { host, port, user, password, database } = req.body;
    try {
        // Deactivate old configs
        await prisma.mysqlConfig.updateMany({
            where: { isActive: true },
            data: { isActive: false }
        });

        const newConfig = await prisma.mysqlConfig.create({
            data: {
                host,
                port: parseInt(port),
                user,
                password,
                database,
                isActive: true
            }
        });

        // Force refresh pool
        await getMysqlPool(true);

        res.status(200).json({ success: true, config: newConfig });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Test Connection
router.get('/test', async (req, res) => {
    const result = await testMysqlConnection();
    if (result.success) {
        res.status(200).json(result);
    } else {
        res.status(500).json(result);
    }
});

// List Tables
router.get('/tables', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    try {
        const [rows] = await pool.query('SHOW TABLES');
        const tables = rows.map(row => Object.values(row)[0]);
        res.status(200).json({ success: true, tables });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Inspect Table Structure (CRITICAL for schema verification)
router.get('/inspect/:tableName', async (req, res) => {
    const { tableName } = req.params;
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    try {
        // Get column information
        const [columns] = await pool.query(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                COLUMN_TYPE,
                IS_NULLABLE,
                COLUMN_DEFAULT,
                COLUMN_KEY,
                EXTRA
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = ? 
            AND TABLE_SCHEMA = DATABASE()
            ORDER BY ORDINAL_POSITION
        `, [tableName]);

        // Get sample data (first 2 rows)
        const [sampleData] = await pool.query(`SELECT * FROM \`${tableName}\` LIMIT 2`);

        // Get table indexes
        const [indexes] = await pool.query(`SHOW INDEX FROM \`${tableName}\``);

        res.status(200).json({ 
            success: true, 
            tableName,
            columns,
            sampleData,
            indexes,
            totalColumns: columns.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Preview Table Data with Pagination
router.get('/tables/:name', async (req, res) => {
    const { name } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    try {
        // Get total records for pagination
        const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM \`${name}\``);
        const total = countRows[0].total;

        // Get paginated data
        const [rows] = await pool.query(`SELECT * FROM \`${name}\` LIMIT ? OFFSET ?`, [parseInt(limit), offset]);
        
        res.status(200).json({ 
            success: true, 
            data: rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Import Payroll Data (MySQL to Postgres)
router.post('/import/payroll', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    const stats = {
        jnsPotongan: { total: 0, imported: 0, errors: 0 },
        jnsTunjangan: { total: 0, imported: 0, errors: 0 },
        jnsRapel: { total: 0, imported: 0, errors: 0 },
        potongan: { total: 0, imported: 0, errors: 0 },
        pinjamHdr: { total: 0, imported: 0, errors: 0 },
        pinjamDet: { total: 0, imported: 0, errors: 0 },
        gaji: { total: 0, imported: 0, errors: 0 },
        tunjangan: { total: 0, imported: 0, errors: 0 },
        rapel: { total: 0, imported: 0, errors: 0 }
    };

    try {
        console.log('🏁 Starting Payroll Import...');

        // 0. IMPORT PERIODS (Required for Foreign Key)
        console.log('⏳ Importing Periods...');
        const [mysqlPeriods] = await pool.query('SELECT * FROM periode');
        let importedPeriods = 0;
        
        for (const row of mysqlPeriods) {
            try {
                // Ensure dates are valid
                const awal = new Date(row.AWAL);
                const akhir = new Date(row.AKHIR);
                
                await prisma.periode.upsert({
                    where: { periodeId: row.PERIODE_ID },
                    update: {
                        awal: !isNaN(awal.getTime()) ? awal : new Date(),
                        akhir: !isNaN(akhir.getTime()) ? akhir : new Date(),
                        dataDefa: row.DATA_DEFA === 1,
                        tutup: row.TUTUP === 1,
                        tahun: parseInt(row.TAHUN) || 2024,
                        bulan: parseInt(row.BULAN) || 1,
                        nama: row.NAMA,
                        kdCmpy: row.KD_CMPY
                    },
                    create: {
                        periodeId: row.PERIODE_ID,
                        awal: !isNaN(awal.getTime()) ? awal : new Date(),
                        akhir: !isNaN(akhir.getTime()) ? akhir : new Date(),
                        dataDefa: row.DATA_DEFA === 1,
                        tutup: row.TUTUP === 1,
                        tahun: parseInt(row.TAHUN) || 2024,
                        bulan: parseInt(row.BULAN) || 1,
                        nama: row.NAMA,
                        kdCmpy: row.KD_CMPY
                    }
                });
                importedPeriods++;
            } catch (err) {
                console.error(`❌ Failed to import Period ${row.PERIODE_ID}:`, err.message);
            }
        }
        console.log(`✅ Imported ${importedPeriods} periods.`);

        // Pre-fetch all master data for UUID mapping to optimize performance
        console.log('⏳ Pre-fetching master data for UUID mapping...');
        const [companies, facts, bags, depts, sies, jabatan, ptkps, jnsKarys, jnsPots, jnsTunjs, jnsRapels] = await Promise.all([
            prisma.company.findMany(),
            prisma.mstFact.findMany(),
            prisma.mstBag.findMany(),
            prisma.mstDept.findMany(),
            prisma.mstSie.findMany(),
            prisma.mstJab.findMany(),
            prisma.ptkp.findMany(),
            prisma.jnsKary.findMany(),
            prisma.jnsPotongan.findMany(),
            prisma.jnsTunjangan.findMany(),
            prisma.jnsRapel.findMany()
        ]);

        const companyMap = new Map(companies.map(c => [c.kodeCmpy, c.id]));
        const factMap = new Map(facts.map(f => [f.kdFact, f.id]));
        const bagMap = new Map(bags.map(b => [b.kdBag, b.id]));
        const deptMap = new Map(depts.map(d => [d.kdDept, d.id]));
        const sieMap = new Map(sies.map(s => [s.kdSeksie, s.id]));
        const jabatanMap = new Map(jabatan.map(j => [j.kdJab, j.id]));
        const ptkpMap = new Map(ptkps.map(p => [p.kode, p.id]));
        const jnsKaryMap = new Map(jnsKarys.map(jk => [jk.kdJns, jk.id]));
        const jnsPotMap = new Map(jnsPots.map(jp => [jp.transCode, jp.id]));
        const jnsTunjMap = new Map(jnsTunjs.map(jt => [jt.transCode, jt.id]));
        const jnsRapelMap = new Map(jnsRapels.map(jr => [jr.transCode, jr.id]));
        console.log('✅ Master data pre-fetched.');

        // 1. IMPORT MASTER REFERENCE TABLES (Required for Foreign Keys)
        
        // 1a. Import JnsPotongan (Deduction Types)
        console.log('⏳ Importing JnsPotongan (Deduction Types)...');
        const [mysqlJnsPotongan] = await pool.query('SELECT * FROM jnspotongan');
        stats.jnsPotongan.total = mysqlJnsPotongan.length;
        let importedJnsPotongan = 0;
        
        for (const row of mysqlJnsPotongan) {
            try {
                await prisma.jnsPotongan.upsert({
                    where: { transCode: parseInt(row.TRANS_CODE) || 0 },
                    update: {
                        jenis: row.JENIS || '',
                        isActive: row.is_active !== undefined ? row.is_active === 1 : true
                    },
                    create: {
                        transCode: parseInt(row.TRANS_CODE) || 0,
                        jenis: row.JENIS || '',
                        isActive: row.is_active !== undefined ? row.is_active === 1 : true
                    }
                });
                importedJnsPotongan++;
                stats.jnsPotongan.imported++;
            } catch (err) {
                stats.jnsPotongan.errors++;
                console.error(`❌ Failed to import JnsPotongan ${row.TRANS_CODE}:`, err.message);
            }
        }
        console.log(`✅ Imported ${importedJnsPotongan} deduction types.`);

        // 1b. Import JnsTunjangan (Allowance Types)
        console.log('⏳ Importing JnsTunjangan (Allowance Types)...');
        const [mysqlJnsTunjangan] = await pool.query('SELECT * FROM jnstunjangan');
        stats.jnsTunjangan.total = mysqlJnsTunjangan.length;
        let importedJnsTunjangan = 0;
        
        for (const row of mysqlJnsTunjangan) {
            try {
                await prisma.jnsTunjangan.upsert({
                    where: { transCode: parseInt(row.TRANS_CODE) || 0 },
                    update: {
                        jenis: row.JENIS || '',
                        isActive: row.is_active !== undefined ? row.is_active === 1 : true
                    },
                    create: {
                        transCode: parseInt(row.TRANS_CODE) || 0,
                        jenis: row.JENIS || '',
                        isActive: row.is_active !== undefined ? row.is_active === 1 : true
                    }
                });
                importedJnsTunjangan++;
                stats.jnsTunjangan.imported++;
            } catch (err) {
                stats.jnsTunjangan.errors++;
                console.error(`❌ Failed to import JnsTunjangan ${row.TRANS_CODE}:`, err.message);
            }
        }
        console.log(`✅ Imported ${importedJnsTunjangan} allowance types.`);

        // 1c. Import JnsRapel (Rapel Types)
        console.log('⏳ Importing JnsRapel (Rapel Types)...');
        const [mysqlJnsRapel] = await pool.query('SELECT * FROM jnsrapel');
        stats.jnsRapel.total = mysqlJnsRapel.length;
        let importedJnsRapel = 0;
        
        for (const row of mysqlJnsRapel) {
            try {
                await prisma.jnsRapel.upsert({
                    where: { transCode: parseInt(row.TRANS_CODE) || 0 },
                    update: {
                        jenis: row.JENIS || '',
                        isActive: row.is_active !== undefined ? row.is_active === 1 : true
                    },
                    create: {
                        transCode: parseInt(row.TRANS_CODE) || 0,
                        jenis: row.JENIS || '',
                        isActive: row.is_active !== undefined ? row.is_active === 1 : true
                    }
                });
                importedJnsRapel++;
                stats.jnsRapel.imported++;
            } catch (err) {
                stats.jnsRapel.errors++;
                console.error(`❌ Failed to import JnsRapel ${row.TRANS_CODE}:`, err.message);
            }
        }
        console.log(`✅ Imported ${importedJnsRapel} rapel types.`);

        // 2. IMPORT POTONGAN - MOVED AFTER GAJI

        // 3. IMPORT PINJAMHDR (Loans Header)
        console.log('⏳ Importing PinjamHdr...');
        const [mysqlPinjamHdr] = await pool.query('SELECT * FROM pinjamhdr');
        stats.pinjamHdr.total = mysqlPinjamHdr.length;
        for (const row of mysqlPinjamHdr) {
            try {
                await prisma.pinjamHdr.upsert({
                    where: { pinjam_hdr_unique: { emplId: row.EMPL_ID, tglPinjam: new Date(row.TGL_PINJAM), totPinjam: parseFloat(row.TOT_PINJAM) || 0, jnsSumber: parseInt(row.JNS_SUMBER) || 0 } },
                    update: {
                        saldoPinjam: parseFloat(row.SALDO_PINJAM) || 0,
                        jmlCicil: parseInt(row.JML_CICIL) || 0,
                        keterangan: row.KETERANGAN || "",
                        status: row.STATUS === 1,
                        approved: row.APPROVED === 1,
                        approvedBy: row.APPROVED_BY
                    },
                    create: {
                        emplId: row.EMPL_ID,
                        tglPinjam: new Date(row.TGL_PINJAM),
                        totPinjam: parseFloat(row.TOT_PINJAM) || 0,
                        jnsSumber: parseInt(row.JNS_SUMBER) || 0,
                        saldoPinjam: parseFloat(row.SALDO_PINJAM) || 0,
                        jmlCicil: parseInt(row.JML_CICIL) || 0,
                        keterangan: row.KETERANGAN || "",
                        status: row.STATUS === 1,
                        approved: row.APPROVED === 1,
                        approvedBy: row.APPROVED_BY
                    }
                });
                stats.pinjamHdr.imported++;
            } catch (err) {
                stats.pinjamHdr.errors++;
            }
        }
        console.log(`✅ Imported ${stats.pinjamHdr.imported} loan header records.`);

        // 4. IMPORT PINJAMDET - MOVED AFTER GAJI

        // 5. IMPORT GAJI (Imported AFTER Potongan & Pinjaman as requested)
        console.log('⏳ Importing Gaji...');
        const [mysqlGaji] = await pool.query('SELECT * FROM gaji');
        stats.gaji.total = mysqlGaji.length;
        
        for (const row of mysqlGaji) {
            try {
                // Comprehensive field mapping (CORRECTED to match schema)
                const gajiData = {
                    // Basic Info
                    nik: row.NIK || null,
                    nama: row.NAMA || null,
                    
                    // Organization Structure
                    kdFact: row.KD_FACT || null,
                    kdBag: row.KD_BAG || null,
                    kdDept: row.KD_DEPT || null,
                    kdSeksie: row.KD_SEKSIE || null,
                    kdJab: row.KD_JAB || null,
                    kdCmpy: row.KD_CMPY || null,
                    
                    // Dates
                    tglProses: parseDate(row.TGL_PROSES) || new Date(),
                    tglMsk: parseDate(row.TGL_MSK) || new Date(),
                    
                    // Employee Metadata & Tenure (NEW)
                    typeEmpl: parseInt(row.TYPE_EMPL) || 0,
                    kdPjk: parseInt(row.KD_PJK) || 0,
                    typePjk: parseInt(row.TYPE_PJK) || 0,
                    kdBpjsTk: row.KD_BPJSTK === 1,
                    kdBpjsKes: row.KD_BPJSKES === 1,
                    kdOut: row.KD_OUT === 1,
                    kdJns: parseInt(row.KD_JNS) || 0,
                    thnKerja: parseInt(row.THN_KERJA) || 0,
                    blnKerja: parseInt(row.BLN_KERJA) || 0,
                    hrKerja: parseInt(row.HR_KERJA) || 0,
                    persenMasa: parseFloat(row.PERSENMASA) || 0,
                    persenRmh: parseFloat(row.PERSEN_RMH) || 0,
                    hrKerja1: parseInt(row.HR_KERJA1) || 0,
                    hrKerja2: parseInt(row.HR_KERJA2) || 0,

                    // Base Salary
                    pokokBln: parseFloat(row.POKOK_BLN) || 0,
                    pokokTrm: parseFloat(row.POKOK_TRM) || 0,
                    
                    // Allowances (Tunjangan) - Only fields that exist in schema
                    tJabatan: parseFloat(row.TJABATAN) || 0,
                    tTransport: parseFloat(row.TTRANSPORT) || 0,
                    tMakan: parseFloat(row.TMAKAN) || 0,
                    tKhusus: parseFloat(row.TKHUSUS) || 0,
                    tLain: parseFloat(row.TLAIN) || 0,
                    tunjLain: parseFloat(row.TUNJLAIN) || 0,
                    tunjMedik: parseFloat(row.TUNJMEDIK) || 0,
                    
                    // Rapel
                    rapel: parseFloat(row.RAPEL) || 0,
                    tunjRapel: parseFloat(row.TUNJRAPEL) || 0,
                    
                    // Overtime (Lembur) - Correct field names
                    totJLembur: parseFloat(row.TOTJLEMBUR) || 0,  // Hours
                    totULembur: parseFloat(row.TOTULEMBUR) || 0,  // Amount
                    jLembur1: parseFloat(row.JLEMBUR1) || 0,
                    jLembur2: parseFloat(row.JLEMBUR2) || 0,
                    jLembur3: parseFloat(row.JLEMBUR3) || 0,
                    jLembur4: parseFloat(row.JLEMBUR4) || 0,
                    lebihJam: parseFloat(row.LEBIHJAM) || 0,
                    totLmbNerus: parseFloat(row.TOTLMBNERUS) || 0,
                    
                    // Shift & Meal Allowances - Correct field names from schema
                    hrShift1: parseInt(row.HR_SHIFT1) || 0,
                    hrShift2: parseInt(row.HR_SHIFT2) || 0,
                    hrShift3: parseInt(row.HR_SHIFT3) || 0,
                    hrLShift: parseInt(row.HR_LSHIFT) || 0,
                    hrShift4: parseInt(row.HR_SHIFT4) || 0,
                    hrShift5: parseInt(row.HR_SHIFT5) || 0,
                    hrShift6: parseInt(row.HR_SHIFT6) || 0,
                    hrShift7: parseInt(row.HR_SHIFT7) || 0,
                    hrShift8: parseInt(row.HR_SHIFT8) || 0,
                    hrShift9: parseInt(row.HR_SHIFT9) || 0,
                    hrShift10: parseInt(row.HR_SHIFT10) || 0,
                    totUShift: parseFloat(row.TOTUSHIFT) || 0,  // Schema: totUShift
                    mealOt: parseFloat(row.MEALOT) || 0,        // Schema: mealOt
                    
                    // BPJS Employee Contributions - Correct field names
                    jhtEmpl: parseFloat(row.JHT_EMPL) || 0,
                    jpnEmpl: parseFloat(row.JPN_EMPL) || 0,
                    jknEmpl: parseFloat(row.JKN_EMPL) || 0,
                    
                    // BPJS Company Contributions - Correct field names
                    jhtComp: parseFloat(row.JHT_COMP) || 0,
                    jpnComp: parseFloat(row.JPN_COMP) || 0,
                    jknComp: parseFloat(row.JKN_COMP) || 0,
                    
                    // Tax
                    tPph21: parseFloat(row.TPPH21) || 0,
                    pphThr: parseFloat(row.PPH_THR) || 0,
                    
                    // Admin & Other
                    admBank: parseFloat(row.ADM_BANK) || 0,
                    upahTetap: parseFloat(row.UPAHTETAP) || 0,
                    
                    // BPJS Basis
                    dasarBpjsTk: parseFloat(row.DASAR_BPJSTK) || 0,
                    dasarBpjsKes: parseFloat(row.DASAR_BPJSKES) || 0,
                    dasarJpn: parseFloat(row.DASAR_JPN) || 0,
                    
                    // Jaminan & Other Deductions (NEW)
                    jkk: parseFloat(row.JKK) || 0,
                    jkm: parseFloat(row.JKM) || 0,
                    jpk: parseFloat(row.JPK) || 0,
                    ptkpAmount: parseFloat(row.PTKP) || 0,
                    pphEmpl: parseFloat(row.PPH_EMPL) || 0,
                    ptAbsen: parseFloat(row.PT_ABSEN) || 0,

                    // Attendance/HR Counters (NEW)
                    hrHadir: parseInt(row.HR_HADIR) || 0,
                    hrMangkir: parseInt(row.HR_MANGKIR) || 0,
                    hrSakit: parseInt(row.HR_SAKIT) || 0,
                    hrTransp: parseInt(row.HR_TRANSP) || 0,
                    hrMakan: parseInt(row.HR_MAKAN) || 0,
                    hrIzin: parseInt(row.HR_IZIN) || 0,
                    hrCuti1: parseInt(row.HR_CUTI1) || 0,
                    hrCuti2: parseInt(row.HR_CUTI2) || 0,
                    hrGantung: parseInt(row.HR_GANTUNG) || 0,
                    hrLambat: parseInt(row.HR_LAMBAT) || 0,
                    mnLambat: parseInt(row.MN_LAMBAT) || 0,
                    hrPulang: parseInt(row.HR_PULANG) || 0,
                    hrOff: parseInt(row.HR_OFF) || 0,
                    hrExtMeal: parseInt(row.HR_EXTMEAL) || 0,
                    hrExtSusu: parseInt(row.HR_EXTSUSU) || 0,
                    hrExtShift: parseInt(row.HR_EXTSHIFT) || 0,

                    // THR (Holiday Allowance)
                    thr: parseFloat(row.THR) || 0,
                    
                    // Totals
                    gKotor: parseFloat(row.GKOTOR) || 0,
                    gBersih: parseFloat(row.GBERSIH) || 0,
                    pinjam: parseFloat(row.PINJAM) || 0,
                    koperasi: parseFloat(row.KOPERASI) || 0,
                    ptLain: parseFloat(row.PT_LAIN) || 0,
                    totPotong: parseFloat(row.TOTPOTONG) || 0,

                    // UUID Relations
                    companyId: companyMap.get(row.KD_CMPY) || null,
                    factId: factMap.get(row.KD_FACT) || null,
                    bagId: bagMap.get(row.KD_BAG) || null,
                    deptId: deptMap.get(row.KD_DEPT) || null,
                    sieId: sieMap.get(row.KD_SEKSIE) || null,
                    jabatanId: jabatanMap.get(row.KD_JAB) || null,
                    ptkpId: ptkpMap.get(parseInt(row.KD_PTKP)) || null,
                    jnskaryId: jnsKaryMap.get(parseInt(row.KD_JNS)) || null,
                    
                    // Status
                    closing: row.CLOSING === 1,
                    paidDate: parseDate(row.PAID_DATE),
                    paidBy: row.PAID_BY || null
                };

                await prisma.gaji.upsert({
                    where: { gaji_unique: { period: row.PERIOD, emplId: row.EMPL_ID } },
                    update: gajiData,
                    create: {
                        period: row.PERIOD,
                        emplId: row.EMPL_ID,
                        ...gajiData
                    }
                });
                stats.gaji.imported++;
            } catch (err) {
                stats.gaji.errors++;
                console.error(`❌ Gaji ${row.EMPL_ID} error:`, err.message);
            }
        }
        console.log(`✅ Imported ${stats.gaji.imported} gaji records.`);

        // 2. IMPORT POTONGAN (Moved here to satisfy FK constraint to Gaji)
        console.log('⏳ Importing Potongan (Post-Gaji)...');
        const [mysqlPotongan] = await pool.query('SELECT * FROM potongan');
        stats.potongan.total = mysqlPotongan.length;
        for (const row of mysqlPotongan) {
            try {
                await prisma.potongan.upsert({
                    where: { potongan_unique: { period: row.PERIOD, transId: row.TRANS_ID } },
                    update: { 
                        jumlah: parseFloat(row.JUMLAH) || 0, 
                        keterangan: row.KETERANGAN,
                        jenisPotId: jnsPotMap.get(parseInt(row.TRANS_CODE)) || null
                    },
                    create: {
                        period: row.PERIOD,
                        transId: row.TRANS_ID,
                        transDate: new Date(row.TRANS_DATE),
                        transCode: parseInt(row.TRANS_CODE) || 0,
                        emplId: row.EMPL_ID,
                        nik: row.NIK,
                        jumlah: parseFloat(row.JUMLAH) || 0,
                        keterangan: row.KETERANGAN,
                        jenisPotId: jnsPotMap.get(parseInt(row.TRANS_CODE)) || null
                    }
                });
                stats.potongan.imported++;
            } catch (err) {
                stats.potongan.errors++;
                console.error(`❌ Potongan Error ${row.TRANS_ID} (Code: ${row.TRANS_CODE}):`, err.message);
            }
        }
        console.log(`✅ Imported ${stats.potongan.imported} potongan records.`);

        // 4. IMPORT PINJAMDET (Moved here to satisfy FK constraint to Gaji)
        console.log('⏳ Importing PinjamDet (Post-Gaji)...');
        const [mysqlPinjamDet] = await pool.query('SELECT * FROM pinjamdet');
        stats.pinjamDet.total = mysqlPinjamDet.length;
        for (const row of mysqlPinjamDet) {
            try {
                await prisma.pinjamDet.upsert({
                    where: { pinjam_det_unique: { transId: row.TRANS_ID, periode: row.PERIODE, jnsSumber: parseInt(row.JNS_SUMBER) || 0, tglBayar: new Date(row.TGL_BAYAR) } },
                    update: {
                        jmlBayar: parseFloat(row.JML_BAYAR) || 0,
                        saldoPinjam: parseFloat(row.SALDO_PINJAM) || 0,
                        keterangan: row.KETERANGAN || "",
                        flagLunas: row.FLAG_LUNAS === 1
                    },
                    create: {
                        transId: row.TRANS_ID,
                        periode: row.PERIODE,
                        jnsSumber: parseInt(row.JNS_SUMBER) || 0,
                        tglBayar: new Date(row.TGL_BAYAR),
                        tglPinjam: new Date(row.TGL_PINJAM),
                        emplId: row.EMPL_ID,
                        jmlBayar: parseFloat(row.JML_BAYAR) || 0,
                        saldoPinjam: parseFloat(row.SALDO_PINJAM) || 0,
                        keterangan: row.KETERANGAN || "",
                        flagLunas: row.FLAG_LUNAS === 1
                    }
                });
                stats.pinjamDet.imported++;
            } catch (err) {
                stats.pinjamDet.errors++;
            }
        }
        console.log(`✅ Imported ${stats.pinjamDet.imported} loan detail records.`);

        // 6. IMPORT TUNJANGAN (Allowance Details)
        console.log('⏳ Importing Tunjangan...');
        const [mysqlTunjangan] = await pool.query('SELECT * FROM tunjangan');
        stats.tunjangan.total = mysqlTunjangan.length;
        for (const row of mysqlTunjangan) {
            try {
                await prisma.tunjangan.upsert({
                    where: { tunjangan_unique: { period: row.PERIOD, transId: row.TRANS_ID } },
                    update: { 
                        jumlah: parseFloat(row.JUMLAH) || 0, 
                        keterangan: row.KETERANGAN,
                        jenisTunjId: jnsTunjMap.get(parseInt(row.TRANS_CODE)) || null
                    },
                    create: {
                        period: row.PERIOD,
                        transId: row.TRANS_ID,
                        transDate: new Date(row.TRANS_DATE),
                        transCode: parseInt(row.TRANS_CODE) || 0,
                        jenisTunjId: jnsTunjMap.get(parseInt(row.TRANS_CODE)) || null,
                        emplId: row.EMPL_ID,
                        nik: row.NIK,
                        jumlah: parseFloat(row.JUMLAH) || 0,
                        keterangan: row.KETERANGAN
                    }
                });
                stats.tunjangan.imported++;
            } catch (err) {
                stats.tunjangan.errors++;
            }
        }
        console.log(`✅ Imported ${stats.tunjangan.imported} tunjangan records.`);

        // 7. IMPORT RAPEL
        console.log('⏳ Importing Rapel...');
        const [mysqlRapel] = await pool.query('SELECT * FROM rapel');
        stats.rapel.total = mysqlRapel.length;
        for (const row of mysqlRapel) {
            try {
                await prisma.rapel.upsert({
                    where: { rapel_unique: { period: row.PERIOD, transId: row.TRANS_ID } },
                    update: { 
                        jumlah: parseFloat(row.JUMLAH) || 0, 
                        keterangan: row.KETERANGAN,
                        jenisRapelId: jnsRapelMap.get(parseInt(row.TRANS_CODE)) || null
                    },
                    create: {
                        period: row.PERIOD,
                        transId: row.TRANS_ID,
                        transDate: new Date(row.TRANS_DATE),
                        transCode: parseInt(row.TRANS_CODE) || 0,
                        jenisRapelId: jnsRapelMap.get(parseInt(row.TRANS_CODE)) || null,
                        emplId: row.EMPL_ID,
                        nik: row.NIK,
                        jumlah: parseFloat(row.JUMLAH) || 0,
                        keterangan: row.KETERANGAN
                    }
                });
                stats.rapel.imported++;
            } catch (err) {
                stats.rapel.errors++;
                console.error(`❌ Rapel ${row.TRANS_ID} (Period: ${row.PERIOD}, TransCode: ${row.TRANS_CODE}) error:`, err.message);
            }
        }

        res.status(200).json({ success: true, stats, message: 'Import payroll selesai' });
    } catch (error) {
        console.error('🔥 Import Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// Import Attendance Data (Limit to last 6 months)
router.post('/import/attendance', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    const stats = { 
        total: 0, 
        imported: 0, 
        updated: 0, 
        errors: 0, 
        errorDetails: [],
        dependencies: {
            periods: { total: 0, imported: 0 },
            descriptions: { total: 0, imported: 0 },
            workHours: { total: 0, imported: 0 }
        },
        autoActivated: 0
    };

    const activeEmplIds = new Set(); // Track employees with activity

    try {
        console.log('🏁 Starting Attendance Import with dependencies...');

        // 1. IMPORT PERIODS
        console.log('⏳ Importing Periods...');
        const [mysqlPeriods] = await pool.query('SELECT * FROM periode');
        stats.dependencies.periods.total = mysqlPeriods.length;
        for (const row of mysqlPeriods) {
            try {
                const awal = new Date(row.AWAL);
                const akhir = new Date(row.AKHIR);
                await prisma.periode.upsert({
                    where: { periodeId: row.PERIODE_ID },
                    update: {
                        awal: !isNaN(awal.getTime()) ? awal : new Date(),
                        akhir: !isNaN(akhir.getTime()) ? akhir : new Date(),
                        dataDefa: row.DATA_DEFA === 1,
                        tutup: row.TUTUP === 1,
                        tahun: parseInt(row.TAHUN) || 2024,
                        bulan: parseInt(row.BULAN) || 1,
                        nama: row.NAMA,
                        kdCmpy: row.KD_CMPY
                    },
                    create: {
                        periodeId: row.PERIODE_ID,
                        awal: !isNaN(awal.getTime()) ? awal : new Date(),
                        akhir: !isNaN(akhir.getTime()) ? akhir : new Date(),
                        dataDefa: row.DATA_DEFA === 1,
                        tutup: row.TUTUP === 1,
                        tahun: parseInt(row.TAHUN) || 2024,
                        bulan: parseInt(row.BULAN) || 1,
                        nama: row.NAMA,
                        kdCmpy: row.KD_CMPY
                    }
                });
                stats.dependencies.periods.imported++;
            } catch (err) { /* silent fail for deps */ }
        }

        // 2. IMPORT ATTENDANCE DESCRIPTIONS (DescAbsen)
        console.log('⏳ Importing Attendance Descriptions...');
        const [mysqlDesc] = await pool.query('SELECT * FROM desc_absen');
        stats.dependencies.descriptions.total = mysqlDesc.length;
        for (const row of mysqlDesc) {
            try {
                await prisma.descAbsen.upsert({
                    where: { kodeDesc: row.KODE_DESC },
                    update: { keterangan: row.KETERANGAN },
                    create: { kodeDesc: row.KODE_DESC, keterangan: row.KETERANGAN }
                });
                stats.dependencies.descriptions.imported++;
            } catch (err) { /* silent fail for deps */ }
        }

        // 3. IMPORT WORK HOURS TYPES (JnsJam)
        console.log('⏳ Importing Work Hour Types...');
        const [mysqlJnsJam] = await pool.query('SELECT * FROM jnsjam');
        stats.dependencies.workHours.total = mysqlJnsJam.length;
        for (const row of mysqlJnsJam) {
            try {
                await prisma.jnsJam.upsert({
                    where: { kdJam: row.KD_JAM },
                    update: { jnsJam: row.JNS_JAM || null },
                    create: { kdJam: row.KD_JAM, jnsJam: row.JNS_JAM || null }
                });
                stats.dependencies.workHours.imported++;
            } catch (err) { /* silent fail for deps */ }
        }

        // 4. IMPORT ATTENDANCE RECORDS (From January 1, 2026)
        const startDate = new Date('2026-01-01');
        startDate.setHours(0, 0, 0, 0);

        console.log(`📅 Importing attendance since ${startDate.toISOString()}...`);

        const [mysqlAbsent] = await pool.query(
            'SELECT * FROM absent WHERE TGL_ABSEN >= ?',
            [startDate]
        );

        stats.total = mysqlAbsent.length;
        console.log(`📊 Found ${stats.total} attendance records to process.`);

        // Cache for validation to speed up
        const employeeCache = new Set();
        const periodCache = new Set();
        const descCache = new Set();
        const jamCache = new Set();

        for (const row of mysqlAbsent) {
            try {
                const tglAbsen = parseDate(row.TGL_ABSEN);
                if (!tglAbsen) continue;

                // --- VALIDATIONS ---
                // 1. Employee Check
                if (!employeeCache.has(row.EMPL_ID)) {
                    const exists = await prisma.karyawan.findUnique({ where: { emplId: row.EMPL_ID } });
                    if (!exists) {
                        throw new Error(`Employee ${row.EMPL_ID} not found in PostgreSQL. Run Employee Import first.`);
                    }
                    employeeCache.add(row.EMPL_ID);
                }

                // 2. Period Check
                let periode = row.PERIODE?.trim() || null;
                if (periode && !periodCache.has(periode)) {
                    const exists = await prisma.periode.findUnique({ where: { periodeId: periode } });
                    if (!exists) {
                        console.warn(`⚠️  Period [${periode}] not found, using generic or erroring...`);
                        throw new Error(`Period ${periode} not found. Fix: Dependency import failed.`);
                    }
                    periodCache.add(periode);
                } else if (!periode) {
                    throw new Error(`Attendance record for ${row.EMPL_ID} missing Period ID.`);
                }

                // 3. Desc Check
                let kodeDesc = row.KODE_DESC?.trim() || null;
                if (kodeDesc && !descCache.has(kodeDesc)) {
                    const exists = await prisma.descAbsen.findUnique({ where: { kodeDesc } });
                    if (!exists) {
                        console.warn(`⚠️  Desc [${kodeDesc}] not found, setting to null for ${row.EMPL_ID}`);
                        kodeDesc = null;
                    } else {
                        descCache.add(kodeDesc);
                    }
                }

                // 4. Jam Check
                let kdJam = row.KD_JAM?.trim() || null;

                // --- HOTFIX: OVERRIDE SUNDAY 'JK1' ---
                // MySQL Source has 'JK1' (Normal) for Sundays, which is incorrect.
                // We force it to null (Off/Libur) relative to the specific date.
                if (tglAbsen && kdJam === 'JK1') {
                    const dayOfWeek = tglAbsen.getDay(); // 0 = Sunday
                    if (dayOfWeek === 0) {
                        console.log(`⚠️  Overriding Sunday 'JK1' for ${row.EMPL_ID} on ${row.TGL_ABSEN} -> Set to NULL (Off)`);
                        kdJam = null; 
                    }
                }

                if (kdJam && !jamCache.has(kdJam)) {
                    const exists = await prisma.jnsJam.findUnique({ where: { kdJam } });
                    if (!exists) {
                        console.warn(`⚠️  Jam [${kdJam}] not found, setting to null for ${row.EMPL_ID}`);
                        kdJam = null;
                    } else {
                        jamCache.add(kdJam);
                    }
                }

                // --- 5. ATT_LOG PRIORITY OVERRIDE ---
                // Override MySQL 'absent' data with RAW 'att_log' data to fix date shifting
                // Use original row.TGL_ABSEN string (YYYY-MM-DD) for lookup
                const rawLogs = await findRealInOutFromLogs(pool, row.EMPL_ID, row.TGL_ABSEN);
                
                // If we found raw logs, USE THEM as the truth
                let finalRealMasuk = rawLogs.realMasuk || row.REALMASUK;
                let finalRealKeluar = rawLogs.realKeluar || row.REALKELUAR;

                // --- HOTFIX: SUNDAY STRICT LOG VALIDATION ---
                // On Sundays, we don't trust the MySQL 'absent' table's clock times 
                // if there are no raw entries in 'att_log'. This prevents phantom "Hadir" data.
                if (tglAbsen && tglAbsen.getDay() === 0) {
                    if (!rawLogs.realMasuk && !rawLogs.realKeluar) {
                        finalRealMasuk = null;
                        finalRealKeluar = null;
                    }
                }

                // Recalculate lambat/cepat based on FINAL times
                const lambatRecalc = calculateLate(row.STDMASUK, finalRealMasuk);
                const cepatRecalc = calculateEarly(row.STDKELUAR, finalRealKeluar);

                const absentData = {
                    periode: periode,
                    nik: row.NIK || null,
                    idAbsen: row.ID_ABSEN || null,
                    nama: row.NAMA || null,
                    kdCmpy: row.KD_CMPY || null,
                    kdFact: row.KD_FACT || null,
                    kdBag: row.KD_BAG || null,
                    kdDept: row.KD_DEPT || null,
                    kdSeksie: row.KD_SEKSIE || null,
                    kdJam: kdJam,
                    groupShift: row.GROUP_SHIFT || '',
                    stdMasuk: row.STDMASUK || null,
                    stdKeluar: row.STDKELUAR || null,
                    realMasuk: finalRealMasuk,    // Use Overridden/Original
                    realKeluar: finalRealKeluar,  // Use Overridden/Original
                    jMasuk: row.JMASUK || null,   // Keep original or recalc? Keep for now
                    jKeluar: row.JKELUAR || null, // Keep original or recalc? Keep for now
                    kdLmb: row.KD_LMB === 1,
                    kdSpl: row.KD_SPL === 1,
                    lembur1: parseFloat(row.LEMBUR1) || 0,
                    lembur2: parseFloat(row.LEMBUR2) || 0,
                    lembur3: parseFloat(row.LEMBUR3) || 0,
                    lembur4: parseFloat(row.LEMBUR4) || 0,
                    totKerja: parseFloat(row.TOTKERJA) || 0,
                    lambat: lambatRecalc,
                    cepat: cepatRecalc,
                    kdHari: parseInt(row.KD_HARI) || 1,
                    kdAbsen: sanitizeAttendanceStatus({
                        kdAbsen: row.KD_ABSEN || 'H',
                        realMasuk: finalRealMasuk,
                        realKeluar: finalRealKeluar
                    }),
                    kdShif: parseInt(row.KD_SHIF) || 1,
                    mskLmb: row.MSK_LMB || null,
                    klrLmb: row.KLR_LMB || null,
                    totLmb: parseFloat(row.TOT_LMB) || 0,
                    ketLmb: row.KET_LMB || null,
                    flagShift: row.FLAG_SHIFT === 1,
                    flagMeal: row.FLAG_MEAL === 1,
                    flagSusu: row.FLAG_SUSU === 1,
                    kodeDesc: kodeDesc
                };

                // TRACK ACTIVITY FOR AUTO-ACTIVATION
                if (finalRealMasuk || finalRealKeluar) {
                    activeEmplIds.add(row.EMPL_ID);
                }

                const result = await prisma.absent.upsert({
                    where: { 
                        absent_unique: { 
                            emplId: row.EMPL_ID, 
                            tglAbsen: tglAbsen 
                        } 
                    },
                    update: absentData,
                    create: {
                        emplId: row.EMPL_ID,
                        tglAbsen: tglAbsen,
                        ...absentData
                    }
                });

                if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                    stats.imported++;
                } else {
                    stats.updated++;
                }
            } catch (err) {
                stats.errors++;
                stats.errorDetails.push({
                    emplId: row.EMPL_ID,
                    tglAbsen: row.TGL_ABSEN,
                    error: err.message
                });
            }
        }

        // 5. AUTO-SYNC RAW LOGS (att_log) for the same period
        console.log('🔄 Syncing raw tap logs (att_log)...');
        const logStats = await syncAttLogsInternal(pool, startDate, activeEmplIds);

        // 6. BULK ACTIVATE EMPLOYEES
        if (activeEmplIds.size > 0) {
            console.log(`🔄 Auto-activating ${activeEmplIds.size} employees based on attendance...`);
            const updateResult = await prisma.karyawan.updateMany({
                where: {
                    emplId: { in: Array.from(activeEmplIds) },
                    OR: [
                        { kdSts: { not: 'AKTIF' } }, // Only update if not already active
                        { kdSts: null }
                    ]
                },
                data: {
                    kdSts: 'AKTIF'
                }
            });
            stats.autoActivated = updateResult.count;
            console.log(`✅ Activated ${updateResult.count} employees.`);
        }

        res.status(200).json({ 
            success: true, 
            stats: {
                ...stats,
                attLog: logStats
            }, 
            message: `Import absensi selesai: ${stats.imported} baru, ${stats.updated} diupdate. Raw logs: ${logStats.imported} synced. Auto-Activated: ${stats.autoActivated} employees.` 
        });
    } catch (error) {
        console.error('🔥 Attendance Import Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- NEW ENDPOINT: Raw AttLog Sync (For Cron) ---
router.post('/import/att-log', async (req, res) => {
    try {
        console.log('🔄 Starting Scheduled AttLog Sync...');
        const pool = await getMysqlPool();
        if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 2); // Sync last 2 days
        startDate.setHours(0, 0, 0, 0);

        const stats = await syncAttLogsInternal(pool, startDate); // No auto-activation for background sync to save resources

        res.status(200).json({
            success: true,
            stats: stats,
            message: `AttLog sync completed. Imported: ${stats.imported}, Errors: ${stats.errors}`
        });
    } catch (error) {
        console.error('❌ AttLog Sync Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// Import Company Data (MUST run before employees!)
router.post('/import/companies', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    const stats = { total: 0, imported: 0, errors: 0, errorDetails: [] };

    try {
        const [mysqlCompanies] = await pool.query('SELECT * FROM company');
        stats.total = mysqlCompanies.length;

        for (const row of mysqlCompanies) {
            try {
                await prisma.company.upsert({
                    where: { kodeCmpy: row.KODE_CMPY },
                    update: {
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
                stats.imported++;
            } catch (err) {
                stats.errors++;
                stats.errorDetails.push({
                    kodeCmpy: row.KODE_CMPY,
                    company: row.COMPANY,
                    error: err.message
                });
            }
        }
        
        console.log('✅ Company Import Complete:', stats);
        res.status(200).json({ 
            success: stats.errors === 0, 
            stats, 
            errorSample: stats.errorDetails.slice(0, 10),
            message: `Import company selesai: ${stats.imported} berhasil, ${stats.errors} error` 
        });
    } catch (error) {
        console.error('Company import error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Import Bank Data
router.post('/import/banks', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    const stats = { total: 0, imported: 0, errors: 0 };

    try {
        const [mysqlBanks] = await pool.query('SELECT * FROM bank');
        stats.total = mysqlBanks.length;

        for (const row of mysqlBanks) {
            try {
                await prisma.bank.upsert({
                    where: { bankCode: row.BANK_CODE },
                    update: { bankNama: row.BANK_NAMA },
                    create: {
                        bankCode: row.BANK_CODE,
                        bankNama: row.BANK_NAMA
                    }
                });
                stats.imported++;
            } catch (err) {
                stats.errors++;
            }
        }
        res.status(200).json({ success: true, stats, message: 'Import bank selesai' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Import Position (Jabatan) Data
router.post('/import/positions', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    const stats = { total: 0, imported: 0, errors: 0 };

    try {
        const [mysqlJab] = await pool.query('SELECT * FROM mstjab');
        stats.total = mysqlJab.length;

        for (const row of mysqlJab) {
            try {
                await prisma.mstJab.upsert({
                    where: { kdJab: row.CKD_JAB },
                    update: { 
                        nmJab: row.CNM_JAB,
                        nTjabatan: row.NTJABATAN,
                        nTransport: row.NTRANSPORT,
                        nShiftAll: row.NSHIFT_ALL,
                        nPremiHdr: row.NPREMI_HDR,
                        persenRmh: row.PERSEN_RMH,
                        persenPph: row.PERSEN_PPH,
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
                stats.imported++;
            } catch (err) {
                stats.errors++;
            }
        }
        res.status(200).json({ success: true, stats, message: 'Import jabatan selesai' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Import Organization Structure (Bagian, Dept, Sie)
router.post('/import/org-structure', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    const stats = { 
        divisions: { total: 0, imported: 0, errors: 0 },
        departments: { total: 0, imported: 0, errors: 0 },
        sections: { total: 0, imported: 0, errors: 0 }
    };

    try {
        // 1. Import Divisions (mstbag)
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

        // 2. Import Departments (mstdept)
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

        // 3. Import Sections (mstsie)
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

        res.status(200).json({ success: true, stats, message: 'Import struktur organisasi selesai' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Import Employees (karyawan)
router.post('/import/employees', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    const stats = { total: 0, imported: 0, updated: 0, errors: 0, errorDetails: [] };

    try {
        console.log('🏁 Starting Employee Import (with Master Data dependencies)...');
        
        // --- 1. SEQUENTIAL MASTER DATA IMPORT ---
        console.log('🏢 Importing Companies...');
        const [mysqlCompanies] = await pool.query('SELECT * FROM company');
        for (const row of mysqlCompanies) {
            try {
                await prisma.company.upsert({
                    where: { kodeCmpy: row.KODE_CMPY },
                    update: {
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
            } catch (err) { console.error(`Failed to import Company ${row.KODE_CMPY}:`, err.message); }
        }

        console.log('📚 Importing Religions...');
        const [mysqlAgm] = await pool.query('SELECT * FROM mstagm');
        for (const row of mysqlAgm) {
            try {
                await prisma.mstAgm.upsert({
                    where: { kdAgm: row.CKD_AGM },
                    update: { nmAgm: row.CNM_AGM, keterangan: row.KETERANGAN },
                    create: { kdAgm: row.CKD_AGM, nmAgm: row.CNM_AGM, keterangan: row.KETERANGAN }
                });
            } catch (err) { console.error(`Failed to import Religion ${row.CKD_AGM}:`, err.message); }
        }

        console.log('🎓 Importing Education Levels...');
        const [mysqlSkl] = await pool.query('SELECT * FROM mstskl');
        for (const row of mysqlSkl) {
            try {
                await prisma.mstSkl.upsert({
                    where: { kdSkl: row.CKD_SKL },
                    update: { nmSkl: row.CNM_SKL, keterangan: row.KETERANGAN },
                    create: { kdSkl: row.CKD_SKL, nmSkl: row.CNM_SKL, keterangan: row.KETERANGAN }
                });
            } catch (err) { console.error(`Failed to import Education ${row.CKD_SKL}:`, err.message); }
        }

        console.log('🏦 Importing Banks...');
        const [mysqlBanks] = await pool.query('SELECT * FROM bank');
        for (const row of mysqlBanks) {
            try {
                await prisma.bank.upsert({
                    where: { bankCode: row.BANK_CODE },
                    update: { bankNama: row.BANK_NAMA },
                    create: { bankCode: row.BANK_CODE, bankNama: row.BANK_NAMA }
                });
            } catch (err) { console.error(`Failed to import Bank ${row.BANK_CODE}:`, err.message); }
        }

        console.log('🏭 Importing Factories...');
        const [mysqlFact] = await pool.query('SELECT * FROM mstfact');
        for (const row of mysqlFact) {
            try {
                await prisma.mstFact.upsert({
                    where: { kdFact: row.CKD_FACT },
                    update: { nmFact: row.CNM_FACT, keterangan: row.KETERANGAN },
                    create: { kdFact: row.CKD_FACT, nmFact: row.CNM_FACT, keterangan: row.KETERANGAN }
                });
            } catch (err) { console.error(`Failed to import Factory ${row.CKD_FACT}:`, err.message); }
        }

        console.log('🏢 Importing Divisions...');
        const [mysqlBag] = await pool.query('SELECT * FROM mstbag');
        for (const row of mysqlBag) {
            try {
                await prisma.mstBag.upsert({
                    where: { kdBag: row.CKD_BAG },
                    update: { nmBag: row.CNM_BAG, keterangan: row.KETERANGAN },
                    create: { kdBag: row.CKD_BAG, nmBag: row.CNM_BAG, keterangan: row.KETERANGAN }
                });
            } catch (err) { console.error(`Failed to import Division ${row.CKD_BAG}:`, err.message); }
        }

        console.log('📂 Importing Departments...');
        const [mysqlDept] = await pool.query('SELECT * FROM mstdept');
        for (const row of mysqlDept) {
            try {
                await prisma.mstDept.upsert({
                    where: { kdDept: row.CKD_DEPT },
                    update: { nmDept: row.CNM_DEPT, kdBag: row.CKD_BAG, keterangan: row.KETERANGAN },
                    create: { kdDept: row.CKD_DEPT, nmDept: row.CNM_DEPT, kdBag: row.CKD_BAG, keterangan: row.KETERANGAN }
                });
            } catch (err) { console.error(`Failed to import Department ${row.CKD_DEPT}:`, err.message); }
        }

        console.log('📑 Importing Sections...');
        const [mysqlSie] = await pool.query('SELECT * FROM mstsie');
        for (const row of mysqlSie) {
            try {
                await prisma.mstSie.upsert({
                    where: { kdSeksie: row.CKD_SIE },
                    update: { nmSeksie: row.CNM_SIE, kdBag: row.CKD_BAG, kdDept: row.CKD_DEPT, keterangan: row.KETERANGAN },
                    create: { kdSeksie: row.CKD_SIE, nmSeksie: row.CNM_SIE, kdBag: row.CKD_BAG, kdDept: row.CKD_DEPT, keterangan: row.KETERANGAN }
                });
            } catch (err) { console.error(`Failed to import Section ${row.CKD_SIE}:`, err.message); }
        }

        console.log('💼 Importing Positions...');
        const [mysqlJab] = await pool.query('SELECT * FROM mstjab');
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
            } catch (err) { console.error(`Failed to import Position ${row.CKD_JAB}:`, err.message); }
        }

        console.log('📊 Importing Employee Levels...');
        const [mysqlPkt] = await pool.query('SELECT * FROM mstpkt');
        for (const row of mysqlPkt) {
            try {
                await prisma.mstPkt.upsert({
                    where: { kdPkt: row.CKD_PKT },
                    update: { nmPkt: row.CNM_PKT, keterangan: row.KETERANGAN },
                    create: { kdPkt: row.CKD_PKT, nmPkt: row.CNM_PKT, keterangan: row.KETERANGAN }
                });
            } catch (err) { console.error(`Failed to import Level ${row.CKD_PKT}:`, err.message); }
        }

        console.log('🔄 Importing Shift Groups...');
        const [mysqlShifts] = await pool.query('SELECT * FROM groupshift');
        for (const row of mysqlShifts) {
            try {
                await prisma.groupShift.upsert({
                    where: { groupShift: row.GROUP_SHIFT },
                    update: { groupName: row.GROUP_NAME || '', isActive: true },
                    create: { groupShift: row.GROUP_SHIFT, groupName: row.GROUP_NAME || '', isActive: true }
                });
            } catch (err) { console.error(`Failed to import Shift Group ${row.GROUP_SHIFT}:`, err.message); }
        }

        console.log('⏳ Importing Work Hour Types (JnsJam)...');
        const [mysqlJnsJam] = await pool.query('SELECT * FROM jnsjam');
        for (const row of mysqlJnsJam) {
            try {
                await prisma.jnsJam.upsert({
                    where: { kdJam: row.KD_JAM },
                    update: { nmJam: row.NM_JAM, jamMsk: row.JAM_MSK, jamKlr: row.JAM_KLR },
                    create: { kdJam: row.KD_JAM, nmJam: row.NM_JAM, jamMsk: row.JAM_MSK, jamKlr: row.JAM_KLR }
                });
            } catch (err) { console.error(`Failed to import JnsJam ${row.KD_JAM}:`, err.message); }
        }

        console.log('✅ Master Data dependencies imported. Proceeding to employees...');
        
        // --- 1.5. FETCH MASTER DATA UUIDS FOR LOOKUP ---
        console.log('🔍 Fetching Master Data UUIDs for mapping...');
        
        const [
            allAgm, allSkl, allBank, allFact, allBag, 
            allDept, allSie, allJab, allPkt, allCompany
        ] = await Promise.all([
            prisma.mstAgm.findMany({ select: { kdAgm: true, id: true } }),
            prisma.mstSkl.findMany({ select: { kdSkl: true, id: true } }),
            prisma.bank.findMany({ select: { bankCode: true, id: true } }),
            prisma.mstFact.findMany({ select: { kdFact: true, id: true } }),
            prisma.mstBag.findMany({ select: { kdBag: true, id: true } }),
            prisma.mstDept.findMany({ select: { kdDept: true, id: true } }),
            prisma.mstSie.findMany({ select: { kdSeksie: true, id: true } }),
            prisma.mstJab.findMany({ select: { kdJab: true, id: true } }),
            prisma.mstPkt.findMany({ select: { kdPkt: true, id: true } }),
            prisma.company.findMany({ select: { kodeCmpy: true, id: true } })
        ]);

        // Create Lookup Maps: Code -> UUID
        const mapAgm = new Map(allAgm.map(i => [i.kdAgm, i.id]));
        const mapSkl = new Map(allSkl.map(i => [i.kdSkl, i.id]));
        const mapBank = new Map(allBank.map(i => [i.bankCode, i.id]));
        const mapFact = new Map(allFact.map(i => [i.kdFact, i.id]));
        const mapBag = new Map(allBag.map(i => [i.kdBag, i.id]));
        const mapDept = new Map(allDept.map(i => [i.kdDept, i.id]));
        const mapSie = new Map(allSie.map(i => [i.kdSeksie, i.id]));
        const mapJab = new Map(allJab.map(i => [i.kdJab, i.id]));
        const mapPkt = new Map(allPkt.map(i => [i.kdPkt, i.id]));
        const mapCompany = new Map(allCompany.map(i => [i.kodeCmpy, i.id]));

        console.log('✅ Lookup maps created.');

        // --- 2. EMPLOYEE IMPORT ---
        const [mysqlEmployees] = await pool.query('SELECT * FROM karyawan');
        stats.total = mysqlEmployees.length;

        // Enum conversion maps
        const kdSexMap = { 1: 'LAKILAKI', 2: 'PEREMPUAN' };
        const kdJnsMap = { 1: 'KONTRAK', 2: 'TETAP', 3: 'HARIAN' };
        const kdStsMap = { 1: 'TIDAK_AKTIF', 2: 'AKTIF' };

        for (const row of mysqlEmployees) {
            try {
                // 1. Validate foreign keys exist
                let kdSeksie = row.KD_SEKSIE || null;
                if (kdSeksie) {
                    const exists = await prisma.mstSie.findUnique({ where: { kdSeksie } });
                    if (!exists) kdSeksie = null;
                }

                let kdAgm = row.KD_AGM || null;
                if (kdAgm) {
                    const exists = await prisma.mstAgm.findUnique({ where: { kdAgm } });
                    if (!exists) kdAgm = null;
                }

                let kdPkt = row.KD_PKT || null;
                if (kdPkt) {
                    const exists = await prisma.mstPkt.findUnique({ where: { kdPkt } });
                    if (!exists) kdPkt = null;
                }

                let kdJab = row.KD_JAB || null;
                if (kdJab) {
                    const exists = await prisma.mstJab.findUnique({ where: { kdJab } });
                    if (!exists) kdJab = null;
                }

                let kdSkl = row.KD_SKL || null;
                if (kdSkl) {
                    const exists = await prisma.mstSkl.findUnique({ where: { kdSkl } });
                    if (!exists) kdSkl = null;
                }

                let bankCode = row.BANK_CODE || null;
                if (bankCode) {
                    const exists = await prisma.bank.findUnique({ where: { bankCode } });
                    if (!exists) bankCode = null;
                }

                // 2. Handle NIK Uniqueness
                let nik = row.NIK || null;
                if (nik) {
                    // Check if NIK is already used by ANOTHER employee
                    const existingNik = await prisma.karyawan.findFirst({
                        where: { 
                            nik: nik,
                            emplId: { not: row.EMPL_ID } // Ignore self
                        }
                    });
                    
                    if (existingNik) {
                        console.warn(`⚠️  Employee ${row.EMPL_ID} (${row.NAMA}) has duplicate NIK '${nik}' used by ${existingNik.emplId}. Setting NIK to null.`);
                        nik = null; // Clear NIK to allow import
                    }
                }

                const employeeData = {
                    emplId: row.EMPL_ID,
                    nik: nik,
                    idAbsen: row.ID_ABSEN || null,
                    nama: row.NAMA,
                    
                    // Foreign Keys - Legacy Codes
                    kdCmpy: row.KD_CMPY || null,
                    kdFact: row.KD_FACT || null,
                    kdBag: row.KD_BAG || null,
                    kdDept: row.KD_DEPT || null,
                    kdSeksie: kdSeksie,
                    kdPkt: kdPkt,
                    kdJab: kdJab,
                    kdAgm: kdAgm,
                    kdSkl: kdSkl,
                    bankCode: bankCode,
                    
                    // Personal Data with Enum Conversion
                    kdSex: kdSexMap[row.KD_SEX] || 'LAKILAKI',
                    alamat1: row.ALAMAT1 || null,
                    alamat2: row.ALAMAT2 || null,
                    kota: row.KOTA || null,
                    kdPos: row.KD_POS || null,
                    telpon: row.TELPON || null,
                    handphone: row.HANDPHONE || null,
                    email: row.EMAIL || null,
                    tmpLhr: row.TMP_LHR || null,
                    tglLhr: parseDate(row.TGL_LHR),
                    tglAngkat: parseDate(row.TGL_ANGKAT),
                    
                    // Documents
                    ktpNo: row.KTPNO || null,
                    validKtp: parseDate(row.VALID_KTP),
                    npwp: row.NPWP || null,
                    tglNpwp: parseDate(row.TGL_NPWP),
                    typeSim: row.TYPE_SIM || null,
                    noSim: row.NO_SIM || null,
                    validSim: parseDate(row.VALID_SIM),
                    pasportNo: row.PASPORTNO || null,
                    kitasNo: row.KITASNO || null,
                    validKitas: parseDate(row.VALID_KITAS),
                    
                    // BPJS
                    noBpjsTk: row.NOBPJSTK || null,
                    noBpjsKes: row.NOBPJSKES || null,
                    kdBpjsTk: row.KD_BPJSTK === 1,
                    kdBpjsKes: row.KD_BPJSKES === 1,
                    tglAstek: parseDate(row.TGL_ASTEK),
                    
                    // Bank
                    bankUnit: row.BANK_UNIT || null,
                    bankRekNo: row.BANK_REKNO || null,
                    bankRekName: row.BANK_REKNAME || null,
                    
                    // Employment Status
                    tglMsk: parseDate(row.TGL_MSK),
                    tglOut: parseDate(row.TGL_OUT),
                    alasanOut: row.ALASAN_OUT ? row.ALASAN_OUT.toString() : null,
                    kdOut: row.KD_OUT === 1,
                    kdJns: kdJnsMap[row.KD_JNS] || 'TETAP',
                    hariKerja: row.HARI_KERJA || 5,
                    groupShift: row.GROUP_SHIFT || '00',
                    kdGaji: row.KD_GAJI || 1,
                    kdWni: row.KD_WNI === 1,
                    kdSts: kdStsMap[row.KD_STS] || 'AKTIF',
                    
                    // Marriage & Family
                    tglNikah: parseDate(row.TGL_NIKAH),
                    kdPtkp: row.KD_PTKP || 1,
                    jmlAnak: row.JMLANAK || 0,
                    
                    // Attendance & Overtime
                    kdLmb: row.KD_LMB === 1,
                    kdSpl: row.KD_SPL === 1,
                    
                    // Tax
                    kdPjk: row.KD_PJK === 1,
                    typePjk: row.TYPE_PJK || 1,
                    
                    // Work Hours
                    kdJam: row.KD_JAM || 'A',
                    jnsJamKdJam: row.KD_JAM || 'A',
                    
                    // Cooperative
                    kdKoperasi: row.KD_KOPERASI === 1,
                    kdptRumah: row.KDPT_RUMAH === 1,
                    potRumah: row.POT_RUMAH || 0,
                    tglKoperasi: parseDate(row.TGL_KOPERASI),
                    noAnggota: row.No_ANGGOTA || null,
                    
                    // Union & Uniform
                    kdSpsi: row.KD_SPSI === 1,
                    uniform1: row.UNIFORM1 || null,
                    uniform2: row.UNIFORM2 || 0,
                    
                    // Physical Data
                    glDarah: row.GLDARAH || null,
                    tinggi: row.TINGGI || 0,
                    berat: row.BERAT || 0,
                    
                    // PAYROLL FIELDS (Critical!)
                    pokokBln: row.POKOK_BLN || 0,
                    tTransport: row.TTRANSPORT || 0,
                    kdTransp: row.KD_TRANSP === 1,
                    tMakan: row.TMAKAN || 0,
                    kdMakan: row.KD_MAKAN === 1,
                    tJabatan: row.TJABATAN || 0,
                    tKeluarga: row.TKELUARGA || 0,
                    tKomunikasi: row.TKOMUNIKASI || 0,
                    tKhusus: row.TKHUSUS || 0,
                    tLmbtetap: row.TLMBTETAP || 0,
                    fixOther: row.FIXOTHER || 0,
                    
                    // Emergency Contact
                    nmTeman: row.NM_TEMAN || null,
                    almTeman: row.ALM_TEMAN || null,
                    tlpTeman: row.TLP_TEMAN || null,
                    hubTeman: row.HUB_TEMAN || null,
                    
                    // Photo & Documents
                    lokasiPoto: row.LOKASIPOTO || null,
                    kkNo: row.KKNO || null,
                    ibuKandung: row.IBUKANDUNG || null,
                    alamatDom1: row.ALAMATDOM1 || null,
                    alamatDom2: row.ALAMATDOM2 || null,
                    imagesName: row.ImagesName || null,
                    imagesSize: row.ImagesSize || null,
                    
                    // Audit
                    createdBy: 'mysql_import',
                    updatedBy: row.Update_by || 'mysql_import'
                };

                // Upsert employee
                const result = await prisma.karyawan.upsert({
                    where: { emplId: row.EMPL_ID },
                    update: employeeData,
                    create: employeeData
                });

                if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                    stats.imported++;
                } else {
                    stats.updated++;
                }
            } catch (err) {
                stats.errors++;
                stats.errorDetails.push({
                    emplId: row.EMPL_ID,
                    nama: row.NAMA,
                    error: err.message
                });
                console.error(`Error importing employee ${row.EMPL_ID}:`, err.message);
            }
        }

        console.log('✅ Employee Import Complete:', stats);
        
        // Log first few errors for debugging
        if (stats.errorDetails.length > 0) {
            console.log('📋 Sample Errors (first 5):');
            stats.errorDetails.slice(0, 5).forEach(err => {
                console.log(`  - ${err.emplId} (${err.nama}): ${err.error}`);
            });
        }
        
        res.status(200).json({ 
            success: stats.errors === 0, 
            stats, 
            errorSample: stats.errorDetails.slice(0, 10), // Return first 10 errors for debugging
            message: `Import karyawan selesai: ${stats.imported} baru, ${stats.updated} diupdate, ${stats.errors} error` 
        });
    } catch (error) {
        console.error('Employee import error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Import Employee Levels (mstpkt)
router.post('/import/levels', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    const stats = { total: 0, imported: 0, errors: 0 };

    try {
        const [mysqlPkt] = await pool.query('SELECT * FROM mstpkt');
        stats.total = mysqlPkt.length;

        for (const row of mysqlPkt) {
            try {
                await prisma.mstPkt.upsert({
                    where: { kdPkt: row.CKD_PKT },
                    update: { nmPkt: row.CNM_PKT, keterangan: row.KETERANGAN },
                    create: { kdPkt: row.CKD_PKT, nmPkt: row.CNM_PKT, keterangan: row.KETERANGAN }
                });
                stats.imported++;
            } catch (err) {
                stats.errors++;
            }
        }
        res.status(200).json({ success: true, stats, message: 'Import golongan selesai' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Import Religion (mstagm)
router.post('/import/religions', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    const stats = { total: 0, imported: 0, errors: 0 };

    try {
        const [mysqlAgm] = await pool.query('SELECT * FROM mstagm');
        stats.total = mysqlAgm.length;

        for (const row of mysqlAgm) {
            try {
                await prisma.mstAgm.upsert({
                    where: { kdAgm: row.CKD_AGM },
                    update: { nmAgm: row.CNM_AGM, keterangan: row.KETERANGAN },
                    create: { kdAgm: row.CKD_AGM, nmAgm: row.CNM_AGM, keterangan: row.KETERANGAN }
                });
                stats.imported++;
            } catch (err) {
                stats.errors++;
            }
        }
        res.status(200).json({ success: true, stats, message: 'Import agama selesai' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Import Education Levels (mstskl)
router.post('/import/education', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    const stats = { total: 0, imported: 0, errors: 0 };

    try {
        const [mysqlSkl] = await pool.query('SELECT * FROM mstskl');
        stats.total = mysqlSkl.length;

        for (const row of mysqlSkl) {
            try {
                await prisma.mstSkl.upsert({
                    where: { kdSkl: row.CKD_SKL },
                    update: { nmSkl: row.CNM_SKL, keterangan: row.KETERANGAN },
                    create: { kdSkl: row.CKD_SKL, nmSkl: row.CNM_SKL, keterangan: row.KETERANGAN }
                });
                stats.imported++;
            } catch (err) {
                stats.errors++;
            }
        }
        res.status(200).json({ success: true, stats, message: 'Import pendidikan selesai' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Import Shift Groups (groupshift)
router.post('/import/shift-groups', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    const stats = { total: 0, imported: 0, errors: 0 };

    try {
        const [mysqlShifts] = await pool.query('SELECT * FROM groupshift');
        stats.total = mysqlShifts.length;

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
                stats.imported++;
            } catch (err) {
                stats.errors++;
            }
        }
        res.status(200).json({ success: true, stats, message: 'Import shift group selesai' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Import Factories (mstfact)
router.post('/import/factories', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    const stats = { total: 0, imported: 0, errors: 0 };

    try {
        const [mysqlFact] = await pool.query('SELECT * FROM mstfact');
        stats.total = mysqlFact.length;

        for (const row of mysqlFact) {
            try {
                await prisma.mstFact.upsert({
                    where: { kdFact: row.CKD_FACT },
                    update: { nmFact: row.CNM_FACT, keterangan: row.KETERANGAN },
                    create: { kdFact: row.CKD_FACT, nmFact: row.CNM_FACT, keterangan: row.KETERANGAN }
                });
                stats.imported++;
            } catch (err) {
                stats.errors++;
            }
        }
        res.status(200).json({ success: true, stats, message: 'Import factory selesai' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Check Machine (MySQL) Connection Status
router.get('/status/machine', async (req, res) => {
    try {
        const pool = await getMysqlPool();
        if (!pool) return res.status(200).json({ success: false, message: 'MySQL not configured' });
        
        // Simple query to verify connection
        await pool.query('SELECT 1');
        res.status(200).json({ success: true, message: 'Online' });
    } catch (error) {
        res.status(200).json({ success: false, message: 'Offline', error: error.message });
    }
});

// Import Raw Attendance Logs (att_log)
router.post('/import/att-log', async (req, res) => {
    const pool = await getMysqlPool();
    if (!pool) return res.status(500).json({ success: false, message: 'MySQL not configured' });

    try {
        // Only import since 2026-01-01 for thorough verification
        const startDate = new Date('2026-01-01');
        startDate.setHours(0, 0, 0, 0);
        
        const stats = await syncAttLogsInternal(pool, startDate);
        res.status(200).json({ success: true, stats, message: 'AttLog sync complete' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;

