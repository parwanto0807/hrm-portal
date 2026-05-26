# 🏢 Analisa HRM Portal — Kesiapan Profesional & Kepatuhan Hukum Ketenagakerjaan Indonesia

> **Tanggal Analisa:** 27 Mei 2026  
> **Tech Stack:** Next.js (Frontend) + Express.js + Prisma + PostgreSQL (Backend)  
> **Regulasi Acuan:** UU No. 13/2003 jo. UU Cipta Kerja No. 11/2020, PP No. 36/2021 (Pengupahan), PMK No. 168/2023 (PPh 21 TER), Permenaker 5/2023 (Struktur Skala Upah)

---

## 📊 Inventaris Fitur yang SUDAH Ada

| Modul | Status | Keterangan |
|-------|--------|------------|
| Autentikasi (JWT + Google OAuth) | ✅ Ada | Multi-role: SUPER_ADMIN, ADMIN, HR_MANAGER, DEPT_MANAGER, EMPLOYEE |
| Master Data (Company, Bagian, Dept, Jabatan, Agama, Pendidikan) | ✅ Ada | Cukup lengkap |
| Data Karyawan (Biodata, Keluarga, Pendidikan, Riwayat Kerja) | ✅ Ada | Schema sangat lengkap |
| Kontrak Karyawan | ✅ Ada | Model `Kontrak` ada, UI belum terlihat |
| Absensi / Kehadiran | ✅ Ada | Model `Absent`, `AttLog`, integrasi mesin absensi |
| Shift & Jadwal Kerja | ✅ Ada | Model `JnsJam`, `GroupShift`, `ShiftPattern`, `Dshift` |
| Lembur | ✅ Ada | Model `Lembur` dengan detail per hari |
| Cuti | ✅ Sebagian | Model `Dcuti`, `Hcuti`, `JnsCuti` ada, approval flow ada |
| Payroll / Gaji (View & Slip) | ✅ Sebagian | Model `Gaji` sangat lengkap, tapi **kalkulasi otomatis BELUM ada** |
| PPh 21 Tahunan | ✅ Sebagian | Model `PphThn`, `BatasPajak`, `Ptkp` ada, kalkulasi belum |
| BPJS TK & Kesehatan | ✅ Sebagian | Field tersedia di model Gaji, kalkulasi belum |
| THR | ✅ Sebagian | Field `thr`, `pphThr`, `BatasThr` ada |
| Pinjaman Karyawan | ✅ Ada | Model `PinjamHdr`, `PinjamDet` |
| Tunjangan & Potongan | ✅ Ada | Model `Tunjangan`, `Potongan`, `Rapel` |
| Slip Gaji PDF | ✅ Ada | Dengan password (tanggal lahir) |
| Notifikasi | ✅ Ada | Firebase FCM |
| RBAC (Role Based Access) | ✅ Ada | Model `SysPrivilege` |
| Laporan | ⚠️ Stub | Halaman ada tapi kosong |
| Pesangon | ⚠️ Sebagian | Model `Pesangon` ada, kalkulasi belum |
| Mutasi Karyawan | ⚠️ Sebagian | Model `Mutasi` ada, UI tidak terlihat |
| Kondite / Disiplin | ⚠️ Sebagian | Model `Kondite` ada, UI tidak terlihat |
| Medis / Kesehatan | ⚠️ Sebagian | Model `SaldoMedic`, `MedikTrans` ada |
| **Kalkulasi Payroll Otomatis** | ❌ Belum | Ini yang paling kritis |
| **Struktur Skala Upah** | ❌ Belum | Wajib per Permenaker 5/2023 |
| **E-Bukti Potong (1721-A1)** | ❌ Belum | Wajib untuk pelaporan pajak |
| **Pelaporan SPT Masa PPh 21** | ❌ Belum | Kewajiban bulanan perusahaan |
| **Audit Trail / Log** | ⚠️ Sebagian | `SysEventHistory` ada tapi belum dipakai maksimal |
| **Employee Self Service (ESS)** | ⚠️ Sebagian | Check-in ada, pengajuan ada |
| **Penilaian Kinerja (KPI/SKP)** | ❌ Belum | Belum ada sama sekali |

