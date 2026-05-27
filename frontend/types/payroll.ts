export interface PayrollPeriod {
    id: number | string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'Open' | 'Closed' | 'Draft';
    totalEmployees: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    year?: number;
    month?: number;
}

// ── Audit Log ────────────────────────────────────────────────────
export interface PayrollLog {
    id: string;
    period: string;
    emplId: string;
    action: string;
    changedBy: string;
    changedAt: string;
    ipAddress?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    note?: string;
}

// ── Konfigurasi BPJS ─────────────────────────────────────────────
export interface KonfigBpjs {
    id: string;
    kdCmpy: string;
    validDate: string;
    isActive: boolean;
    // JHT
    jhtPerush: number;
    jhtEmpl: number;
    // JKK
    jkkRate: number;
    // JKM
    jkmRate: number;
    // Jaminan Pensiun
    jpPerush: number;
    jpEmpl: number;
    jpMaksUpah: number;
    // Jaminan Kesehatan
    jknPerush: number;
    jknEmpl: number;
    jknMaksUpah: number;
    company?: { company: string };
}

// ── Tarif TER PPh 21 ──────────────────────────────────────────────
export interface TarifTER {
    id: string;
    tahun: number;
    kategori: 'A' | 'B' | 'C'; // A=TK/0, B=K/0-K/1, C=K/2-K/3
    batasMin: number;
    batasMax: number | null;
    tarif: number; // dalam desimal, misal 0.05 = 5%
    isActive: boolean;
}

// ── Preview Kalkulasi Satu Karyawan ──────────────────────────────
export interface PayrollPreviewResult {
    emplId: string;
    period: string;
    karyawan: { nama: string; nik: string };
    periode: { id: string; nama: string };
    validasi: {
        gajiBawahUMK: boolean;
        missingKonfigBpjs: boolean;
        missingTarifTER: boolean;
    };
    // Komponen Upah
    pokokBln: number;
    pokokTrm: number; // Pro-rata
    hrKerja: number;
    hrKerjaNormal: number;
    // Lembur
    totJLembur: number;
    totULembur: number;
    // Tunjangan
    tJabatan: number;
    tTransport: number;
    tMakan: number;
    tKhusus: number;
    totUShift: number;
    thr: number;
    tunjLain: number;
    // BPJS Karyawan
    jhtEmpl: number;
    jpnEmpl: number;
    jknEmpl: number;
    // BPJS Perusahaan
    jhtPerush: number;
    jkkPerush: number;
    jkmPerush: number;
    jpnPerush: number;
    jknPerush: number;
    // PPh 21
    tPph21: number;
    pphEmpl: number;
    // Potongan Lain
    potAbsen: number;
    pinjam: number;
    koperasi: number;
    potLain: number;
    // Total
    gKotor: number;
    gBersih: number;
}

// ── Hasil Batch Calculate ─────────────────────────────────────────
export interface PayrollCalculateResult {
    berhasil: number;
    gagal: number;
    total: number;
    errors: Array<{ emplId: string; nama?: string; error: string }>;
}

export interface PayrollDetail {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeIdNumber: string; // NIK or EmpID
    department: string;
    section: string; // Added section field
    position: string;

    // New fields for detailed slip
    joinDate?: string;
    taxStatus?: string;
    lemburHours?: number;

    // Earnings
    baseSalary: number;
    pokokTrm?: number; // Upah Dibayarkan (actual paid salary)
    allowances: {
        // Detailed components
        tJabatan?: number;
        tTransport?: number;
        tMakan?: number;
        tKhusus?: number;
        totUShift?: number;
        mealOt?: number;
        tunjMedik?: number;
        lembur?: number;
        rapel?: number;
        thr?: number;
        tLain?: number;
        admBank?: number;

        // Legacy/Generic map support
        transport?: number;
        meal?: number;
        position?: number;
        family?: number;
        communication?: number;
        special?: number;
        overtime?: number;
        other?: number;
        [key: string]: number | undefined;
    };
    totalAllowances: number; // JUMLAH A
    grossSalary: number;

