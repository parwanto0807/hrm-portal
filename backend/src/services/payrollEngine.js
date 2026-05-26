/**
 * Payroll Engine — Core Orchestrator Kalkulasi Gaji
 *
 * Urutan kalkulasi:
 *  1. Ambil data karyawan, absensi, lembur, tunjangan, potongan periode
 *  2. Hitung upah pro-rata (hari hadir / hari kerja normal)
 *  3. Hitung lembur (overtimeCalculator)
 *  4. Hitung BPJS TK & Kesehatan (bpjsCalculator)
 *  5. Hitung PPh 21 TER (pphCalculator) — Jan–Nov: TER, Des: progresif
 *  6. Hitung potongan lain (pinjaman, koperasi, absensi)
 *  7. Hitung gaji kotor dan gaji bersih
 *  8. Simpan ke tabel gaji + catat di payroll_log
 */

import { prisma } from '../config/prisma.js';
import { hitungTotalLemburPeriode } from './overtimeCalculator.js';
import { hitungBpjs, validasiUMK } from './bpjsCalculator.js';
import {
  hitungPph21TER,
  hitungPph21Desember,
  hitungBiayaJabatan,
  getKategoriTER,
} from './pphCalculator.js';

// ────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────

/** Bulatkan ke Rp 100 terdekat */
const bulat = (n) => Math.round(Number(n || 0) / 100) * 100;
/** Safe number conversion */
const num = (v) => Number(v || 0);

/**
 * Catat perubahan di payroll_log
 */
async function catatLog(period, emplId, action, changedBy, ipAddress = null, fields = {}) {
  const logs = Object.entries(fields).map(([fieldName, { oldValue, newValue }]) => ({
    period,
    emplId,
    action,
    fieldName,
    oldValue: String(oldValue ?? ''),
    newValue: String(newValue ?? ''),
    changedBy,
    ipAddress,
  }));

  if (logs.length > 0) {
    await prisma.payrollLog.createMany({ data: logs });
  } else {
    await prisma.payrollLog.create({
      data: { period, emplId, action, changedBy, ipAddress },
    });
  }
}

// ────────────────────────────────────────────────────────────────
// MAIN ENGINE
// ────────────────────────────────────────────────────────────────

/**
 * Hitung gaji untuk SATU karyawan dalam satu periode
 *
 * @param {object} params
 * @param {object} params.employee      - Data karyawan dari tabel karyawan
 * @param {object} params.periode       - Data periode dari tabel periode
 * @param {Array}  params.absenRows     - Rows absent karyawan periode ini
 * @param {Array}  params.lemburRows    - Rows lembur karyawan periode ini
 * @param {Array}  params.tunjanganRows - Rows tunjangan tambahan
 * @param {Array}  params.potonganRows  - Rows potongan tambahan
 * @param {Array}  params.pinjamDetRows - Rows cicilan pinjaman
 * @param {Array}  params.tarifTERRows  - Rows tarif_ter dari database
 * @param {object} params.konfigBpjs    - Konfigurasi BPJS dari database
 * @param {number} params.umk           - UMK berlaku untuk perusahaan
 * @param {number} params.sudahDipotongPPh - Total PPh Jan–Nov (untuk rekonsiliasi Des)
 * @returns {object} payload siap di-upsert ke tabel gaji
 */
