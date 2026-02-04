export interface PayrollPeriod {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: 'Open' | 'Closed' | 'Draft';
    totalEmployees: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
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
        lembur?: number;
        rapel?: number;
        tLain?: number;
        admBank?: number; // Treated as income in specific layout if needed, or mapping?

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
        pph21?: number;
        potPinjaman?: number; // Loans
        iuranKoperasi?: number;
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