---

## 🚨 GAP KRITIS — Hukum Ketenagakerjaan Indonesia

### 1. 💰 KALKULASI PAYROLL OTOMATIS (Prioritas TERTINGGI)

**Masalah saat ini:**  
Di `payrollController.js` baris 113-123, pembuatan gaji hanya menyalin `pokokBln` langsung sebagai gBersih:
```javascript
// Ini adalah placeholder, BUKAN kalkulasi nyata!
gBersih: emp.pokokBln || 0, // Initial net = gross for now
gKotor: emp.pokokBln || 0,
```

**Yang WAJIB dikalkulasi sesuai regulasi:**

#### A. Upah Pokok & Pro-Rata (PP 36/2021)
- Hitung upah pro-rata berdasarkan hari kerja aktual vs hari kerja standar
- Karyawan kontrak/percobaan: hitung sesuai masa kerja
- Formula: `pokokTrm = pokokBln × (hrKerja / hrKerjaNormal)`

#### B. Lembur (Permenaker 102/2004 — WAJIB)
- Jam pertama lembur hari biasa = **1.5x** upah per jam
- Jam ke-2 dst hari biasa = **2x** upah per jam
- Hari libur/minggu jam 1-8 = **2x** upah per jam
- Hari libur/minggu jam ke-9 dst = **3x** upah per jam
- Hari libur nasional + hari kerja 5 hari: jam 1-8 = **2x**, jam 9 = **3x**, jam 10 dst = **4x**
- Formula upah per jam = `1/173 × upah sebulan`

#### C. PPh 21 — METODE TER (PMK 168/2023, berlaku 1 Jan 2024)
- Metode baru: Tarif Efektif Rata-rata (TER) untuk bulanan
- Bulan Jan-Nov: `PPh21 = penghasilan bruto × tarif TER`
- Bulan Des: hitung ulang dengan metode progresif tahunan
- TER dibagi berdasarkan PTKP + status (TK/0, K/0, K/1, K/2, K/3)

#### D. BPJS Ketenagakerjaan (PP 44/2015 + PP 45/2015)
- **JHT:** Perusahaan 3.7%, Karyawan 2% dari upah
- **JKK:** Perusahaan 0.24%-1.74% tergantung risiko pekerjaan
- **JKM:** Perusahaan 0.3% dari upah
- **JP (Jaminan Pensiun):** Perusahaan 2%, Karyawan 1% — **batas atas upah JP = Rp 10,043,950 (2024)**

#### E. BPJS Kesehatan (Perpres 75/2019)
- **Iuran:** Perusahaan 4%, Karyawan 1% dari gaji pokok + tunjangan tetap
- **Batas atas:** Rp 12,000,000/bulan
- **Batas bawah:** UMK setempat

#### F. Potongan Absensi
- Mangkir: potong gaji proportional
- Terlambat: opsional per kebijakan perusahaan

---

### 2. 📋 STRUKTUR SKALA UPAH (Permenaker 5/2023 — WAJIB)

**Belum ada sama sekali.** Perusahaan dengan ≥10 karyawan WAJIB memiliki struktur skala upah.

**Yang perlu dibuat:**
- Tabel rentang upah berdasarkan jabatan/golongan
- Mapping jabatan ke golongan upah  
- Perbandingan upah karyawan vs UMK dan skala upah
- Alert jika ada karyawan di bawah UMK

---

### 3. 🧾 PELAPORAN PAJAK — Bukti Potong & SPT

#### Bukti Potong PPh 21 (Form 1721-A1)
- **Wajib** diterbitkan setiap akhir tahun kepada karyawan
- Harus memuat: NPWP, PTKP, PKP, PPh terutang, PPh telah dipotong
- Model `PphThn` sudah ada tapi belum ada generator dokumen

#### SPT Masa PPh 21 (Bulanan)
- Perusahaan wajib lapor setiap bulan ke DJP
- Integrasi dengan format e-SPT atau file CSV DJP belum ada

---

### 4. 🏥 THR (Tunjangan Hari Raya) — PP 6/2016

