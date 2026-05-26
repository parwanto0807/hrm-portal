/**
 * PPh 21 Calculator — Kalkulator Pajak Penghasilan Pasal 21
 *
 * Dasar Hukum:
 *   - PMK No. 168/PMK.03/2023 (berlaku 1 Januari 2024)
 *   - Metode Tarif Efektif Rata-rata (TER)
 *
 * Kategori TER berdasarkan PTKP:
 *   Kategori A : TK/0 dan TK/1
 *   Kategori B : TK/2, TK/3, K/0
 *   Kategori C : K/1, K/2, K/3
 *
 * Mekanisme Pemotongan:
 *   Bulan Jan - Nov : PPh21 = Penghasilan Bruto Bulanan × Tarif TER
 *   Bulan Desember  : Hitung ulang setahun dengan tarif progresif,
 *                     kurangi PPh yang sudah dipotong Jan-Nov
 *
 * Tarif Progresif (UU HPP No. 7/2021):
 *   s.d. Rp 60 juta          : 5%
 *   Rp 60 juta - 250 juta    : 15%
 *   Rp 250 juta - 500 juta   : 25%
 *   Rp 500 juta - 5 miliar   : 30%
 *   Di atas Rp 5 miliar      : 35%
 *
 * PTKP 2024:
 *   TK/0 (lajang)       : Rp 54.000.000
 *   +istri               : Rp 4.500.000
 *   +tanggungan (maks 3) : Rp 4.500.000 each
 */

/** Tarif progresif PPh 21 sesuai UU HPP */
const TARIF_PROGRESIF = [
  { batas: 60_000_000,        tarif: 0.05  },
  { batas: 250_000_000,       tarif: 0.15  },
  { batas: 500_000_000,       tarif: 0.25  },
  { batas: 5_000_000_000,     tarif: 0.30  },
  { batas: Infinity,           tarif: 0.35  },
];

/**
 * Tentukan kategori TER berdasarkan kode PTKP dan status pernikahan
 * @param {string} typePtkp - contoh: 'TK/0', 'K/1', 'K/3', dll
 * @returns {'A'|'B'|'C'}
 */
export function getKategoriTER(typePtkp) {
  if (!typePtkp) return 'A';
  const kode = typePtkp.toUpperCase().trim();
  if (kode === 'TK/0' || kode === 'TK/1') return 'A';
  if (kode === 'TK/2' || kode === 'TK/3' || kode === 'K/0') return 'B';
  if (kode === 'K/1'  || kode === 'K/2'  || kode === 'K/3') return 'C';
  // fallback berdasarkan prefix
  if (kode.startsWith('TK')) return 'A';
  if (kode.startsWith('K')) return 'C';
  return 'A';
}

/**
 * Hitung PTKP tahunan berdasarkan kode PTKP
 * @param {string} typePtkp - 'TK/0', 'K/1', dst
 * @returns {number} PTKP tahunan dalam rupiah
 */
export function hitungPtkp(typePtkp) {
  const PTKP_WP      = 54_000_000; // wajib pajak sendiri
  const PTKP_KAWIN   = 4_500_000;  // tambahan kawin
  const PTKP_TANG    = 4_500_000;  // per tanggungan (maks 3)

  if (!typePtkp) return PTKP_WP;
  const kode = typePtkp.toUpperCase().trim();

  const isKawin   = kode.startsWith('K');
  const jumlahTang = parseInt(kode.split('/')[1] || '0', 10);

  let ptkp = PTKP_WP;
  if (isKawin) ptkp += PTKP_KAWIN;
  ptkp += Math.min(jumlahTang, 3) * PTKP_TANG;

  return ptkp;
}

/**
 * Hitung PPh 21 dengan tarif progresif (digunakan untuk bulan Desember)
 * @param {number} pkp - Penghasilan Kena Pajak setahun
 * @returns {number} PPh 21 setahun
 */
export function hitungProgresif(pkp) {
  if (pkp <= 0) return 0;
  let pph = 0;
  let sisaPkp = pkp;
  let batasBawah = 0;

  for (const layer of TARIF_PROGRESIF) {
    if (sisaPkp <= 0) break;
    const kenaLayer = Math.min(sisaPkp, layer.batas - batasBawah);
    pph += kenaLayer * layer.tarif;
    sisaPkp -= kenaLayer;
    batasBawah = layer.batas;
  }

  return Math.round(pph);
}

