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
    tmpLhr: string | null;
    agama?: {
        kdAgm: string;
        nmAgm: string;
    };
    jmlAnak?: number;
    telpon?: string | null;
    alamat1?: string | null;
    kota?: string | null;
    kdPos?: string | null;
    pkt?: {
        kdPkt: string;
        nmPkt: string;
    };

    // Foreign Keys
    kdCmpy: string | null;
    kdFact: string | null;
    kdBag: string | null;
    kdDept: string | null;
    kdSeksie: string | null;
    kdJab: string | null;
    bankCode: string | null;
    superiorId: string | null;
    superior2Id: string | null;

    // Bank Details
    bankUnit: string | null;
    bankRekNo: string | null;
    bankRekName: string | null;

    // Personal
    kdSex: 'LAKILAKI' | 'PEREMPUAN';
    email: string | null;
    handphone: string | null;
    tglLhr: Date | null;
    tglMsk: Date | null;
    tglOut: Date | null;

    // Status
    kdOut: boolean;
    kdJns: 'KONTRAK' | 'TETAP' | 'HARIAN';
    kdSts: 'TIDAK_AKTIF' | 'AKTIF';

    // Payroll
    pokokBln: number;
    tTransport: number;
    tMakan: number;
    tJabatan: number;
    tKeluarga: number;
    tKomunikasi: number;
    tKhusus: number;
    tLmbtetap: number;
    fixOther: number;
    kdTransp: boolean;
    kdMakan: boolean;

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
