# 🏢 Analisa HRM Portal — Kesiapan Profesional & Kepatuhan Hukum Ketenagakerjaan Indonesia

> **Tanggal Analisa:** 27 Mei 2026 (Update)
> **Tech Stack:** Next.js (Frontend) + Express.js + Prisma + PostgreSQL (Backend)
> **Regulasi Acuan:** UU No. 13/2003 jo. UU Cipta Kerja No. 11/2020, PP No. 36/2021 (Pengupahan), PMK No. 168/2023 (PPh 21 TER), Permenaker 5/2023 (Struktur Skala Upah)

---

## 📊 Inventaris Fitur yang SUDAH Ada

| Modul | Status | Keterangan |
|-------|--------|------------|
| Autentikasi (JWT + Google OAuth) | ✅ Ada | Multi-role: SUPER_ADMIN, ADMIN, HR_MANAGER, DEPT_MANAGER, EMPLOYEE |
| Master Data (Company, Bagian, Dept, Jabatan, Agama, Pendidikan) | ✅ Ada | Cukup lengkap |
| Data Karyawan (Biodata, Keluarga, Pendidikan, Riwayat Kerja) | ✅ Ada | Schema sangat lengkap |
| Kontrak Karyawan | ✅ Ada | Model `Kontrak` ada, UI belum lengkap |
| Absensi / Kehadiran | ✅ Ada | Model `Absent`, `AttLog`, integrasi mesin absensi |
| Shift & Jadwal Kerja | ✅ Ada | Model `JnsJam`, `GroupShift`, `ShiftPattern`, `Dshift` |
| Lembur | ✅ Ada | Model `Lembur` dengan detail per hari |
| Cuti | ✅ Sebagian | Model `Dcuti`, `Hcuti`, `JnsCuti` ada, approval flow ada |
| Payroll / Gaji (View & Slip) | ✅ Ada | Model `Gaji` sangat lengkap + **kalkulasi otomatis SUDAH ADA** ✅ |
| **Engine Kalkulasi Payroll** | ✅ **SELESAI** | `payrollEngine.js` — orchestrator lengkap |
| **PPh 21 Metode TER (PMK 168/2023)** | ✅ **SELESAI** | `pphCalculator.js` — TER Jan-Nov + progresif Des |
| **BPJS TK & Kesehatan** | ✅ **SELESAI** | `bpjsCalculator.js` — JHT, JKK, JKM, JP, JKN + batas atas/bawah |
| **Kalkulator Lembur** | ✅ **SELESAI** | `overtimeCalculator.js` — Permenaker 102/2004 lengkap |
| **THR & Pesangon** | ✅ **SELESAI** | `thrPesangonCalculator.js` — PP 6/2016 + UU Cipta Kerja |
| **Model TarifTER** | ✅ **SELESAI** | 113 baris tarif pajak 2024-2025 (kategori A/B/C) sudah di-seed |
| **Model KonfigBpjs** | ✅ **SELESAI** | Rate default BPJS sudah di-seed |
| **Model SkalaUpah** | ✅ **SELESAI** | Schema & model sudah ada di Prisma |
| **Model PayrollLog** | ✅ **SELESAI** | Audit trail immutable sudah ada |
| **Model KpiTemplate & KpiEmployee** | ✅ **SELESAI** | Schema penilaian kinerja sudah ada |
| **Model SuratPeringatan** | ✅ **SELESAI** | Schema disiplin/SP sudah ada |
| API Payroll Engine (7 endpoint baru) | ✅ **SELESAI** | `calculate`, `preview`, `close`, `reopen`, BPJS config, TER, log |
| PPh 21 Tahunan | ✅ Sebagian | Model `PphThn`, `BatasPajak`, `Ptkp` ada |
| Pinjaman Karyawan | ✅ Ada | Model `PinjamHdr`, `PinjamDet` |
| Tunjangan & Potongan | ✅ Ada | Model `Tunjangan`, `Potongan`, `Rapel` |
| Slip Gaji PDF | ✅ Ada | Dengan password (tanggal lahir) |
| Notifikasi | ✅ Ada | Firebase FCM |
| RBAC (Role Based Access) | ✅ Ada | Model `SysPrivilege` |
| Laporan | ⚠️ Stub | Halaman ada tapi kosong |
| Pesangon | ✅ **SELESAI** | Kalkulasi sudah ada di `thrPesangonCalculator.js` |
| Mutasi Karyawan | ⚠️ Sebagian | Model `Mutasi` ada, UI tidak terlihat |
| Kondite / Disiplin | ⚠️ Sebagian | Model `Kondite` ada, SP sudah ada schema-nya |
| Medis / Kesehatan | ⚠️ Sebagian | Model `SaldoMedic`, `MedikTrans` ada |
| **Struktur Skala Upah** | ✅ Schema Ada | Model di Prisma sudah ada, **UI belum** |
| **E-Bukti Potong (1721-A1)** | ❌ Belum | Wajib untuk pelaporan pajak |
| **Pelaporan SPT Masa PPh 21** | ❌ Belum | Kewajiban bulanan perusahaan |
| **Audit Trail / Log Payroll** | ✅ **SELESAI** | `PayrollLog` model + endpoint `/log/:periodeId` |
| **Employee Self Service (ESS)** | ⚠️ Sebagian | Check-in ada, pengajuan ada |
| **Penilaian Kinerja (KPI/SKP)** | ✅ Schema Ada | Model ada di Prisma, **UI & logik belum** |

