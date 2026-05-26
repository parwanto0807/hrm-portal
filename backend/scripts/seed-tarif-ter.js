/**
 * Seeder: Data Tarif TER PPh 21
 * Sumber: PMK No. 168/PMK.03/2023 (berlaku 1 Januari 2024)
 *
 * Jalankan: node scripts/seed-tarif-ter.js
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Data Tarif TER 2024 sesuai Lampiran PMK 168/2023
 * Tarif dalam % (persen)
 * batasMax = 0 berarti tidak ada batas atas (infinity)
 *
 * KATEGORI A : TK/0 dan TK/1
 * KATEGORI B : TK/2, TK/3, K/0
 * KATEGORI C : K/1, K/2, K/3
 */
const TARIF_TER_2024 = [
  // ── KATEGORI A (TK/0, TK/1) ──────────────────────────────────
  { kategori: 'A', batasMin:          0, batasMax:    5_400_000, tarif: 0 },
  { kategori: 'A', batasMin:  5_400_001, batasMax:    5_650_000, tarif: 0.25 },
  { kategori: 'A', batasMin:  5_650_001, batasMax:    5_950_000, tarif: 0.50 },
  { kategori: 'A', batasMin:  5_950_001, batasMax:    6_300_000, tarif: 0.75 },
  { kategori: 'A', batasMin:  6_300_001, batasMax:    6_750_000, tarif: 1.00 },
  { kategori: 'A', batasMin:  6_750_001, batasMax:    7_500_000, tarif: 1.25 },
  { kategori: 'A', batasMin:  7_500_001, batasMax:    8_550_000, tarif: 1.50 },
  { kategori: 'A', batasMin:  8_550_001, batasMax:    9_650_000, tarif: 1.75 },
  { kategori: 'A', batasMin:  9_650_001, batasMax:   10_050_000, tarif: 2.00 },
  { kategori: 'A', batasMin: 10_050_001, batasMax:   10_350_000, tarif: 2.25 },
  { kategori: 'A', batasMin: 10_350_001, batasMax:   10_700_000, tarif: 2.50 },
  { kategori: 'A', batasMin: 10_700_001, batasMax:   11_050_000, tarif: 3.00 },
  { kategori: 'A', batasMin: 11_050_001, batasMax:   11_600_000, tarif: 3.50 },
  { kategori: 'A', batasMin: 11_600_001, batasMax:   12_500_000, tarif: 4.00 },
  { kategori: 'A', batasMin: 12_500_001, batasMax:   13_750_000, tarif: 5.00 },
  { kategori: 'A', batasMin: 13_750_001, batasMax:   15_100_000, tarif: 6.00 },
  { kategori: 'A', batasMin: 15_100_001, batasMax:   16_950_000, tarif: 7.00 },
  { kategori: 'A', batasMin: 16_950_001, batasMax:   19_750_000, tarif: 8.00 },
  { kategori: 'A', batasMin: 19_750_001, batasMax:   24_150_000, tarif: 9.00 },
  { kategori: 'A', batasMin: 24_150_001, batasMax:   26_450_000, tarif: 10.00 },
  { kategori: 'A', batasMin: 26_450_001, batasMax:   28_000_000, tarif: 11.00 },
  { kategori: 'A', batasMin: 28_000_001, batasMax:   30_050_000, tarif: 12.00 },
  { kategori: 'A', batasMin: 30_050_001, batasMax:   32_400_000, tarif: 13.00 },
  { kategori: 'A', batasMin: 32_400_001, batasMax:   35_400_000, tarif: 14.00 },
  { kategori: 'A', batasMin: 35_400_001, batasMax:   39_100_000, tarif: 15.00 },
  { kategori: 'A', batasMin: 39_100_001, batasMax:   43_850_000, tarif: 16.00 },
  { kategori: 'A', batasMin: 43_850_001, batasMax:   47_800_000, tarif: 17.00 },
  { kategori: 'A', batasMin: 47_800_001, batasMax:   51_400_000, tarif: 18.00 },
  { kategori: 'A', batasMin: 51_400_001, batasMax:   56_300_000, tarif: 19.00 },
  { kategori: 'A', batasMin: 56_300_001, batasMax:   62_200_000, tarif: 20.00 },
  { kategori: 'A', batasMin: 62_200_001, batasMax:   74_950_000, tarif: 21.00 },
  { kategori: 'A', batasMin: 74_950_001, batasMax:   95_600_000, tarif: 22.00 },
  { kategori: 'A', batasMin: 95_600_001, batasMax:  110_200_000, tarif: 23.00 },
  { kategori: 'A', batasMin:110_200_001, batasMax:  134_600_000, tarif: 24.00 },
  { kategori: 'A', batasMin:134_600_001, batasMax:  157_100_000, tarif: 25.00 },
  { kategori: 'A', batasMin:157_100_001, batasMax:  206_500_000, tarif: 26.00 },
  { kategori: 'A', batasMin:206_500_001, batasMax:  337_100_000, tarif: 27.00 },
  { kategori: 'A', batasMin:337_100_001, batasMax:  454_600_000, tarif: 28.00 },
  { kategori: 'A', batasMin:454_600_001, batasMax:  550_100_000, tarif: 29.00 },
  { kategori: 'A', batasMin:550_100_001, batasMax:          0,   tarif: 30.00 }, // tak terbatas

  // ── KATEGORI B (TK/2, TK/3, K/0) ─────────────────────────────
  { kategori: 'B', batasMin:          0, batasMax:    6_200_000, tarif: 0 },
  { kategori: 'B', batasMin:  6_200_001, batasMax:    6_500_000, tarif: 0.25 },
  { kategori: 'B', batasMin:  6_500_001, batasMax:    6_850_000, tarif: 0.50 },
  { kategori: 'B', batasMin:  6_850_001, batasMax:    7_300_000, tarif: 0.75 },
  { kategori: 'B', batasMin:  7_300_001, batasMax:    9_200_000, tarif: 1.00 },
  { kategori: 'B', batasMin:  9_200_001, batasMax:   10_750_000, tarif: 1.50 },
  { kategori: 'B', batasMin: 10_750_001, batasMax:   11_250_000, tarif: 2.00 },
  { kategori: 'B', batasMin: 11_250_001, batasMax:   11_600_000, tarif: 2.50 },
  { kategori: 'B', batasMin: 11_600_001, batasMax:   12_600_000, tarif: 3.00 },
  { kategori: 'B', batasMin: 12_600_001, batasMax:   13_600_000, tarif: 4.00 },
  { kategori: 'B', batasMin: 13_600_001, batasMax:   14_950_000, tarif: 5.00 },
  { kategori: 'B', batasMin: 14_950_001, batasMax:   16_400_000, tarif: 6.00 },
  { kategori: 'B', batasMin: 16_400_001, batasMax:   18_450_000, tarif: 7.00 },
  { kategori: 'B', batasMin: 18_450_001, batasMax:   21_850_000, tarif: 8.00 },
  { kategori: 'B', batasMin: 21_850_001, batasMax:   26_000_000, tarif: 9.00 },
  { kategori: 'B', batasMin: 26_000_001, batasMax:   27_700_000, tarif: 10.00 },
  { kategori: 'B', batasMin: 27_700_001, batasMax:   29_350_000, tarif: 11.00 },
  { kategori: 'B', batasMin: 29_350_001, batasMax:   31_450_000, tarif: 12.00 },
  { kategori: 'B', batasMin: 31_450_001, batasMax:   33_950_000, tarif: 13.00 },
  { kategori: 'B', batasMin: 33_950_001, batasMax:   37_100_000, tarif: 14.00 },
  { kategori: 'B', batasMin: 37_100_001, batasMax:   41_100_000, tarif: 15.00 },
  { kategori: 'B', batasMin: 41_100_001, batasMax:   45_800_000, tarif: 16.00 },
  { kategori: 'B', batasMin: 45_800_001, batasMax:   49_500_000, tarif: 17.00 },
  { kategori: 'B', batasMin: 49_500_001, batasMax:   53_800_000, tarif: 18.00 },
  { kategori: 'B', batasMin: 53_800_001, batasMax:   58_500_000, tarif: 19.00 },
  { kategori: 'B', batasMin: 58_500_001, batasMax:   64_000_000, tarif: 20.00 },
  { kategori: 'B', batasMin: 64_000_001, batasMax:   71_000_000, tarif: 21.00 },
  { kategori: 'B', batasMin: 71_000_001, batasMax:   80_000_000, tarif: 22.00 },
  { kategori: 'B', batasMin: 80_000_001, batasMax:   96_000_000, tarif: 23.00 },
  { kategori: 'B', batasMin: 96_000_001, batasMax:  124_000_000, tarif: 24.00 },
  { kategori: 'B', batasMin:124_000_001, batasMax:  157_000_000, tarif: 25.00 },
  { kategori: 'B', batasMin:157_000_001, batasMax:  206_000_000, tarif: 26.00 },
  { kategori: 'B', batasMin:206_000_001, batasMax:  337_000_000, tarif: 27.00 },
  { kategori: 'B', batasMin:337_000_001, batasMax:  454_000_000, tarif: 28.00 },
  { kategori: 'B', batasMin:454_000_001, batasMax:  550_000_000, tarif: 29.00 },
  { kategori: 'B', batasMin:550_000_001, batasMax:          0,   tarif: 30.00 },

  // ── KATEGORI C (K/1, K/2, K/3) ────────────────────────────────
  { kategori: 'C', batasMin:          0, batasMax:    6_600_000, tarif: 0 },
  { kategori: 'C', batasMin:  6_600_001, batasMax:    6_950_000, tarif: 0.25 },
  { kategori: 'C', batasMin:  6_950_001, batasMax:    7_350_000, tarif: 0.50 },
  { kategori: 'C', batasMin:  7_350_001, batasMax:    7_800_000, tarif: 0.75 },
  { kategori: 'C', batasMin:  7_800_001, batasMax:    8_850_000, tarif: 1.00 },
  { kategori: 'C', batasMin:  8_850_001, batasMax:    9_800_000, tarif: 1.25 },
  { kategori: 'C', batasMin:  9_800_001, batasMax:   10_950_000, tarif: 1.50 },
  { kategori: 'C', batasMin: 10_950_001, batasMax:   11_200_000, tarif: 1.75 },
  { kategori: 'C', batasMin: 11_200_001, batasMax:   12_050_000, tarif: 2.00 },
  { kategori: 'C', batasMin: 12_050_001, batasMax:   12_950_000, tarif: 3.00 },
  { kategori: 'C', batasMin: 12_950_001, batasMax:   14_150_000, tarif: 4.00 },
  { kategori: 'C', batasMin: 14_150_001, batasMax:   15_550_000, tarif: 5.00 },
  { kategori: 'C', batasMin: 15_550_001, batasMax:   17_050_000, tarif: 6.00 },
  { kategori: 'C', batasMin: 17_050_001, batasMax:   19_500_000, tarif: 7.00 },
  { kategori: 'C', batasMin: 19_500_001, batasMax:   22_700_000, tarif: 8.00 },
  { kategori: 'C', batasMin: 22_700_001, batasMax:   26_600_000, tarif: 9.00 },
  { kategori: 'C', batasMin: 26_600_001, batasMax:   28_100_000, tarif: 10.00 },
  { kategori: 'C', batasMin: 28_100_001, batasMax:   30_100_000, tarif: 11.00 },
  { kategori: 'C', batasMin: 30_100_001, batasMax:   32_600_000, tarif: 12.00 },
  { kategori: 'C', batasMin: 32_600_001, batasMax:   35_400_000, tarif: 13.00 },
  { kategori: 'C', batasMin: 35_400_001, batasMax:   38_900_000, tarif: 14.00 },
  { kategori: 'C', batasMin: 38_900_001, batasMax:   43_000_000, tarif: 15.00 },
  { kategori: 'C', batasMin: 43_000_001, batasMax:   47_400_000, tarif: 16.00 },
  { kategori: 'C', batasMin: 47_400_001, batasMax:   51_200_000, tarif: 17.00 },
  { kategori: 'C', batasMin: 51_200_001, batasMax:   55_800_000, tarif: 18.00 },
  { kategori: 'C', batasMin: 55_800_001, batasMax:   60_400_000, tarif: 19.00 },
  { kategori: 'C', batasMin: 60_400_001, batasMax:   66_700_000, tarif: 20.00 },
  { kategori: 'C', batasMin: 66_700_001, batasMax:   74_500_000, tarif: 21.00 },
  { kategori: 'C', batasMin: 74_500_001, batasMax:   83_200_000, tarif: 22.00 },
  { kategori: 'C', batasMin: 83_200_001, batasMax:   95_600_000, tarif: 23.00 },
  { kategori: 'C', batasMin: 95_600_001, batasMax:  110_000_000, tarif: 24.00 },
  { kategori: 'C', batasMin:110_000_001, batasMax:  134_000_000, tarif: 25.00 },
  { kategori: 'C', batasMin:134_000_001, batasMax:  157_000_000, tarif: 26.00 },
  { kategori: 'C', batasMin:157_000_001, batasMax:  206_000_000, tarif: 27.00 },
  { kategori: 'C', batasMin:206_000_001, batasMax:  337_000_000, tarif: 28.00 },
  { kategori: 'C', batasMin:337_000_001, batasMax:  454_000_000, tarif: 29.00 },
  { kategori: 'C', batasMin:454_000_001, batasMax:          0,   tarif: 30.00 },
];

