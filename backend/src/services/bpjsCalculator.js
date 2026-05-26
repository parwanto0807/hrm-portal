/**
 * BPJS Calculator — Kalkulator Iuran BPJS
 *
 * Dasar Hukum:
 *   - PP No. 44/2015 : JHT (Jaminan Hari Tua)
 *   - PP No. 45/2015 : JP  (Jaminan Pensiun)
 *   - Permenaker 26/2015 : JKK, JKM
 *   - Perpres No. 75/2019 : JKN (BPJS Kesehatan)
 *
 * Rate Default (dapat di-override dari tabel konfig_bpjs):
 *   JHT  : Perusahaan 3.70%, Karyawan 2.00%
 *   JKK  : Perusahaan 0.24% (bisa 0.24–1.74% tergantung risiko)
 *   JKM  : Perusahaan 0.30%
 *   JP   : Perusahaan 2.00%, Karyawan 1.00% — batas atas Rp 10,043,950
 *   JKN  : Perusahaan 4.00%, Karyawan 1.00% — batas atas Rp 12,000,000
 */

/** Rate default BPJS jika belum ada konfig di database */
const RATE_DEFAULT = {
  jhtComp: 3.70,
  jhtEmpl: 2.00,
  jkkComp: 0.24,
  jkmComp: 0.30,
  jpComp:  2.00,
  jpEmpl:  1.00,
  jpMaxWage: 10_043_950,
  jknComp: 4.00,
  jknEmpl: 1.00,
  jknMaxWage: 12_000_000,
};

/**
 * Bulatkan ke kelipatan 100 terdekat (sesuai konvensi pembulatan BPJS)
 * @param {number} nilai
 * @returns {number}
 */
function bulatkan(nilai) {
  return Math.round(nilai / 100) * 100;
}

/**
 * Hitung semua komponen iuran BPJS untuk satu karyawan
 *
 * @param {object} params
 * @param {number}  params.upahPokok       - Gaji pokok karyawan
 * @param {number}  params.tunjanganTetap  - Total tunjangan tetap (jabatan, keluarga, dll)
 * @param {number}  params.umk             - UMK setempat (batas bawah dasar BPJS Kes)
 * @param {boolean} params.ikutBpjsTk      - Apakah terdaftar BPJS Ketenagakerjaan
 * @param {boolean} params.ikutBpjsKes     - Apakah terdaftar BPJS Kesehatan
 * @param {object}  [params.konfig]        - Override rate dari tabel konfig_bpjs
 * @returns {object} {
 *   // BPJS Ketenagakerjaan
 *   jhtComp, jhtEmpl,          // Jaminan Hari Tua
 *   jkkComp,                   // Jaminan Kecelakaan Kerja (hanya perusahaan)
 *   jkmComp,                   // Jaminan Kematian (hanya perusahaan)
 *   jpComp, jpEmpl,            // Jaminan Pensiun
 *   // BPJS Kesehatan
 *   jknComp, jknEmpl,          // JKN / BPJS Kesehatan
 *   // Dasar perhitungan
 *   dasarBpjsTk, dasarBpjsKes, dasarJpn,
 *   // Total potongan karyawan
 *   totalPotonganKaryawan,
 *   // Total beban perusahaan
 *   totalBebanPerusahaan,
 * }
 */
export function hitungBpjs({
  upahPokok,
  tunjanganTetap = 0,
  umk = 0,
  ikutBpjsTk = true,
  ikutBpjsKes = true,
  konfig = null,
}) {
  // Gabungkan rate dari konfig database atau gunakan default
  const rate = konfig ? {
    jhtComp:    Number(konfig.jhtComp),
    jhtEmpl:    Number(konfig.jhtEmpl),
    jkkComp:    Number(konfig.jkkComp),
    jkmComp:    Number(konfig.jkmComp),
    jpComp:     Number(konfig.jpComp),
    jpEmpl:     Number(konfig.jpEmpl),
    jpMaxWage:  Number(konfig.jpMaxWage),
    jknComp:    Number(konfig.jknComp),
    jknEmpl:    Number(konfig.jknEmpl),
    jknMaxWage: Number(konfig.jknMaxWage),
  } : RATE_DEFAULT;

  // ── Dasar Upah ──────────────────────────────────────────────
  // Dasar BPJS TK = Upah Pokok + Tunjangan Tetap (tanpa batas atas)
  const dasarBpjsTk = upahPokok + tunjanganTetap;

  // Dasar JP = Upah Pokok + Tunjangan Tetap, maks jpMaxWage
  const dasarJpn = Math.min(dasarBpjsTk, rate.jpMaxWage);

  // Dasar BPJS Kesehatan = Upah Pokok + Tunjangan Tetap
  //   min = UMK (batas bawah), max = jknMaxWage (batas atas)
  const dasarBpjsKes = Math.min(
    Math.max(dasarBpjsTk, umk),
    rate.jknMaxWage
  );

  // ── BPJS Ketenagakerjaan ─────────────────────────────────────
  let jhtComp = 0, jhtEmpl = 0;
  let jkkComp = 0, jkmComp = 0;
  let jpComp  = 0, jpEmpl  = 0;

  if (ikutBpjsTk) {
    jhtComp = bulatkan(dasarBpjsTk * rate.jhtComp / 100);
    jhtEmpl = bulatkan(dasarBpjsTk * rate.jhtEmpl / 100);
    jkkComp = bulatkan(dasarBpjsTk * rate.jkkComp / 100);
    jkmComp = bulatkan(dasarBpjsTk * rate.jkmComp / 100);
    jpComp  = bulatkan(dasarJpn    * rate.jpComp  / 100);
    jpEmpl  = bulatkan(dasarJpn    * rate.jpEmpl  / 100);
  }

  // ── BPJS Kesehatan ───────────────────────────────────────────
  let jknComp = 0, jknEmpl = 0;

  if (ikutBpjsKes) {
    jknComp = bulatkan(dasarBpjsKes * rate.jknComp / 100);
    jknEmpl = bulatkan(dasarBpjsKes * rate.jknEmpl / 100);
  }

  // ── Totals ────────────────────────────────────────────────────
  const totalPotonganKaryawan = jhtEmpl + jpEmpl + jknEmpl;
  const totalBebanPerusahaan  = jhtComp + jkkComp + jkmComp + jpComp + jknComp;

  return {
    // Dasar
    dasarBpjsTk,
    dasarBpjsKes,
    dasarJpn,
    // JHT
    jhtComp,
    jhtEmpl,
    // JKK & JKM (hanya perusahaan)
    jkkComp,
    jkmComp,
    // JP
    jpComp,
    jpEmpl,
    // JKN
    jknComp,
    jknEmpl,
    // Summary
    totalPotonganKaryawan,
    totalBebanPerusahaan,
  };
}

/**
 * Validasi apakah upah memenuhi UMK
 * @param {number} upah
 * @param {number} umk
 * @returns {{ valid: boolean, selisih: number, pesan: string }}
 */
export function validasiUMK(upah, umk) {
  const valid = upah >= umk;
  const selisih = valid ? 0 : umk - upah;
  return {
    valid,
    selisih,
    pesan: valid
      ? 'Upah memenuhi UMK'
      : `Upah di bawah UMK sebesar Rp ${selisih.toLocaleString('id-ID')}`,
  };
}
