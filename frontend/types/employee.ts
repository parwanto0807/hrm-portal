// types/employee.ts
export interface Employee {
    id: string;
    emplId: string;
    nik: string | null;
    idAbsen: string | null;
    nama: string;
    ktpNo: string | null;
    npwp: string | null;
    noBpjsTk: string | null;
    noBpjsKes: string | null;
    // Personal
    kdSex: 'LAKILAKI' | 'PEREMPUAN';
    email: string | null;
    handphone: string | null;
    telpon: string | null;
    tglLhr: Date | null;
    tmpLhr: string | null;
    kdAgm: string | null;
    kdSkl: string | null;
    alamat1?: string | null;
    alamat2: string | null;
    alamatDom1?: string | null;
    alamatDom2?: string | null;
    kota?: string | null;
    kdPos?: string | null;
    tglNikah: Date | null;
    jmlAnak?: number;
    ibuKandung?: string | null;
    kkNo?: string | null;
    glDarah?: string | null;
    validKtp?: Date | null;

    // Employment
    tglMsk: Date | null;
    tglAngkat: Date | null;
    tglOut: Date | null;
    kdSts: 'TIDAK_AKTIF' | 'AKTIF';
    kdJns: 'KONTRAK' | 'TETAP' | 'HARIAN';
    kdDept: string | null;
    kdJab: string | null;
    kdPkt: string | null;
    kdCmpy: string | null;
    kdFact: string | null;
    kdBag: string | null;
    kdSeksie: string | null;
    superiorId: string | null;
    superior2Id: string | null;
    jnsJamId: string | null;
    groupShiftId: string | null;
    hariKerja?: number;

    // Identification & Social Security
    tglNpwp: Date | null;
    kdBpjsTk: boolean;
    kdBpjsKes: boolean;
    tglAstek?: Date | null;

    // Documents
    typeSim?: string | null;
    noSim?: string | null;
    validSim?: Date | null;
    pasportNo?: string | null;
    kitasNo?: string | null;
    validKitas?: Date | null;

    // Emergency Contact
    nmTeman?: string | null;
    hubTeman?: string | null;
    tlpTeman?: string | null;
    almTeman?: string | null;

    // Bank Details
    bankCode: string | null;
    bankUnit: string | null;
    bankRekNo: string | null;
    bankRekName: string | null;

    // Payroll & Deductions
    pokokBln: number;
    tTransport: number;
    tMakan: number;
    tJabatan: number;
    tKeluarga: number;
    tKomunikasi: number;
    tKhusus: number;
    tLmbtetap: number;
    fixOther: number;
    kdPtkp: number;
    potRumah: number;
    noAnggota: string | null;

    // Flags
    kdTransp: boolean;
    kdMakan: boolean;
    kdOut: boolean;
    kdLmb: boolean;
    kdSpl: boolean;
    kdPjk: boolean;
    kdKoperasi: boolean;
    kdptRumah: boolean;
    kdSpsi: boolean;

    // Relations
    company?: {
        kodeCmpy: string;
        company: string;
    };
    fact?: {
        kdFact: string;
        nmFact: string;
    };
    bag?: {
        kdBag: string;
        nmBag: string;
    };
    dept?: {
        kdDept: string;
        nmDept: string;
    };
    sie?: {
        kdSeksie: string;
        nmSeksie: string;
    };
    jabatan?: {
        kdJab: string;
        nmJab: string;
    };
    bank?: {
        bankCode: string;
        bankNama: string;
    };
    jnsJam?: {
        id: string;
        kdJam: string;
        jnsJam: string;
    };
    groupShift?: {
        id: string;
        groupShift: string;
        groupName: string;
    };
    agama?: {
        kdAgm: string;
        nmAgm: string;
    };
    pkt?: {
        kdPkt: string;
        nmPkt: string;
    };

    // Audit
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export interface EmployeePayroll {
    baseSalary: number;
    allowances: {
        transport: number;
        meal: number;
        position: number;
        family: number;
        communication: number;
        special: number;
        overtime: number;
        other: number;
    };
    totalSalary: number;
    _verified: boolean;
    _warnings: string[];
}

export interface EmployeeListResponse {
    success: boolean;
    data: Employee[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface EmployeeDetailResponse {
    success: boolean;
    data: Employee;
}

export interface EmployeePayrollResponse {
    success: boolean;
    data: {
        employee: {
            id: string;
            emplId: string;
            nama: string;
        };
        payroll: EmployeePayroll;
    };
}
