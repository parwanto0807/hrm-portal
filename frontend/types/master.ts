export interface Bank {
    bankCode: string;
    bankNama: string;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeLevel {
    kdPkt: string;
    nmPkt: string;
    keterangan?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Factory {
    kdFact: string;
    nmFact: string;
    keterangan?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Position {
    kdJab: string;
    nmJab: string;
    nTjabatan: number;
    nTransport: number;
    nShiftAll: number;
    nPremiHdr: number;
    persenRmh: number;
    persenPph: number;
    keterangan?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Division {
    kdBag: string;
    nmBag: string;
    keterangan?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Department {
    kdDept: string;
    nmDept: string;
    kdBag: string;
    keterangan?: string;
    createdAt: string;
    updatedAt: string;
    bag?: Division;
}

export interface Section {
    kdSeksie: string;
    nmSeksie: string;
    kdDept: string;
    kdBag: string;
    keterangan?: string;
    createdAt: string;
    updatedAt: string;
    dept?: Department;
}

export interface Company {
    id?: string;
    nmComp: string;
    alamat1: string;
    alamat2?: string;
    kota: string;
    telp?: string;
    email?: string;
    npwp?: string;
    owner?: string;
    logo?: string;
    createdAt?: string;
    updatedAt?: string;
}