export async function hitungGajiKaryawan({
  employee,
  periode,
  absenRows = [],
  lemburRows = [],
  tunjanganRows = [],
  potonganRows = [],
  pinjamDetRows = [],
  tarifTERRows = [],
  konfigBpjs = null,
  umk = 0,
  sudahDipotongPPh = 0,
}) {
  const bulan = periode.bulan; // 1–12

  // ──────────────────────────────────────────────────────────────
  // 1. UPAH POKOK & PRO-RATA
  // ──────────────────────────────────────────────────────────────
  const pokokBln = num(employee.pokokBln);
  const hariKerjaNormal = employee.hariKerja || 22; // default 22 hari kerja/bulan

  // Hitung hari hadir (kode absen = 'H')
  const hrHadir   = absenRows.filter(a => a.kdAbsen === 'H').length;
  const hrSakit   = absenRows.filter(a => a.kdAbsen === 'S').length;
  const hrIzin    = absenRows.filter(a => a.kdAbsen === 'I').length;
  const hrMangkir = absenRows.filter(a => a.kdAbsen === 'A').length;
  const hrCuti1   = absenRows.filter(a => a.kdAbsen === 'C').length;

  // Hari yang dibayar = hadir + sakit + izin + cuti (bukan mangkir)
  const hrDibayar = hrHadir + hrSakit + hrIzin + hrCuti1;

  // Pro-rata: jika hrDibayar < hariKerjaNormal, potong gaji
  const rasio     = hariKerjaNormal > 0 ? Math.min(hrDibayar / hariKerjaNormal, 1) : 1;
  const pokokTrm  = bulat(pokokBln * rasio);

  // Potongan absensi (mangkir dipotong dari gaji)
  const upahPerHari = hariKerjaNormal > 0 ? pokokBln / hariKerjaNormal : 0;
  const ptAbsen     = bulat(hrMangkir * upahPerHari);

  // ──────────────────────────────────────────────────────────────
  // 2. TUNJANGAN TETAP (dari data karyawan)
  // ──────────────────────────────────────────────────────────────
  const tJabatan   = bulat(num(employee.tJabatan));
  const tTransport = bulat(num(employee.tTransport) * rasio); // pro-rata jika absen
  const tMakan     = bulat(num(employee.tMakan)     * rasio);
  const tKhusus    = bulat(num(employee.tKhusus));
  const tKeluarga  = bulat(num(employee.tKeluarga));
  const tKomunikasi= bulat(num(employee.tKomunikasi));

  // ──────────────────────────────────────────────────────────────
  // 3. TUNJANGAN TAMBAHAN (dari tabel tunjangan)
  // ──────────────────────────────────────────────────────────────
  const tunjLain  = tunjanganRows.reduce((s, t) => s + num(t.jumlah), 0);

  // ──────────────────────────────────────────────────────────────
  // 4. LEMBUR
  // ──────────────────────────────────────────────────────────────
  const upahAcuanLembur = pokokBln + tJabatan; // upah tetap untuk dasar lembur
  const lemburResult = hitungTotalLemburPeriode(lemburRows, upahAcuanLembur, employee.hariKerja || 5);

  const totULembur  = lemburResult.totULembur;
  const totJLembur  = lemburResult.totJLembur;
  const jLembur1    = lemburResult.jLembur1;
  const jLembur2    = lemburResult.jLembur2;
  const jLembur3    = lemburResult.jLembur3;
  const jLembur4    = lemburResult.jLembur4;

  // ──────────────────────────────────────────────────────────────
  // 5. GAJI KOTOR (sebelum potongan)
  // ──────────────────────────────────────────────────────────────
  const gKotor = pokokTrm + tJabatan + tTransport + tMakan + tKhusus
               + tKeluarga + tKomunikasi + tunjLain + totULembur;

  // ──────────────────────────────────────────────────────────────
  // 6. BPJS
  // ──────────────────────────────────────────────────────────────
  const tunjanganTetapBpjs = tJabatan + tKeluarga; // hanya tunjangan tetap
  const bpjsResult = hitungBpjs({
    upahPokok:      pokokBln,
    tunjanganTetap: tunjanganTetapBpjs,
    umk,
    ikutBpjsTk:  employee.kdBpjsTk  !== false,
    ikutBpjsKes: employee.kdBpjsKes !== false,
    konfig:      konfigBpjs,
  });

  // Validasi UMK
  const umkCheck = validasiUMK(pokokBln, umk);

  // ──────────────────────────────────────────────────────────────
  // 7. PPh 21
  // ──────────────────────────────────────────────────────────────
  // Penghasilan bruto untuk PPh = semua pendapatan yang masuk objek pajak
  const penghasilanBrutoPPh = gKotor;
  const typePtkp = employee.ptkpRef?.type || `TK/${employee.jmlAnak || 0}`;
  const punya_npwp = !!employee.npwp;

  let tPph21 = 0;
  let tarifTER = 0;

  if (employee.kdPjk) { // apakah kena pajak
    if (bulan >= 1 && bulan <= 11) {
      // Bulan Jan–Nov: Metode TER
      const pphResult = hitungPph21TER({
        penghasilanBruto: penghasilanBrutoPPh,
        typePtkp,
        tarifTERRows,
        punya_npwp,
      });
      tPph21   = pphResult.pph21;
      tarifTER = pphResult.tarifTER;
    } else {
      // Bulan Desember: Rekonsiliasi setahun
      const totalBrutoSetahun = penghasilanBrutoPPh + (sudahDipotongPPh * (1 / 0.05)); // estimasi
      const biayaJabatan = hitungBiayaJabatan(penghasilanBrutoPPh) * 12;
      const pphDesResult = hitungPph21Desember({
        totalBrutoSetahun,
        typePtkp,
        sudahDipotong: sudahDipotongPPh,
        biayaJabatan,
        punya_npwp,
      });
      tPph21 = pphDesResult.pph21Des;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // 8. POTONGAN LAIN
  // ──────────────────────────────────────────────────────────────
  const iuranKoperasi = num(employee.kdKoperasi) ? bulat(num(employee.potRumah)) : 0;
  const cicilPinjam   = pinjamDetRows.reduce((s, p) => s + num(p.jmlBayar), 0);
  const potLain       = potonganRows.reduce((s, p) => s + num(p.jumlah), 0);

  // ──────────────────────────────────────────────────────────────
  // 9. TOTAL POTONGAN & GAJI BERSIH
  // ──────────────────────────────────────────────────────────────
  const totalPotongan = bpjsResult.jhtEmpl
                      + bpjsResult.jpEmpl
                      + bpjsResult.jknEmpl
                      + tPph21
                      + iuranKoperasi
                      + cicilPinjam
                      + ptAbsen
                      + potLain;

  const gBersih = Math.max(gKotor - totalPotongan, 0);

  // ──────────────────────────────────────────────────────────────
  // 10. BUILD PAYLOAD (sesuai field tabel gaji di schema)
  // ──────────────────────────────────────────────────────────────
  const tglProses = new Date();

  return {
    period:     periode.periodeId,
    emplId:     employee.emplId,
    tglProses,
    nik:        employee.nik,
    nama:       employee.nama,
    kdCmpy:     employee.kdCmpy,
    kdFact:     employee.kdFact,
    kdBag:      employee.kdBag,
    kdDept:     employee.kdDept,
    kdSeksie:   employee.kdSeksie,
    kdJab:      employee.kdJab,
    tglMsk:     employee.tglMsk || tglProses,
    kdPjk:      employee.kdPjk ? 1 : 0,
    typePjk:    employee.typePjk || 1,
    kdBpjsTk:   employee.kdBpjsTk !== false,
    kdBpjsKes:  employee.kdBpjsKes !== false,
    kdOut:      false,

    // Upah
    pokokBln,
    pokokTrm,

    // Tunjangan
    tJabatan,
    tTransport,
    tMakan,
    tKhusus,
    tunjLain,

    // Lembur
    jLembur1,
    jLembur2,
    jLembur3,
    jLembur4,
    totJLembur,
    totULembur,

    // BPJS (simpan sebagai decimal 4 angka)
    dasarBpjsTk:  bpjsResult.dasarBpjsTk,
    dasarBpjsKes: bpjsResult.dasarBpjsKes,
    dasarJpn:     bpjsResult.dasarJpn,
    jhtComp: bpjsResult.jhtComp,
    jhtEmpl: bpjsResult.jhtEmpl,
    jkk:     bpjsResult.jkkComp,
    jkm:     bpjsResult.jkmComp,
    jpk:     bpjsResult.jpComp,
    jpnComp: bpjsResult.jpComp,
    jpnEmpl: bpjsResult.jpEmpl,
    jknComp: bpjsResult.jknComp,
    jknEmpl: bpjsResult.jknEmpl,

    // PPh 21
    tPph21,
    upahTetap: gKotor,

    // Potongan
    ptAbsen,
    koperasi: iuranKoperasi,
    pinjam:   cicilPinjam,
    ptLain:   potLain,
    totPotong: totalPotongan,

    // Kehadiran
    hrHadir,
    hrSakit,
    hrIzin,
    hrMangkir,
    hrCuti1,

    // Totals
    gKotor,
    gBersih,

    closing: false,

    // Metadata validasi (tidak disimpan ke DB, hanya untuk response)
    _validasi: {
      umkOK:    umkCheck.valid,
      umkPesan: umkCheck.pesan,
      tarifTER,
      kategoriTER: getKategoriTER(typePtkp),
    },
  };
}

// ────────────────────────────────────────────────────────────────
// BATCH PROCESSING — Jalankan kalkulasi untuk semua karyawan aktif
// ────────────────────────────────────────────────────────────────

/**
 * Jalankan kalkulasi payroll untuk seluruh karyawan dalam satu periode
 *
 * @param {string} periodeId  - contoh: '202506'
 * @param {string} kdCmpy     - kode perusahaan (opsional, jika null = semua)
 * @param {string} changedBy  - username yang menjalankan proses
 * @param {string} ipAddress  - IP address user
 * @returns {object} { berhasil, gagal, warnings }
 */
export async function runPayrollForPeriode(periodeId, kdCmpy = null, changedBy = 'SYSTEM', ipAddress = null) {
  // ── Load data master sekali untuk efisiensi ─────────────────
  const periode = await prisma.periode.findUnique({ where: { periodeId } });
  if (!periode) throw new Error(`Periode ${periodeId} tidak ditemukan`);
  if (periode.tutup) throw new Error(`Periode ${periodeId} sudah di-closing, tidak dapat diproses ulang`);

  const tahun = periode.tahun;
  const bulan = periode.bulan;

  // Load tarif TER untuk tahun berjalan
  const tarifTERRows = await prisma.tarifTER.findMany({
    where: { tahun, isActive: true },
    orderBy: [{ kategori: 'asc' }, { batasMin: 'asc' }],
  });

  // Load konfigurasi BPJS (ambil yang paling baru dan aktif per perusahaan)
  const konfigBpjsMap = {};
  const konfigBpjsList = await prisma.konfigBpjs.findMany({
    where: { isActive: true, ...(kdCmpy ? { kdCmpy } : {}) },
    orderBy: { validDate: 'desc' },
  });
  for (const k of konfigBpjsList) {
    if (!konfigBpjsMap[k.kdCmpy]) konfigBpjsMap[k.kdCmpy] = k;
  }

  // Load parameter UMK per perusahaan
  const parameterMap = {};
  const paramList = await prisma.parameter.findMany({
    where: { isActive: true, ...(kdCmpy ? { kdCmpy } : {}) },
    orderBy: { validDate: 'desc' },
  });
  for (const p of paramList) {
    if (!parameterMap[p.kdCmpy]) parameterMap[p.kdCmpy] = p;
  }

  // Load semua karyawan aktif
  const employees = await prisma.karyawan.findMany({
    where: {
      kdSts: 'AKTIF',
      ...(kdCmpy ? { kdCmpy } : {}),
    },
    include: {
      pkt:      { select: { kdPkt: true, nmPkt: true } },
      jabatan:  { select: { kdJab: true, nmJab: true } },
      ptkpRef:  { select: { type: true, wPajak: true } },
    },
  });

  if (employees.length === 0) {
    throw new Error('Tidak ada karyawan aktif yang ditemukan');
  }

  // Load data absensi periode ini (bulk)
  const absenMap = {};
  const semualAbsen = await prisma.absent.findMany({ where: { periode: periodeId } });
  for (const a of semualAbsen) {
    if (!absenMap[a.emplId]) absenMap[a.emplId] = [];
    absenMap[a.emplId].push(a);
  }

  // Load data lembur periode ini (bulk)
  const lemburMap = {};
  const semuaLembur = await prisma.lembur.findMany({ where: { periode: periodeId, approved: true } });
  for (const l of semuaLembur) {
    if (!lemburMap[l.emplId]) lemburMap[l.emplId] = [];
    lemburMap[l.emplId].push(l);
  }

  // Load tunjangan tambahan periode ini
  const tunjMap = {};
  const semuaTunj = await prisma.tunjangan.findMany({ where: { period: periodeId, status: true } });
  for (const t of semuaTunj) {
    if (!tunjMap[t.emplId]) tunjMap[t.emplId] = [];
    tunjMap[t.emplId].push(t);
  }

  // Load potongan tambahan periode ini
  const potMap = {};
  const semuaPot = await prisma.potongan.findMany({ where: { period: periodeId, status: true } });
  for (const p of semuaPot) {
    if (!potMap[p.emplId]) potMap[p.emplId] = [];
    potMap[p.emplId].push(p);
  }

  // Load cicilan pinjaman periode ini
  const pinjMap = {};
  const semuaPinj = await prisma.pinjamDet.findMany({ where: { periode: periodeId } });
  for (const p of semuaPinj) {
    if (!pinjMap[p.emplId]) pinjMap[p.emplId] = [];
    pinjMap[p.emplId].push(p);
  }

  // Load PPh yang sudah dipotong Jan–Nov (untuk rekonsiliasi Des)
  let sudahDipotongMap = {};
  if (bulan === 12) {
    // Ambil total pph21 Jan–Nov tahun ini
    const periodeJanNov = Array.from({ length: 11 }, (_, i) => {
      const bln = String(i + 1).padStart(2, '0');
      return `${tahun}${bln}`;
    });
    const gajiJanNov = await prisma.gaji.findMany({
      where: { period: { in: periodeJanNov } },
      select: { emplId: true, tPph21: true },
    });
    for (const g of gajiJanNov) {
      sudahDipotongMap[g.emplId] = (sudahDipotongMap[g.emplId] || 0) + num(g.tPph21);
    }
  }

  // ── Proses Kalkulasi per Karyawan ────────────────────────────
  const berhasil = [];
  const gagal    = [];
  const warnings = [];

  for (const emp of employees) {
    try {
      const konfigBpjs = konfigBpjsMap[emp.kdCmpy] || null;
      const umk = num(parameterMap[emp.kdCmpy]?.umk);

      const payload = await hitungGajiKaryawan({
        employee:          emp,
        periode,
        absenRows:         absenMap[emp.emplId]    || [],
        lemburRows:        lemburMap[emp.emplId]   || [],
        tunjanganRows:     tunjMap[emp.emplId]     || [],
        potonganRows:      potMap[emp.emplId]      || [],
        pinjamDetRows:     pinjMap[emp.emplId]     || [],
        tarifTERRows,
        konfigBpjs,
        umk,
        sudahDipotongPPh:  sudahDipotongMap[emp.emplId] || 0,
      });

      // Simpan validasi warnings
      if (!payload._validasi?.umkOK) {
        warnings.push({ emplId: emp.emplId, nama: emp.nama, pesan: payload._validasi.umkPesan });
      }

      // Hapus field internal sebelum upsert
      const { _validasi, ...gajiData } = payload;

      // Upsert ke tabel gaji
      await prisma.gaji.upsert({
        where: { gaji_unique: { period: periodeId, emplId: emp.emplId } },
        create: gajiData,
        update:  gajiData,
      });

      // Catat log
      await catatLog(periodeId, emp.emplId, 'RECALC', changedBy, ipAddress);

      berhasil.push({ emplId: emp.emplId, nama: emp.nama, gBersih: payload.gBersih });
    } catch (err) {
      console.error(`❌ Gagal hitung gaji ${emp.emplId}:`, err.message);
      gagal.push({ emplId: emp.emplId, nama: emp.nama, error: err.message });
    }
  }

  return {
    periodeId,
    totalKaryawan: employees.length,
    berhasil: berhasil.length,
    gagal:    gagal.length,
    warnings: warnings.length,
    detail: { berhasil, gagal, warnings },
  };
}

/**
 * Closing periode — kunci agar data tidak bisa diubah lagi
 * @param {string} periodeId
 * @param {string} changedBy
 */
export async function closingPeriode(periodeId, changedBy = 'SYSTEM', ipAddress = null) {
  const periode = await prisma.periode.findUnique({ where: { periodeId } });
  if (!periode) throw new Error(`Periode ${periodeId} tidak ditemukan`);
  if (periode.tutup) throw new Error(`Periode ${periodeId} sudah di-closing`);

  // Cek semua karyawan sudah diproses
  const jumlahGaji = await prisma.gaji.count({ where: { period: periodeId } });
  if (jumlahGaji === 0) throw new Error('Belum ada data gaji yang diproses untuk periode ini');

  await prisma.periode.update({
    where: { periodeId },
    data: { tutup: true },
  });

  // Update paid date di gaji
  await prisma.gaji.updateMany({
    where: { period: periodeId },
    data: { closing: true, paidDate: new Date(), paidBy: changedBy },
  });

  await catatLog(periodeId, 'ALL', 'CLOSE', changedBy, ipAddress);

  return { periodeId, jumlahGaji, closedAt: new Date(), closedBy: changedBy };
}

/**
 * Reopen periode — buka kembali periode yang sudah di-closing (hanya SUPER_ADMIN)
 * @param {string} periodeId
 * @param {string} changedBy
 */
export async function reopenPeriode(periodeId, changedBy = 'SYSTEM', ipAddress = null) {
  await prisma.periode.update({
    where: { periodeId },
    data: { tutup: false },
  });

  await prisma.gaji.updateMany({
    where: { period: periodeId },
    data: { closing: false, paidDate: null, paidBy: null },
  });

  await catatLog(periodeId, 'ALL', 'REOPEN', changedBy, ipAddress);

  return { periodeId, reopenedAt: new Date(), reopenedBy: changedBy };
}