    // Deductions
    deductions: {
        // Detailed components
        jht?: number;
        jpn?: number;
        bpjs?: number;
        jkk?: number;
        jkm?: number;
        jpk?: number;
        pph21?: number;
        pphEmpl?: number;
        pphThr?: number;
        potPinjaman?: number; // Loans
        iuranKoperasi?: number;
        potAbsen?: number;
        lain?: number;

        // Legacy
        tax?: number;
        insurance?: number; // BPJS etc
        loan?: number;
        other?: number;
        [key: string]: number | undefined;
    };
    totalDeductions: number;

    netSalary: number; // Take Home Pay

    status: 'Pending' | 'Processed' | 'Paid';
    paymentDate?: string;
}

export interface PayrollSummary {
    period: PayrollPeriod;
    totalBaseSalary: number;
    totalAllowances: number;
    totalDeductions: number;
    totalNetSalary: number;
    employeeCount: number;
}

// ── Sprint 2: Rekap Laporan Payroll ──────────────────────────────
export interface RekapPayrollRow {
    emplId: string;
    nik: string;
    nama: string;
    kdDept: string;
    nmDept: string;
    kdSeksie: string;
    nmSeksie: string;
    kdJab: string;
    nmJab: string;
    pokokBln: number;
    pokokTrm: number;
    tJabatan: number;
    tTransport: number;
    tMakan: number;
    totUShift: number;
    totULembur: number;
    totJLembur: number;
    thr: number;
    tunjLain: number;
    gKotor: number;
    jhtEmpl: number;
    jpnEmpl: number;
    jknEmpl: number;
    tPph21: number;
    potAbsen: number;
    pinjam: number;
    koperasi: number;
    potLain: number;
    totPotong: number;
    gBersih: number;
    // BPJS Perusahaan
    jhtPerush: number;
    jkkPerush: number;
    jkmPerush: number;
    jpnPerush: number;
    jknPerush: number;
    closing: boolean;
    kdSts?: string;
}

export interface RekapPayrollSummary {
    periode: { periodeId: string; periodeNama: string; status: string };
    totalKaryawan: number;
    totalGKotor: number;
    totalGBersih: number;
    totalBpjsTk: number;
    totalBpjsKes: number;
    totalPph21: number;
    totalPotong: number;
    totalBpjsPerush: number;
    byDept: Array<{
        kdDept: string;
        nmDept: string;
        count: number;
        totalGKotor: number;
        totalGBersih: number;
    }>;
}

// ── Sprint 2: Rekap Absensi ───────────────────────────────────────
export interface RekapAbsensiRow {
    emplId: string;
    nik: string;
    nama: string;
    kdDept: string;
    nmDept: string;
    kdSeksie: string;
    periode: string;
    hrHadir: number;
    hrAlpha: number;
    hrIzin: number;
    hrSakit: number;
    hrCuti: number;
    hrLembur: number;
    totalLembur: number;
    mntLambat: number;
    mntCepat: number;
    hrKerjaNormal: number;
    persenHadir: number;
}

// ── Sprint 2: Kontrak PKWT ────────────────────────────────────────
export interface KontrakKaryawan {
    id: string;
    emplId: string;
    nik?: string;
    tglMulai: string;
    tglAkhir?: string;
    keterangan?: string;
    createdAt: string;
    updatedAt: string;
    karyawan?: {
        nama: string;
        nik?: string;
        kdSts?: string;
        kdJns?: string;
        dept?: { nmDept: string };
        sie?: { nmSeksie: string };
        jabatan?: { nmJab: string };
    };
    // computed
    daysLeft?: number;
    status?: 'active' | 'expiring_soon' | 'expired' | 'permanent';
}

// ── Sprint 2: Skala Upah ──────────────────────────────────────────
export interface SkalaUpah {
    id: string;
    kdCmpy: string;
    tahun: number;
    kdJab?: string;
    nmJab?: string;
    golongan?: string;
    upahMin: number;
    upahMaks: number;
    umk: number;
    validDate: string;
    isActive: boolean;
    company?: { company: string };
}