---

## ✅ TAHAP BACKEND — SELESAI (27 Mei 2026)

Semua komponen kritis backend Payroll Engine telah berhasil diimplementasikan:

### Yang Sudah Selesai (Backend)
| File | Deskripsi | Regulasi |
|------|-----------|----------|
| `services/payrollEngine.js` | Core orchestrator batch run payroll | — |
| `services/pphCalculator.js` | PPh 21 TER (Jan-Nov) + progresif (Des) | PMK 168/2023 |
| `services/bpjsCalculator.js` | JHT, JKK, JKM, JP, JKN + batas atas/bawah | PP 44-45/2015, Perpres 75/2019 |
| `services/overtimeCalculator.js` | Lembur 1.5x, 2x, 3x, 4x | Permenaker 102/2004 |
| `services/thrPesangonCalculator.js` | THR proporsional + Pesangon + UPMK | PP 6/2016 + UU Cipta Kerja |
| `controllers/payrollController.js` | 7 endpoint baru, mengganti placeholder | — |
| `routes/payrollRoutes.js` | Route semua endpoint payroll engine | — |
| `scripts/seed-tarif-ter.js` | 113 tarif TER kategori A/B/C (2024-2025) | PMK 168/2023 |
| `scripts/seed-konfig-bpjs.js` | Rate default BPJS | PP 44-45/2015 |
| `prisma/schema.prisma` | Model: TarifTER, KonfigBpjs, SkalaUpah, PayrollLog, KpiTemplate, KpiEmployee, SuratPeringatan | — |

### Endpoint API Baru
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `POST` | `/api/payroll/periods/:id/calculate` | Run payroll batch semua karyawan |
| `GET` | `/api/payroll/periods/:id/preview/:emplId` | Preview kalkulasi 1 karyawan |
| `POST` | `/api/payroll/periods/:id/close` | Kunci periode (immutable) |
| `POST` | `/api/payroll/periods/:id/reopen` | Buka kembali (SUPER_ADMIN only) |
| `GET` | `/api/payroll/config/bpjs` | Ambil konfigurasi BPJS |
| `POST` | `/api/payroll/config/bpjs` | Simpan konfigurasi BPJS |
| `GET` | `/api/payroll/config/tarif-ter` | Ambil tarif TER PPh 21 |
| `GET` | `/api/payroll/log/:periodeId` | Histori audit payroll |

---

## 🚨 GAP YANG MASIH ADA — Tahap Frontend & Pengembangan Lanjutan

