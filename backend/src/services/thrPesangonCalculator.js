/**
 * THR Calculator — Kalkulator Tunjangan Hari Raya
 *
 * Dasar Hukum:
 *   - PP No. 6/2016 tentang Tunjangan Hari Raya Keagamaan
 *   - Permenaker No. 6/2016
 *
 * Ketentuan:
 *   - Karyawan dengan masa kerja ≥ 12 bulan : THR = 1 × Upah
 *   - Karyawan dengan masa kerja 1–12 bulan  : THR = (masa_kerja / 12) × Upah
 *   - Karyawan dengan masa kerja < 1 bulan   : Tidak berhak (0)
 *   - "Upah" = Gaji Pokok + Tunjangan Tetap
 *   - PPh atas THR dihitung terpisah (tidak digabung gaji bulanan)
 *
 * Pesangon Calculator — Kalkulator Uang Pesangon & Penghargaan Masa Kerja
 *
 * Dasar Hukum:
 *   - UU No. 11/2020 (UU Cipta Kerja) jo. PP No. 35/2021
 *   - PP No. 68/2009 (PPh Final atas Pesangon)
 */

// ================================================================
// THR CALCULATOR
// ================================================================

/**
 * Hitung masa kerja dalam bulan penuh
 * @param {Date|string} tglMasuk  - Tanggal masuk kerja
 * @param {Date|string} tglAkhir  - Tanggal akhir acuan (biasanya H-7 lebaran)
 * @returns {number} masa kerja dalam bulan
 */
export function hitungMasaKerjaBulan(tglMasuk, tglAkhir = new Date()) {
  const masuk = new Date(tglMasuk);
  const akhir = new Date(tglAkhir);

  let tahun  = akhir.getFullYear() - masuk.getFullYear();
  let bulan  = akhir.getMonth()    - masuk.getMonth();
  let hari   = akhir.getDate()     - masuk.getDate();

  // Koreksi hari negatif
  if (hari < 0) bulan--;

  // Koreksi bulan negatif
  if (bulan < 0) {
    tahun--;
    bulan += 12;
  }

  return tahun * 12 + bulan;
}

/**
 * Hitung masa kerja dalam tahun dan bulan
 * @param {Date|string} tglMasuk
 * @param {Date|string} tglAkhir
 * @returns {{ tahun: number, bulan: number, totalBulan: number }}
 */
export function hitungMasaKerja(tglMasuk, tglAkhir = new Date()) {
  const totalBulan = hitungMasaKerjaBulan(tglMasuk, tglAkhir);
  return {
    tahun:       Math.floor(totalBulan / 12),
    bulan:       totalBulan % 12,
    totalBulan,
  };
}

/**
 * Hitung THR karyawan
 * @param {object} params
 * @param {number}      params.upahPokok      - Gaji pokok
 * @param {number}      params.tunjanganTetap - Total tunjangan tetap
 * @param {Date|string} params.tglMasuk       - Tanggal masuk kerja
 * @param {Date|string} [params.tglAcuan]     - Tanggal acuan (H-7 lebaran)
 * @param {string}      [params.statusKary]   - 'TETAP', 'KONTRAK', 'PERCOBAAN', dst
 * @returns {object} { thr, masaKerjaBulan, masaKerjaTahun, upahAcuan, keterangan }
 */
export function hitungTHR({
  upahPokok,
  tunjanganTetap = 0,
  tglMasuk,
  tglAcuan = new Date(),
  statusKary = 'TETAP',
}) {
  if (!tglMasuk) {
    return { thr: 0, masaKerjaBulan: 0, masaKerjaTahun: 0, upahAcuan: 0, keterangan: 'Tanggal masuk tidak tersedia' };
  }

  const upahAcuan   = upahPokok + tunjanganTetap;
  const masaKerja   = hitungMasaKerja(tglMasuk, tglAcuan);
  const totalBulan  = masaKerja.totalBulan;

  // Karyawan dengan masa kerja < 1 bulan tidak berhak
  if (totalBulan < 1) {
    return {
      thr: 0,
      masaKerjaBulan: totalBulan,
      masaKerjaTahun: masaKerja.tahun,
      upahAcuan,
      keterangan: 'Masa kerja < 1 bulan, belum berhak THR',
    };
  }

  let thr;
  let keterangan;

  if (totalBulan >= 12) {
    // Berhak penuh
    thr = upahAcuan;
    keterangan = `Masa kerja ≥ 12 bulan: THR = 1 × upah`;
  } else {
    // Proporsional
    thr = Math.round((totalBulan / 12) * upahAcuan);
    keterangan = `Masa kerja ${totalBulan} bulan: THR = ${totalBulan}/12 × upah`;
  }

  return {
    thr,
    masaKerjaBulan: totalBulan,
    masaKerjaTahun: masaKerja.tahun,
    upahAcuan,
    keterangan,
  };
}

// ================================================================
// PESANGON CALCULATOR
// ================================================================

/** Tabel uang pesangon berdasarkan masa kerja (PP 35/2021) */
const TABEL_PESANGON = [
  { batas: 1,   bulan: 1  },
  { batas: 2,   bulan: 2  },
  { batas: 3,   bulan: 3  },
  { batas: 4,   bulan: 4  },
  { batas: 5,   bulan: 5  },
  { batas: 6,   bulan: 6  },
  { batas: 7,   bulan: 7  },
  { batas: 8,   bulan: 8  },
  { batas: Infinity, bulan: 9 }, // ≥ 8 tahun
];

