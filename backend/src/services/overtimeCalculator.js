/**
 * Overtime Calculator — Kalkulator Upah Lembur
 * Dasar Hukum: Peraturan Menteri Tenaga Kerja dan Transmigrasi No. 102/MEN/VI/2004
 *
 * Rumus Upah Per Jam = 1/173 × Upah Sebulan
 *
 * Tarif Lembur:
 *   Hari Biasa (kdHari=1):
 *     - Jam 1       : 1.5x upah per jam
 *     - Jam ke-2 dst: 2.0x upah per jam
 *
 *   Hari Libur / Minggu (kdHari=2) — Hari Kerja 6 Hari:
 *     - Jam 1-7     : 2.0x
 *     - Jam ke-8    : 3.0x
 *     - Jam ke-9 dst: 4.0x
 *
 *   Hari Libur / Minggu (kdHari=2) — Hari Kerja 5 Hari:
 *     - Jam 1-8     : 2.0x
 *     - Jam ke-9    : 3.0x
 *     - Jam ke-10dst: 4.0x
 *
 *   Hari Libur Nasional jatuh pada Hari Kerja (kdHari=3):
 *     - 6 Hari Kerja: jam 1-7=2x, jam 8=3x, jam 9+=4x
 *     - 5 Hari Kerja: jam 1-8=2x, jam 9=3x, jam 10+=4x
 */

/**
 * Hitung upah per jam berdasarkan upah sebulan
 * @param {number} upahBulan - Upah sebulan (gaji pokok + tunjangan tetap)
 * @returns {number} upah per jam
 */
export function hitungUpahPerJam(upahBulan) {
  return upahBulan / 173;
}

/**
 * Hitung multiplier lembur berdasarkan jenis hari dan jam ke-n
 * @param {number} kdHari - 1=hari biasa, 2=libur mingguan, 3=libur nasional
 * @param {number} jamKe  - urutan jam lembur (mulai dari 1)
 * @param {number} hariKerja - 5 atau 6 hari kerja per minggu
 * @returns {number} multiplier upah
 */
export function getMultiplierLembur(kdHari, jamKe, hariKerja = 5) {
  if (kdHari === 1) {
    // Hari biasa
    if (jamKe === 1) return 1.5;
    return 2.0;
  }

  // Hari libur mingguan (kdHari=2) ATAU libur nasional pada hari kerja (kdHari=3)
  const batasNormal = hariKerja === 6 ? 7 : 8;
  const batasTengah = hariKerja === 6 ? 8 : 9;

  if (jamKe <= batasNormal) return 2.0;
  if (jamKe === batasTengah) return 3.0;
  return 4.0;
}

/**
 * Hitung total upah lembur untuk satu hari
 * @param {object} params
 * @param {number} params.upahBulan   - Upah sebulan (gaji pokok + tunjangan tetap)
 * @param {number} params.totalJam    - Total jam lembur (desimal, misal 2.5)
 * @param {number} params.kdHari      - 1=hari biasa, 2=libur mingguan, 3=libur nasional
 * @param {number} params.hariKerja   - 5 atau 6 (hari kerja per minggu)
 * @returns {object} { upahLembur, detail: [{jam, multiplier, nilai}] }
 */
export function hitungUpahLembur({ upahBulan, totalJam, kdHari = 1, hariKerja = 5 }) {
  const upahPerJam = hitungUpahPerJam(upahBulan);
  let upahLembur = 0;
  const detail = [];

  // Bulatkan ke desimal 2 angka
  const jamTotal = Math.round(totalJam * 100) / 100;
  let jamSisa = jamTotal;
  let jamKe = 1;

  while (jamSisa > 0) {
    const multiplier = getMultiplierLembur(kdHari, jamKe, hariKerja);
    const jamDihitung = Math.min(jamSisa, 1.0);
    const nilai = upahPerJam * multiplier * jamDihitung;

    detail.push({ jamKe, multiplier, jamDihitung, nilai: Math.round(nilai) });
    upahLembur += nilai;

    jamSisa -= 1.0;
    jamKe++;
  }

  return {
    upahPerJam: Math.round(upahPerJam),
    upahLembur: Math.round(upahLembur),
    totalJam: jamTotal,
    detail,
  };
}

/**
 * Hitung total upah lembur untuk satu periode (dari tabel Lembur)
 * @param {Array}  lemburRows  - Array record dari tabel lembur
 * @param {number} upahBulan   - Upah sebulan karyawan
 * @param {number} hariKerja   - 5 atau 6 hari kerja per minggu
 * @returns {object} {
 *   totULembur   : total rupiah upah lembur (dibulatkan),
 *   totJLembur   : total jam lembur,
 *   lembur1-4    : jam lembur per tipe (agregat),
 *   detailPerHari: array detail per hari
 * }
 */
export function hitungTotalLemburPeriode(lemburRows, upahBulan, hariKerja = 5) {
  let totULembur = 0;
  let totJLembur = 0;
  // Akumulasi jam per tipe multiplier
  let jLembur1 = 0; // 1.5x
  let jLembur2 = 0; // 2.0x
  let jLembur3 = 0; // 3.0x
  let jLembur4 = 0; // 4.0x
  const detailPerHari = [];

  for (const row of lemburRows) {
    const totalJam = Number(row.totLembur || 0);
    if (totalJam <= 0) continue;

    const kdHari = row.kdHari || 1;
    const result = hitungUpahLembur({ upahBulan, totalJam, kdHari, hariKerja });

    totULembur += result.upahLembur;
    totJLembur += totalJam;

    // Akumulasi per tipe
    for (const d of result.detail) {
      if (d.multiplier === 1.5) jLembur1 += d.jamDihitung;
      else if (d.multiplier === 2.0) jLembur2 += d.jamDihitung;
      else if (d.multiplier === 3.0) jLembur3 += d.jamDihitung;
      else if (d.multiplier === 4.0) jLembur4 += d.jamDihitung;
    }

    detailPerHari.push({
      tglLembur: row.tglLembur,
      kdHari,
      totalJam,
      upahLembur: result.upahLembur,
    });
  }

  return {
    totULembur: Math.round(totULembur),
    totJLembur: Math.round(totJLembur * 100) / 100,
    jLembur1: Math.round(jLembur1 * 100) / 100,
    jLembur2: Math.round(jLembur2 * 100) / 100,
    jLembur3: Math.round(jLembur3 * 100) / 100,
    jLembur4: Math.round(jLembur4 * 100) / 100,
    detailPerHari,
  };
}