### 🔴 PRIORITAS 1 — FRONTEND PAYROLL (Segera / Sprint Berikutnya)

#### 1. Halaman Kalkulasi Payroll — `dashboard/payroll/calculate`
Backend sudah siap, tinggal sambungkan UI:
- Tombol **"Run Payroll"** → POST `/periods/:id/calculate`
- Progress bar / notifikasi per karyawan (sukses/gagal)
- Tampilan summary: total gaji bruto, total potongan, total bersih
- Status badge: `DRAFT` → `PROCESSED` → `CLOSED`

#### 2. Preview Slip Gaji Sebelum Closing — `dashboard/payroll/[id]/preview`
- Tabel detail kalkulasi per karyawan sebelum close
- Rincian: Upah Pokok, Pro-Rata, Lembur, THR, BPJS (perusahaan + karyawan), PPh 21
- Tombol **"Close Period"** setelah review
- Export ke PDF per karyawan

#### 3. Halaman Detail Periode Payroll — upgrade `dashboard/payroll/[id]`
- Daftar semua karyawan dalam periode dengan status kalkulasi
- Filter by departemen/status
- Preview individual per karyawan
- Audit log perubahan (sambungkan ke `/log/:periodeId`)

---

### 🟡 PRIORITAS 2 — MASTER DATA & KONFIGURASI (1-2 sprint)

#### 4. UI Konfigurasi BPJS — `dashboard/settings/master/bpjs-config`
- Form untuk edit rate JHT, JKK, JKM, JP, JKN (perusahaan & karyawan)
- Edit batas atas upah JP & JKN
- Mulai berlaku (validDate)
- Sambungkan ke `GET/POST /api/payroll/config/bpjs`

#### 5. UI Tarif TER PPh 21 — `dashboard/settings/master/tarif-pph`
- Tabel read-only 113 baris tarif A/B/C
- Filter by kategori & tahun
- Sambungkan ke `GET /api/payroll/config/tarif-ter`
- Info regulasi: PMK 168/2023

#### 6. UI Struktur Skala Upah — `dashboard/settings/master/skala-upah`
- CRUD tabel SkalaUpah (jabatan → golongan → upah min/mid/max)
- Validasi: `upahMin ≥ UMK`, `upahMin < upahMid < upahMax`
- Alert merah jika karyawan aktif berupah di bawah skala
- Import dari Excel

---

### 🟡 PRIORITAS 2 — LAPORAN (1-2 sprint)

#### 7. Rekap Payroll per Periode — `dashboard/reports/payroll-summary`
- Total gaji per departemen
- Breakdown: gaji pokok, lembur, tunjangan, BPJS, PPh, net
- Export Excel (format transfer bank massal)
- Grafik trend gaji bulanan

#### 8. Laporan Absensi Bulanan — `dashboard/reports/attendance-summary`
- Rekap hadir, mangkir, terlambat, lembur per karyawan
- Export Excel/PDF
- Filter by departemen & periode

#### 9. Bukti Potong PPh 21 (Form 1721-A1)
- Generate PDF sesuai format DJP per karyawan per tahun
- Kirim otomatis via email
- Simpan sebagai record `PphThn`

---

### 🟢 PRIORITAS 3 — PENGEMBANGAN LANJUTAN (3-6 bulan)

#### 10. Penilaian Kinerja (KPI)
Schema `KpiTemplate` dan `KpiEmployee` sudah ada di Prisma, tinggal:
- UI template KPI per jabatan
- Form penilaian per karyawan per periode
- Dashboard skor KPI dengan radar chart
- Integrasi ke kalkulasi bonus/insentif payroll

#### 11. Manajemen Disiplin & SP (Surat Peringatan)
Schema `SuratPeringatan` sudah ada, tinggal:
- Form SP 1, SP 2, SP 3 dengan approval workflow
- Tracking kondite per karyawan
- Alert eskalasi otomatis
- Link ke proses PHK