/** Tabel UPMK (Uang Penghargaan Masa Kerja) */
const TABEL_UPMK = [
  { batasMin: 3,  batasMax: 6,        bulan: 2  },
  { batasMin: 6,  batasMax: 9,        bulan: 3  },
  { batasMin: 9,  batasMax: 12,       bulan: 4  },
  { batasMin: 12, batasMax: 15,       bulan: 5  },
  { batasMin: 15, batasMax: 18,       bulan: 6  },
  { batasMin: 18, batasMax: 21,       bulan: 7  },
  { batasMin: 21, batasMax: 24,       bulan: 8  },
  { batasMin: 24, batasMax: Infinity, bulan: 10 }, // ≥ 24 tahun
];

/**
 * Cari jumlah bulan pesangon berdasarkan masa kerja (tahun)
 * @param {number} masaKerjaTahun
 * @returns {number} jumlah bulan
 */
function getMultiplierPesangon(masaKerjaTahun) {
  for (const row of TABEL_PESANGON) {
    if (masaKerjaTahun < row.batas) return row.bulan;
  }
  return 9;
}

/**
 * Cari jumlah bulan UPMK berdasarkan masa kerja (tahun)
 * @param {number} masaKerjaTahun
 * @returns {number} jumlah bulan (0 jika belum memenuhi syarat)
 */
function getMultiplierUPMK(masaKerjaTahun) {
  if (masaKerjaTahun < 3) return 0;
  for (const row of TABEL_UPMK) {
    if (masaKerjaTahun >= row.batasMin && masaKerjaTahun < row.batasMax) {
      return row.bulan;
    }
  }
  return 10;
}

/**
 * Hitung PPh Final atas Pesangon (PP No. 68/2009)
 * Tarif progresif khusus pesangon (tidak sama dengan PPh 21 reguler):
 *   s.d. Rp 50 juta  : 0%
 *   > 50 juta - 100 juta : 5%
 *   > 100 juta - 500 juta: 15%
 *   > 500 juta           : 25%
 * @param {number} pesangon - Total pesangon yang dibayarkan
 * @returns {number} PPh final
 */
function hitungPPhPesangon(pesangon) {
  const LAYER_PESANGON = [
    { batas: 50_000_000,  tarif: 0.00 },
    { batas: 100_000_000, tarif: 0.05 },
    { batas: 500_000_000, tarif: 0.15 },
    { batas: Infinity,     tarif: 0.25 },
  ];

  if (pesangon <= 50_000_000) return 0;

  let pph = 0;
  let sisa = pesangon;
  let bawah = 0;

  for (const layer of LAYER_PESANGON) {
    if (sisa <= 0) break;
    const kena = Math.min(sisa, layer.batas - bawah);
    pph += kena * layer.tarif;
    sisa -= kena;
    bawah = layer.batas;
  }

  return Math.round(pph);
}

/**
 * Hitung total pesangon, UPMK, dan PPh final
 * @param {object} params
 * @param {number}      params.upahPokok      - Gaji pokok
 * @param {number}      params.tunjanganTetap - Tunjangan tetap
 * @param {Date|string} params.tglMasuk       - Tanggal masuk
 * @param {Date|string} [params.tglKeluar]    - Tanggal keluar (default: hari ini)
 * @param {string}      [params.alasanPHK]    - 'PENSIUN', 'PHK', 'MENGUNDURKAN_DIRI', dll
 * @returns {object} detail pesangon lengkap
 */
export function hitungPesangon({
  upahPokok,
  tunjanganTetap = 0,
  tglMasuk,
  tglKeluar = new Date(),
  alasanPHK = 'PHK',
}) {
  if (!tglMasuk) {
    return { error: 'Tanggal masuk tidak tersedia' };
  }

  const upahAcuan   = upahPokok + tunjanganTetap;
  const masaKerja   = hitungMasaKerja(tglMasuk, tglKeluar);
  const tahun       = masaKerja.tahun;

  const bulanPesangon = getMultiplierPesangon(tahun);
  const bulanUPMK     = getMultiplierUPMK(tahun);

  const uangPesangon  = bulanPesangon * upahAcuan;
  const uangUPMK      = bulanUPMK     * upahAcuan;

  // Uang Penggantian Hak (perumahan & pengobatan = 15% dari pesangon + UPMK)
  const uangPenggantian = Math.round((uangPesangon + uangUPMK) * 0.15);

  const totalSebelumPPh = uangPesangon + uangUPMK + uangPenggantian;
  const pphFinal        = hitungPPhPesangon(totalSebelumPPh);
  const totalTerima     = totalSebelumPPh - pphFinal;

  return {
    masaKerjaTahun:  tahun,
    masaKerjaBulan:  masaKerja.totalBulan,
    upahAcuan,
    // Komponen
    bulanPesangon,
    uangPesangon,
    bulanUPMK,
    uangUPMK,
    uangPenggantian,
    // Total
    totalSebelumPPh,
    pphFinal,
    totalTerima,
    alasanPHK,
  };
}