**Model sudah ada, tapi kalkulasi belum:**
- Karyawan > 12 bulan: **1× gaji**
- Karyawan 1-12 bulan: **proporsional (masa kerja/12 × gaji)**
- Karyawan kontrak: berdasarkan perjanjian, minimal proporsional
- Batas waktu bayar: **H-7 lebaran**
- PPh atas THR: dihitung terpisah, bukan digabung dengan gaji bulanan

---

### 5. 💼 PESANGON & UANG PENGHARGAAN MASA KERJA (UU Cipta Kerja)

**Model `Pesangon` ada, kalkulasi belum:**

| Masa Kerja | Uang Pesangon |
|------------|---------------|
| < 1 tahun | 1 bulan upah |
| 1-2 tahun | 2 bulan upah |
| 2-3 tahun | 3 bulan upah |
| 3-4 tahun | 4 bulan upah |
| 4-5 tahun | 5 bulan upah |
| 5-6 tahun | 6 bulan upah |
| 6-7 tahun | 7 bulan upah |
| 7-8 tahun | 8 bulan upah |
| ≥ 8 tahun | 9 bulan upah (maksimum) |

**Uang Penghargaan Masa Kerja (UPMK):**
| Masa Kerja | UPMK |
|------------|------|
| 3-6 tahun | 2 bulan upah |
| 6-9 tahun | 3 bulan upah |
| 9-12 tahun | 4 bulan upah |
| 12-15 tahun | 5 bulan upah |
| 15-18 tahun | 6 bulan upah |
| 18-21 tahun | 7 bulan upah |
| 21-24 tahun | 8 bulan upah |
| ≥ 24 tahun | 10 bulan upah (maksimum) |

**PPh Pesangon:** Tarif khusus (PP 68/2009), final

---

### 6. 🗓️ CUTI TAHUNAN (UU 13/2003 Pasal 79)

**Status saat ini: Sebagian ada**

- Karyawan dengan masa kerja ≥12 bulan berhak **minimum 12 hari cuti**
- Cuti melahirkan: **3 bulan** (pra & pasca melahirkan)
- Cuti keguguran: **1.5 bulan**
- Cuti haid hari pertama & kedua
- Cuti untuk keperluan keluarga (nikah, meninggal, dll)

**Yang perlu dikembangkan:**
- Auto-generate saldo cuti saat ulang tahun masuk kerja
- Cuti kadaluwarsa (biasanya max 1 tahun)
- Laporan saldo cuti konsolidasi

---

### 7. 📁 KONTRAK KERJA & PKWT (UU Cipta Kerja)

**Model `Kontrak` ada, tapi belum ada:**
- Jenis PKWT: 5 tahun maksimum (total), tidak bisa diperpanjang lebih dari 1 kali
- Alert saat kontrak mendekati berakhir (H-30, H-7)
- Auto-konversi PKWT → PKWTT jika melebihi batas
- Template surat kontrak yang bisa di-generate

---

## 🔧 PENGEMBANGAN YANG DIREKOMENDASIKAN

### 🔴 PRIORITAS 1 — KRITIS (Segera)

#### 1. Engine Kalkulasi Payroll
**File baru:** `backend/src/services/payrollEngine.js`

Fungsi yang harus dibuat:
```
calculateBaseSalary(employee, period, absences)
calculateOvertimePay(employee, lemburData, timeWorkData)  
calculateBPJS(employee, baseSalary)  → {jht, jkk, jkm, jp, kes}
calculatePPh21TER(employee, monthlyIncome, ptkp, month)
calculateTHR(employee, period)
calculateDeductions(employee, period)
runPayrollForPeriod(periodId, companyId)
```

#### 2. Tarif TER PPh 21 — Master Data
**Tabel baru yang perlu dibuat:**
- `TarifTER` — berisi tarif per rentang upah per kategori PTKP
- Update `BatasPajak` untuk mendukung metode TER & progresif

#### 3. Kalkulator BPJS dengan Batas Atas/Bawah
- Integrasi parameter UMK dari tabel `Parameter`
- Validasi upah ≥ UMK sebelum proses payroll

---

