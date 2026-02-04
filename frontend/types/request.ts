// types/request.ts
export type RequestType = 'CUTI' | 'IJIN' | 'PULANG_CEPAT' | 'DINAS_LUAR' | 'SAKIT';
export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ApprovalLog {
    id: string;
    pengajuanId: string;
    approverId: string;
    level: number;
    status: RequestStatus;
    remarks: string | null;
    actionDate: string;
    approver: {
        nama: string;
        kdJab: string | null;
    };
}

export interface Pengajuan {
    id: string;
    emplId: string;
    type: RequestType;
    startDate: string;
    endDate: string | null;
    reason: string;
    status: RequestStatus;
    currentStep: number;
    attachments: string | null;
    createdAt: string;
    updatedAt: string;
    approvals?: ApprovalLog[];
    karyawan?: {
        nama: string;
        emplId: string;
        kdDept: string | null;
    };
}