#### 12. Monitor Kontrak PKWT — `dashboard/employees/contracts`
- Dashboard kontrak yang akan berakhir (30 hari, 7 hari)
- Alert otomatis via notifikasi FCM
- Validasi: PKWT max 5 tahun total (UU Cipta Kerja)
- Tombol perpanjang / konversi ke PKWTT
- Generate surat kontrak PDF

#### 13. Employee Self Service (ESS) Lengkap
- Lihat & download slip gaji sendiri ✅ (sudah ada sebagian)
- Pengajuan lembur online
- Update data pribadi mandiri
- Lihat saldo cuti & histori
- Download Bukti Potong 1721-A1

#### 14. Integrasi Laporan Pajak
- Generate file CSV untuk e-SPT DJP Online
- Format SPT Masa PPh 21 (bulanan)
- Rekap tahunan untuk SPT Tahunan Badan

#### 15. Cuti Tahunan (Auto-generate)
- Auto-generate saldo cuti saat ulang tahun masuk kerja
- Mekanisme cuti kadaluwarsa (max 1 tahun)
- Laporan saldo cuti konsolidasi per divisi

---

## 📐 ARSITEKTUR YANG SUDAH TERBANGUN

```
┌─────────────────────────────────────────────────────────────┐
│                    PAYROLL ENGINE ✅                          │
│                  backend/src/services/                       │
├──────────────┬───────────────┬──────────────┬───────────────┤
│  Attendance  │   Overtime    │     BPJS     │   PPh 21     │
│  Calculator  │  Calculator   │  Calculator  │  (TER) ✅    │
│  (Pro-rata)  │  (Per. 102)✅ │  (PP 44/45)✅│ (PMK 168)   │
├──────────────┴───────────────┴──────────────┴───────────────┤
│         THR Calculator (PP 6/2016)        ✅                │
│         Pesangon Calculator (UU Cipta Kerja) ✅             │
├─────────────────────────────────────────────────────────────┤
│              Deduction Aggregator          ✅                │
│    (Pinjaman + Koperasi + Absensi + BPJS + PPh21)          │
├─────────────────────────────────────────────────────────────┤
│       Net Salary = Gross Income - Total Deductions  ✅      │
├─────────────────────────────────────────────────────────────┤
│             PayrollLog (Audit Trail)       ✅                │
│             Locking Periode (tutup/reopen) ✅                │
└─────────────────────────────────────────────────────────────┘

                           ↕  REST API  ✅

┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                          │
├──────────────┬───────────────┬──────────────┬───────────────┤
│   Payroll    │   Master      │   Laporan    │     ESS       │
│   Calculate  │   BPJS Config │   Payroll    │   Self Svc    │
│   ❌ Belum   │   ❌ Belum    │   ❌ Belum   │   ⚠️ Sebagian │
│   Preview    │   Tarif TER   │   Absensi    │   KPI         │
│   ❌ Belum   │   ❌ Belum    │   ❌ Belum   │   ❌ Belum    │
│   Slip Gaji  │   Skala Upah  │  1721-A1 PDF │   Kontrak     │
│   ⚠️ Sebagian│   ❌ Belum    │   ❌ Belum   │   ❌ Belum    │
└──────────────┴───────────────┴──────────────┴───────────────┘
```

---

## 🗂️ PETA JALAN IMPLEMENTASI (Roadmap)

### ✅ Sprint 0 — SELESAI (27 Mei 2026)
- [x] Payroll Engine + semua kalkulator service
- [x] PPh 21 TER (PMK 168/2023)
- [x] BPJS Calculator + batas atas/bawah
- [x] Overtime Calculator (Permenaker 102/2004)
- [x] THR + Pesangon Calculator
- [x] 7 endpoint API baru
- [x] Master data seed (TarifTER 113 baris + KonfigBpjs)
- [x] Prisma schema: TarifTER, KonfigBpjs, SkalaUpah, PayrollLog, KpiTemplate, KpiEmployee, SuratPeringatan