### 🟡 PRIORITAS 2 — PENTING (1-2 bulan)

#### 4. Struktur Skala Upah
**Schema baru yang perlu ditambahkan ke `schema.prisma`:**
```prisma
model SkalaUpah {
  id         String   @id @default(uuid()) @db.Uuid
  kdCmpy     String   @map("KD_CMPY") @db.Char(3)
  kdJab      String   @map("KD_JAB") @db.VarChar(20)
  golongan   String   @map("GOLONGAN") @db.VarChar(5)
  upahMin    Decimal  @map("UPAH_MIN") @db.Decimal(15, 0)
  upahMid    Decimal  @map("UPAH_MID") @db.Decimal(15, 0)
  upahMax    Decimal  @map("UPAH_MAX") @db.Decimal(15, 0)
  validDate  DateTime @map("VALID_DATE") @db.Date
  isActive   Boolean  @default(true) @map("is_active")
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamp(6)

  @@map("skala_upah")
}
```

#### 5. Laporan & Rekap Payroll
- Rekap gaji per departemen / per periode
- Export Excel (format bank untuk transfer massal)
- Laporan lembur bulanan
- Laporan absensi dengan rekap keterlambatan/mangkir

#### 6. Bukti Potong PPh 21 (Form 1721-A1)
- Generate PDF sesuai format DJP
- Kirim otomatis via email ke karyawan

#### 7. Alert Kontrak Karyawan
- Notifikasi H-30 dan H-7 sebelum kontrak berakhir
- Dashboard kontrak yang akan berakhir

---

### 🟢 PRIORITAS 3 — PENGEMBANGAN (3-6 bulan)

#### 8. Penilaian Kinerja (KPI)
```prisma
model KpiTemplate { ... }  // Template penilaian per jabatan
model KpiEmployee { ... }  // Penilaian per karyawan per periode
model KpiScore    { ... }  // Nilai detail per indikator
```

#### 9. Employee Self Service (ESS) Lengkap
- Lihat & download slip gaji sendiri (sudah sebagian)
- Pengajuan lembur (belum ada)
- Update data pribadi (belum ada)
- Lihat saldo cuti (belum ada di UI)

#### 10. Audit Trail Lengkap
- Log setiap perubahan data gaji
- Log approval workflow
- Immutable payroll records setelah closing

#### 11. Integrasi Laporan Pajak
- Generate file CSV untuk e-SPT
- Format sesuai DJP Online

#### 12. Manajemen Disiplin (SP)
- Surat Peringatan 1, 2, 3
- Tracking kondite karyawan
- Eskalasi ke PHK

---

## 📐 ARSITEKTUR PAYROLL ENGINE YANG DISARANKAN

