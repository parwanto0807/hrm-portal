# Laporan Implementasi Payroll Engine (Backend + Frontend Sprint 1)

**Status:** Selesai (Backend + Frontend Sprint 1)
**Tanggal:** 27 Mei 2026

Semua komponen Payroll Engine backend telah berhasil dibuat. Sprint 1 Frontend (halaman kalkulasi, konfigurasi, tarif) juga selesai.

## 1. Database Schema (Prisma)
- ✅ Menambahkan model `TarifTER` (PMK 168/2023)
- ✅ Menambahkan model `KonfigBpjs` (PP 44-45/2015, Perpres 75/2019)
- ✅ Menambahkan model `SkalaUpah` (Permenaker 5/2023)
- ✅ Menambahkan model `PayrollLog` untuk audit trail (immutable log)
- ✅ Menambahkan model terkait performa dan SP (`KpiTemplate`, `KpiEmployee`, `SuratPeringatan`)
- ✅ Melakukan migrasi database dan generate Prisma client.

## 2. Core Service Kalkulasi (`src/services/`)
- ✅ **`overtimeCalculator.js`**: Kalkulasi lembur 1.5x, 2x, 3x, 4x sesuai **Permenaker 102/2004** membedakan tipe hari kerja (5 atau 6 hari).
- ✅ **`bpjsCalculator.js`**: Kalkulasi JHT, JKK, JKM, JP, dan JKN dengan validasi batas atas (maks upah JP & JKN) dan batas bawah (UMK).
- ✅ **`pphCalculator.js`**: Kalkulasi **PPh 21 metode TER terbaru 2024 (PMK 168/2023)** untuk bulan Jan-Nov, dan progresif untuk rekonsiliasi Desember.
- ✅ **`thrPesangonCalculator.js`**: Kalkulasi proporsional THR (PP 6/2016) dan Pesangon + UPMK (UU Cipta Kerja).
- ✅ **`payrollEngine.js`**: Core orchestrator yang menggabungkan pro-rata upah, lembur, PPh, BPJS, pinjaman, dsb dalam satu *batch run*. Menyimpan hasil final langsung ke `Gaji` dan `PayrollLog`.

## 3. Controller & Routes (`src/controllers/` & `src/routes/`)
- ✅ Meng-upgrade endpoint `/api/payroll/periods` yang lama, mengganti logika placeholder *copy paste* dengan panggilan `runPayrollForPeriode` dari engine.
- ✅ Menambahkan 7 endpoint baru:
  - `POST /periods/:id/calculate` (Kalkulasi batch)
  - `GET /periods/:id/preview/:emplId` (Preview slip sebelum disimpan)
  - `POST /periods/:id/close` & `reopen` (Kunci/buka periode)
  - `GET & POST /config/bpjs` (Master data BPJS)
  - `GET /config/tarif-ter` (Master data pajak TER)
  - `GET /log/:periodeId` (Audit trail histori perubahan)

## 4. Master Data Seeders
- ✅ Menjalankan `seed-tarif-ter.js`: Mengisi 113 baris tarif pajak TER kategori A, B, C untuk tahun 2024 dan 2025.
- ✅ Menjalankan `seed-konfig-bpjs.js`: Membuat rate standar default BPJS untuk perusahaan yang terdaftar.

## 5. Frontend Sprint 1 — SELESAI (27 Mei 2026)

### Komponen Baru
- ✅ **`PayrollCalculatePanel.tsx`** — Tombol "Run Payroll" + progress bar + hasil batch (berhasil/gagal) + error list + modal preview individual
- ✅ **`PayrollPreviewSlip.tsx`** — Detail kalkulasi satu karyawan: pendapatan, potongan, BPJS, PPh 21, validasi warning
- ✅ **`PayrollAuditLog.tsx`** — Timeline audit trail dengan action badge, user, IP, timestamp, before/after diff

### Halaman Baru
- ✅ **`/dashboard/settings/master/bpjs-config`** — CRUD konfigurasi BPJS dengan rate JHT/JKK/JKM/JP/JKN, batas atas upah, berlaku mulai
- ✅ **`/dashboard/settings/master/tarif-pph`** — Tabel 113 tarif TER PPh 21 (PMK 168/2023) per kategori A/B/C, filter tahun

### Halaman Diupgrade
- ✅ **`/dashboard/payroll/[id]`** — Ditambah 3-tab layout:
  - Tab **"Detail Gaji"**: tabel existing karyawan + filter
  - Tab **"Kalkulasi & Aksi"**: PayrollCalculatePanel (Run Payroll, Closing, Reopen)
  - Tab **"Audit Log"**: PayrollAuditLog timeline

### Types TypeScript
- ✅ Update `types/payroll.ts`: tambah `PayrollLog`, `KonfigBpjs`, `TarifTER`, `PayrollPreviewResult`, `PayrollCalculateResult`

---

## Langkah Selanjutnya (Sprint 2)

1. **Rekap Laporan Payroll** (`/dashboard/reports/payroll-summary`) — Export Excel per periode/departemen
2. **UI Struktur Skala Upah** (`/dashboard/settings/master/skala-upah`) — CRUD + validasi UMK
3. **Laporan Absensi** (`/dashboard/reports/attendance-summary`)
4. **Monitor Kontrak PKWT** (`/dashboard/employees/contracts`)