async function main() {
  console.log('🌱 Seeding Tarif TER PPh 21 2024...');

  const tahun = 2024;
  const data = TARIF_TER_2024.map(row => ({
    kategori:  row.kategori,
    batasMin:  row.batasMin,
    batasMax:  row.batasMax,
    tarif:     row.tarif,
    tahun,
    isActive:  true,
  }));

  // Hapus data lama tahun ini dulu
  await prisma.tarifTER.deleteMany({ where: { tahun } });
  console.log(`  Deleted existing tarif TER tahun ${tahun}`);

  // Insert batch
  await prisma.tarifTER.createMany({ data });
  console.log(`  ✅ ${data.length} baris tarif TER ${tahun} berhasil diinsert`);

  // Copy juga untuk 2025 (rate sama s.d. ada perubahan regulasi)
  const tahun2025 = 2025;
  await prisma.tarifTER.deleteMany({ where: { tahun: tahun2025 } });
  await prisma.tarifTER.createMany({
    data: data.map(d => ({ ...d, tahun: tahun2025 })),
  });
  console.log(`  ✅ ${data.length} baris tarif TER ${tahun2025} berhasil diinsert`);

  console.log('\n✅ Seeder Tarif TER selesai!');
}

main()
  .catch(e => { console.error('❌ Seeder error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