```
┌─────────────────────────────────────────────────────────────┐
│                      PAYROLL ENGINE                          │
│                  backend/src/services/                       │
├──────────────┬───────────────┬──────────────┬───────────────┤
│  Attendance  │   Overtime    │     BPJS     │   PPh 21     │
│  Calculator  │  Calculator   │  Calculator  │  (TER)       │
│  (Pro-rata)  │  (Per. 102)   │  (PP 44/45)  │ (PMK 168)   │
├──────────────┴───────────────┴──────────────┴───────────────┤
│              THR Calculator (PP 6/2016)                     │
│              Pesangon Calculator (UU Cipta Kerja)           │
├─────────────────────────────────────────────────────────────┤
│                  Deduction Aggregator                       │
│     (Pinjaman + Koperasi + Absensi + BPJS + PPh21)         │
├─────────────────────────────────────────────────────────────┤
│         Net Salary = Gross Income - Total Deductions        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ FILE-FILE YANG PERLU DIBUAT/DIMODIFIKASI

### Backend — File Baru
| File | Prioritas | Keterangan |
|------|-----------|------------|
| `src/services/payrollEngine.js` | 🔴 | Core kalkulasi payroll |
| `src/services/pphCalculator.js` | 🔴 | PPh 21 metode TER (PMK 168/2023) |
| `src/services/bpjsCalculator.js` | 🔴 | BPJS TK & Kesehatan |
| `src/services/overtimeCalculator.js` | 🔴 | Lembur sesuai Permenaker 102/2004 |
| `src/services/thrCalculator.js` | 🟡 | THR proporsional (PP 6/2016) |
| `src/services/pesangonCalculator.js` | 🟡 | Pesangon & UPMK (UU Cipta Kerja) |
| `src/controllers/reportController.js` | 🟡 | Laporan rekap gaji & absensi |
| `src/routes/report.routes.js` | 🟡 | Route laporan |

### Backend — Modifikasi
| File | Prioritas | Perubahan |
|------|-----------|-----------|
| `src/controllers/payrollController.js` | 🔴 | Integrasi payroll engine (ganti placeholder) |
| `prisma/schema.prisma` | 🔴 | Tambah model TarifTER, SkalaUpah |

### Frontend — Halaman Baru
| Halaman | Prioritas | Keterangan |
|---------|-----------|------------|
| `dashboard/payroll/calculate` | 🔴 | UI proses payroll dengan preview kalkulasi |
| `dashboard/payroll/slip-gaji` | 🔴 | Lihat & download slip gaji |
| `dashboard/reports/payroll-summary` | 🟡 | Rekap gaji per periode |
| `dashboard/reports/attendance-summary` | 🟡 | Rekap absensi bulanan |
| `dashboard/settings/master/skala-upah` | 🟡 | Struktur skala upah |
| `dashboard/settings/master/tarif-pph` | 🟡 | Master tarif TER PPh 21 |
| `dashboard/settings/master/bpjs-config` | 🟡 | Konfigurasi rate BPJS |
| `dashboard/employees/contracts` | 🟡 | Monitor kontrak PKWT |
| `dashboard/performance` | 🟢 | Penilaian kinerja KPI |

---

## ⚖️ RISIKO HUKUM JIKA TIDAK DIPERBAIKI

| Risiko | Regulasi | Sanksi |
|--------|----------|--------|
| Gaji di bawah UMK | PP 36/2021 Ps. 23 | Pidana penjara 1-4 tahun atau denda Rp 100-400 juta |
| Tidak mendaftarkan BPJS | UU BPJS 24/2011 | Denda administratif + pidana penjara |
| PPh 21 salah hitung/metode | PMK 168/2023 | Bunga 2% per bulan + denda |
| Tidak bayar THR | PP 6/2016 | Denda 5% dari total THR yang tidak dibayar |
| PKWT melebihi 5 tahun | UU Cipta Kerja Ps. 56 | Demi hukum berubah jadi PKWTT |
| Tidak membuat skala upah | Permenaker 5/2023 | Sanksi administratif |
| Lembur tidak dibayar sesuai ketentuan | Permenaker 102/2004 | Tuntutan pidana + denda |

---

## 💡 REKOMENDASI TEKNIS TAMBAHAN

1. **Locking Payroll Period** — Setelah payroll di-closing, data gaji tidak boleh bisa diubah (immutable). Tambahkan middleware check `period.tutup` sebelum operasi write.

2. **Batch Processing** — Kalkulasi payroll untuk 100+ karyawan harus dijalankan sebagai background job (queue), bukan synchronous HTTP request. Gunakan `Bull` atau `node-cron`.

3. **Audit Log Payroll** — Setiap perubahan pada data gaji harus tercatat: siapa, kapan, nilai sebelum & sesudah.

4. **Multi-Company Support** — Schema sudah mendukung `kdCmpy`, pastikan semua kalkulasi menghormati parameter per perusahaan (UMK berbeda, BPJS rate berbeda).

5. **Data Validation Sebelum Proses Payroll** — Validasi: karyawan aktif, shift sudah di-set, absensi sudah final, upah tidak di bawah UMK.

6. **Rekonsiliasi** — Bandingkan total transfer bank vs total `gBersih` di database setiap periode untuk deteksi anomali.

7. **Enkripsi Data Sensitif** — Nomor rekening, NPWP, data gaji harus dienkripsi at-rest.

8. **Rate Limiter pada Endpoint Payroll** — Proses payroll hanya boleh dijalankan sekali per periode per perusahaan.
