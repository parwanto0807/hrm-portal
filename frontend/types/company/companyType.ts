export interface CompanyData {
    id: string;          // UUID
    kodeCmpy: string;
    company: string | null;
    address1: string | null;
    address2: string | null;
    address3: string | null;
    tlp: string | null;
    fax: string | null;
    npwp: string | null;
    director: string | null;
    npwpDir: string | null;
    logo: string | null;
    npp: string | null;
    astekBayar: string | null;
    email: string | null;
    homepage: string | null;
    hrdMng: string | null;
    npwpMng: string | null;
    createdAt: string;   // Tanggal dari JSON API biasanya string (ISO 8601)
    updatedAt: string;   // Tanggal dari JSON API biasanya string (ISO 8601)
}

// Interface untuk Response API standar (opsional)
export interface ApiResponse<T> {
    msg?: string;
    data: T;
    error?: string;
}