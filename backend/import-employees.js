// Script to import Employees from MySQL to PostgreSQL
// Handles FK validation and NIK uniqueness
import { getMysqlPool } from './src/config/mysqlClient.js';
import { prisma } from './src/config/prisma.js';

async function importEmployees() {
    const pool = await getMysqlPool();
    if (!pool) {
        console.error('❌ MySQL not configured');
        return;
    }

    const stats = { total: 0, imported: 0, updated: 0, errors: 0, nikConflicts: 0, sectionMissing: 0 };
    
    try {
        console.log('🏁 Starting Employee Import...');
        
        const [mysqlEmployees] = await pool.query('SELECT * FROM karyawan');
        stats.total = mysqlEmployees.length;

        // Enum conversion maps
        const kdSexMap = { 1: 'LAKILAKI', 2: 'PEREMPUAN' };
        const kdJnsMap = { 1: 'KONTRAK', 2: 'TETAP', 3: 'HARIAN' };
        const kdStsMap = { 1: 'TIDAK_AKTIF', 2: 'AKTIF' };

        const parseDate = (mysqlDate) => {
            if (!mysqlDate || mysqlDate === '0000-00-00' || mysqlDate === '0000-00-00 00:00:00') return null;
            try {
                const date = new Date(mysqlDate);
                return isNaN(date.getTime()) ? null : date;
            } catch { return null; }
        };

        for (const row of mysqlEmployees) {
            try {
                // 1. Validate KD_SEKSIE
                let kdSeksie = row.KD_SEKSIE || null;
                if (kdSeksie) {
                    const seksieExists = await prisma.mstSie.findUnique({ where: { kdSeksie } });
                    if (!seksieExists) {
                        stats.sectionMissing++;
                        kdSeksie = null;
                    }
                }

                // 2. Handle NIK Uniqueness
                let nik = row.NIK || null;
                if (nik) {
                    const existingNik = await prisma.karyawan.findFirst({
                        where: { nik: nik, emplId: { not: row.EMPL_ID } }
                    });
                    if (existingNik) {
                        stats.nikConflicts++;
                        nik = null;
                    }
                }

                const employeeData = {
                    emplId: row.EMPL_ID,
                    nik: nik,
                    idAbsen: row.ID_ABSEN || null,
                    nama: row.NAMA,
                    kdCmpy: row.KD_CMPY || null,
                    kdFact: row.KD_FACT || null,
                    kdBag: row.KD_BAG || null,
                    kdDept: row.KD_DEPT || null,
                    kdSeksie: kdSeksie,
                    kdPkt: row.KD_PKT || null,
                    kdJab: row.KD_JAB || null,
                    kdAgm: row.KD_AGM || null,
                    kdSkl: row.KD_SKL || null,
                    bankCode: row.BANK_CODE || null,
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
                    noBpjsTk: row.NOBPJSTK || null,
                    noBpjsKes: row.NOBPJSKES || null,
                    kdBpjsTk: row.KD_BPJSTK === 1,
                    kdBpjsKes: row.KD_BPJSKES === 1,
                    tglAstek: parseDate(row.TGL_ASTEK),
                    bankUnit: row.BANK_UNIT || null,
                    bankRekNo: row.BANK_REKNO || null,
                    bankRekName: row.BANK_REKNAME || null,
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
                    tglNikah: parseDate(row.TGL_NIKAH),
                    kdPtkp: row.KD_PTKP || 1,
                    jmlAnak: row.JMLANAK || 0,
                    kdLmb: row.KD_LMB === 1,
                    kdSpl: row.KD_SPL === 1,
                    kdPjk: row.KD_PJK === 1,
                    typePjk: row.TYPE_PJK || 1,
                    kdJam: row.KD_JAM || 'A',
                    kdKoperasi: row.KD_KOPERASI === 1,
                    kdptRumah: row.KDPT_RUMAH === 1,
                    potRumah: row.POT_RUMAH || 0,
                    tglKoperasi: parseDate(row.TGL_KOPERASI),
                    noAnggota: row.No_ANGGOTA || null,
                    kdSpsi: row.KD_SPSI === 1,
                    uniform1: row.UNIFORM1 || null,
                    uniform2: row.UNIFORM2 || 0,
                    glDarah: row.GLDARAH || null,
                    tinggi: row.TINGGI || 0,
                    berat: row.BERAT || 0,
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
                    nmTeman: row.NM_TEMAN || null,
                    almTeman: row.ALM_TEMAN || null,
                    tlpTeman: row.TLP_TEMAN || null,
                    hubTeman: row.HUB_TEMAN || null,
                    lokasiPoto: row.LOKASIPOTO || null,
                    kkNo: row.KKNO || null,
                    ibuKandung: row.IBUKANDUNG || null,
                    alamatDom1: row.ALAMATDOM1 || null,
                    alamatDom2: row.ALAMATDOM2 || null,
                    imagesName: row.ImagesName || null,
                    imagesSize: row.ImagesSize || null,
                    createdBy: 'mysql_import',
                    updatedBy: row.Update_by || 'mysql_import'
                };

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
                console.error(`❌ Error importing ${row.EMPL_ID}:`, err.message);
            }
        }

        console.log('═══════════════════════════════════════');
        console.log('✅ EMPLOYEE IMPORT COMPLETE!');
        console.log('═══════════════════════════════════════');
        console.log(`📊 Total:       ${stats.total}`);
        console.log(`✅ Imported:    ${stats.imported}`);
        console.log(`🔄 Updated:     ${stats.updated}`);
        console.log(`⚠️  NIK Confl:   ${stats.nikConflicts}`);
        console.log(`⚠️  Sec Miss:    ${stats.sectionMissing}`);
        console.log(`❌ Errors:      ${stats.errors}`);

    } catch (error) {
        console.error('❌ Import failed:', error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

importEmployees();
