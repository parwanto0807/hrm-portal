/**
 * Seeder: Konfigurasi BPJS Default
 * Jalankan: node scripts/seed-konfig-bpjs.js [KD_CMPY]
 *
 * Jika KD_CMPY tidak diisi, seeder akan mengambil semua perusahaan dari database.
 *
 * Rate berdasarkan:
 *   - PP No. 44/2015 (JHT)
 *   - PP No. 45/2015 (JP / Jaminan Pensiun)
 *   - Permenaker 26/2015 (JKK, JKM)
 *   - Perpres No. 75/2019 (JKN / BPJS Kesehatan)
 *   - Batas atas JP 2024: Rp 10.043.950
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** Rate BPJS default 2024 */
const RATE_DEFAULT = {
  jhtComp:    3.70,   // JHT ditanggung perusahaan
  jhtEmpl:    2.00,   // JHT dipotong karyawan
  jkkComp:    0.24,   // JKK (risiko sedang) — bisa 0.24 s.d. 1.74%
  jkmComp:    0.30,   // JKM ditanggung perusahaan
  jpComp:     2.00,   // JP ditanggung perusahaan
  jpEmpl:     1.00,   // JP dipotong karyawan
  jpMaxWage:  10_043_950, // Batas atas upah dasar JP 2024
  jknComp:    4.00,   // BPJS Kesehatan ditanggung perusahaan
  jknEmpl:    1.00,   // BPJS Kesehatan dipotong karyawan
  jknMaxWage: 12_000_000, // Batas atas iuran BPJS Kesehatan
};

async function main() {
  const argKdCmpy = process.argv[2]; // opsional: node seed-konfig-bpjs.js BLJ

  // Ambil daftar perusahaan
  const companies = await prisma.company.findMany({
    where: argKdCmpy ? { kodeCmpy: argKdCmpy } : {},
    select: { kodeCmpy: true, company: true },
  });

  if (companies.length === 0) {
    console.log('❌ Tidak ada perusahaan ditemukan. Pastikan data company sudah ada.');
    return;
  }

  console.log(`🌱 Seeding KonfigBpjs untuk ${companies.length} perusahaan...\n`);

  const validDate = new Date('2024-01-01');

  for (const cmp of companies) {
    // Cek apakah sudah ada
    const exists = await prisma.konfigBpjs.findUnique({
      where: { konfig_bpjs_unique: { kdCmpy: cmp.kodeCmpy, validDate } },
    });

    if (exists) {
      console.log(`  ⏭️  KonfigBpjs ${cmp.kodeCmpy} (${cmp.company}) sudah ada — dilewati`);
      continue;
    }

    await prisma.konfigBpjs.create({
      data: {
        kdCmpy:     cmp.kodeCmpy,
        validDate,
        ...RATE_DEFAULT,
        isActive:   true,
      },
    });

    console.log(`  ✅ KonfigBpjs ${cmp.kodeCmpy} (${cmp.company}) berhasil dibuat`);
  }

  console.log('\n✅ Seeder KonfigBpjs selesai!');
  console.log('\n💡 Catatan: Rate JKK default adalah 0.24% (risiko sedang).');
  console.log('   Sesuaikan dengan risiko pekerjaan perusahaan Anda:');
  console.log('   - Risiko sangat rendah: 0.24%');
  console.log('   - Risiko rendah       : 0.54%');
  console.log('   - Risiko sedang       : 0.89%');
  console.log('   - Risiko tinggi       : 1.27%');
  console.log('   - Risiko sangat tinggi: 1.74%');
}

main()
  .catch(e => { console.error('❌ Seeder error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