/**
 * Cari tarif TER dari array rows database (tabel tarif_ter)
 * @param {Array}  tarifRows - Array rows dari db.tarif_ter
 * @param {string} kategori  - 'A', 'B', atau 'C'
 * @param {number} penghasilan - penghasilan bruto bulanan
 * @returns {number} tarif dalam persen (misal 5.0)
 */
export function cariTarifTER(tarifRows, kategori, penghasilan) {
  if (!tarifRows || tarifRows.length === 0) return 0;

  const rows = tarifRows.filter(
    r => r.kategori === kategori && r.isActive
  );

  for (const row of rows) {
    const min = Number(row.batasMin);
    const max = Number(row.batasMax); // 0 = tidak terbatas (infinity)
    if (penghasilan >= min && (max === 0 || penghasilan <= max)) {
      return Number(row.tarif);
    }
  }
  return 0;
}

/**
 * Hitung PPh 21 Metode TER untuk bulan Jan–Nov
 * @param {object} params
 * @param {number} params.penghasilanBruto  - Total penghasilan bruto bulan ini
 * @param {string} params.typePtkp          - Kode PTKP karyawan (misal 'K/2')
 * @param {Array}  params.tarifTERRows      - Rows dari tabel tarif_ter
 * @param {boolean} params.punya_npwp       - Status NPWP (tanpa NPWP = tarif +20%)
 * @returns {object} { pph21, tarifTER, kategori }
 */
export function hitungPph21TER({ penghasilanBruto, typePtkp, tarifTERRows, punya_npwp = true }) {
  const kategori  = getKategoriTER(typePtkp);
  const tarifPct  = cariTarifTER(tarifTERRows, kategori, penghasilanBruto);

  let pph21 = Math.round(penghasilanBruto * tarifPct / 100);

  // Karyawan tanpa NPWP: tarif lebih tinggi 20% dari tarif normal
  if (!punya_npwp) {
    pph21 = Math.round(pph21 * 1.2);
  }

  return { pph21, tarifTER: tarifPct, kategori };
}

/**
 * Hitung PPh 21 Bulan Desember (rekonsiliasi setahun)
 * @param {object} params
 * @param {number} params.totalBrutoSetahun  - Total penghasilan bruto Jan–Des
 * @param {string} params.typePtkp           - Kode PTKP
 * @param {number} params.sudahDipotong      - Total PPh yang sudah dipotong Jan–Nov
 * @param {number} params.biayaJabatan       - Biaya jabatan (5% dari bruto, maks Rp 500.000/bln)
 * @param {boolean} params.punya_npwp
 * @returns {object} { pph21Des, pkp, ptkp, nettoBruto, pphSetahun }
 */
export function hitungPph21Desember({
  totalBrutoSetahun,
  typePtkp,
  sudahDipotong = 0,
  biayaJabatan = 0,
  punya_npwp = true,
}) {
  const ptkp = hitungPtkp(typePtkp);

  // Biaya jabatan: 5% dari penghasilan bruto, maks Rp 6.000.000/tahun
  const biayaJbtSetahun = Math.min(biayaJabatan, 6_000_000);

  const nettoSetahun = totalBrutoSetahun - biayaJbtSetahun;
  const pkp = Math.max(nettoSetahun - ptkp, 0);
  // Bulatkan PKP ke ribuan ke bawah
  const pkpBulat = Math.floor(pkp / 1000) * 1000;

  let pphSetahun = hitungProgresif(pkpBulat);
  if (!punya_npwp) pphSetahun = Math.round(pphSetahun * 1.2);

  const pph21Des = Math.max(pphSetahun - sudahDipotong, 0);

  return {
    pph21Des,
    pphSetahun,
    pkp: pkpBulat,
    ptkp,
    nettoSetahun,
    biayaJbtSetahun,
  };
}

/**
 * Hitung biaya jabatan bulanan
 * @param {number} penghasilanBruto - Penghasilan bruto bulan ini
 * @returns {number} biaya jabatan bulan ini (maks Rp 500.000)
 */
export function hitungBiayaJabatan(penghasilanBruto) {
  return Math.min(penghasilanBruto * 0.05, 500_000);
}