### 🔴 Sprint 1 — BERIKUTNYA (Target: 1-2 minggu)
- [ ] **Halaman Calculate Payroll** (`/dashboard/payroll/calculate`) — tombol Run + progress
- [ ] **Halaman Preview Slip** (`/dashboard/payroll/[id]/preview`) — rincian kalkulasi per karyawan
- [ ] **Upgrade halaman periode** (`/dashboard/payroll/[id]`) — daftar karyawan + status
- [ ] **UI Konfigurasi BPJS** (`/dashboard/settings/master/bpjs-config`)
- [ ] **UI Tarif TER** (`/dashboard/settings/master/tarif-pph`) — tabel read-only

### 🟡 Sprint 2 — (Target: 2-4 minggu)
- [ ] **UI Struktur Skala Upah** (`/dashboard/settings/master/skala-upah`) — CRUD + validasi UMK
- [ ] **Rekap Payroll** (`/dashboard/reports/payroll-summary`) — export Excel
- [ ] **Laporan Absensi** (`/dashboard/reports/attendance-summary`)
- [ ] **Monitor Kontrak PKWT** (`/dashboard/employees/contracts`)

### 🟢 Sprint 3 — (Target: 3-6 bulan)
- [ ] Penilaian Kinerja (KPI) — UI + logik
- [ ] Manajemen SP (Surat Peringatan)
- [ ] Bukti Potong 1721-A1 PDF generator
- [ ] ESS Lengkap (lembur online, update data pribadi)
- [ ] Integrasi e-SPT DJP

---

## ⚖️ RISIKO HUKUM — STATUS TERKINI

| Risiko | Regulasi | Sanksi | Status |
|--------|----------|--------|--------|
| Gaji di bawah UMK | PP 36/2021 Ps. 23 | Pidana 1-4 tahun / denda Rp 100-400 juta | ✅ Validasi ada di engine |
| Tidak mendaftarkan BPJS | UU BPJS 24/2011 | Denda + pidana | ✅ BPJS Calculator + Konfig |
| PPh 21 salah hitung/metode | PMK 168/2023 | Bunga 2%/bulan + denda | ✅ TER sudah diimplementasi |
| Tidak bayar THR | PP 6/2016 | Denda 5% total THR | ✅ THR Calculator sudah ada |
| PKWT melebihi 5 tahun | UU Cipta Kerja Ps. 56 | Berubah jadi PKWTT | ❌ Monitor kontrak belum ada |
| Tidak membuat skala upah | Permenaker 5/2023 | Sanksi administratif | ⚠️ Schema ada, UI belum |
| Lembur tidak dibayar sesuai ketentuan | Permenaker 102/2004 | Tuntutan pidana + denda | ✅ Overtime Calculator sudah ada |

---

## 💡 REKOMENDASI TEKNIS — CATATAN PENTING

1. **✅ Locking Payroll Period** — Sudah ada via `close`/`reopen` endpoint + middleware check `tutup`.

2. **⚠️ Batch Processing** — Kalkulasi payroll saat ini synchronous. Untuk >100 karyawan, pertimbangkan background job dengan `Bull`/`BullMQ` atau `node-cron`.

3. **✅ Audit Log Payroll** — `PayrollLog` sudah immutable, endpoint `/log/:periodeId` sudah tersedia.

4. **✅ Multi-Company Support** — Schema `kdCmpy` sudah ada, kalkulasi sudah menghormati parameter per perusahaan.

5. **✅ Data Validation** — Validasi karyawan aktif, upah ≥ UMK sudah ada di engine sebelum proses payroll.

6. **❌ Rekonsiliasi Transfer Bank** — Bandingkan total transfer bank vs total `gBersih` per periode. Belum ada.

7. **❌ Enkripsi Data Sensitif** — Nomor rekening, NPWP, data gaji sebaiknya dienkripsi at-rest.

8. **✅ Rate Limiter Endpoint Payroll** — Proses payroll sudah dilindungi oleh pengecekan status periode (`tutup`).

---

*Dokumen ini terakhir diperbarui: 27 Mei 2026 — Mencerminkan status setelah selesainya Tahap Backend Payroll Engine.*
