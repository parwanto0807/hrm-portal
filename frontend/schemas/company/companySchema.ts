import { z } from "zod";

// Helper untuk menangani field optional yang mungkin dikirim sebagai string kosong dari form
const emptyString = z.literal("").transform(() => null);

// Helper untuk field text (unlimited length di PostgreSQL)
const optionalText = () =>
    z.string().optional().nullable().or(emptyString);

// Helper untuk field dengan max length tertentu
const optionalString = (max: number) =>
    z.string().max(max, `Maksimal ${max} karakter`).optional().nullable().or(emptyString);

export const companySchema = z.object({
    // kodeCmpy: Wajib, Char(3) -> min 1, max 3 (tetap karena business rule)
    kodeCmpy: z.string()
        .min(1, "Kode Company wajib diisi")
        .max(3, "Kode Company maksimal 3 karakter"),

    // company: TEXT (dari VARCHAR(40))
    company: optionalText(),

    // Alamat: TEXT semua (dari VARCHAR(40))
    address1: optionalText(),
    address2: optionalText(),
    address3: optionalText(),

    // tlp & fax: VARCHAR(20) cukup (diperbesar dari 15)
    tlp: optionalString(20),
    fax: optionalString(20),

    // npwp: VARCHAR(20) (cukup untuk format NPWP)
    npwp: optionalString(20),

    // director: TEXT (dari VARCHAR(25))
    director: optionalText(),

    // npwpDir: VARCHAR(20)
    npwpDir: optionalString(20),

    // logo: TEXT karena URL bisa sangat panjang
    logo: optionalText(),

    // npp: VARCHAR(30) cukup
    npp: optionalString(30),

    // astekBayar: TEXT (dari VARCHAR(80))
    astekBayar: optionalText(),

    // email: VARCHAR(100) (diperbesar dari 30)
    email: z.string()
        .email("Format email tidak valid")
        .max(100, "Email maksimal 100 karakter")
        .optional()
        .nullable()
        .or(emptyString),

    // homepage: TEXT karena URL bisa panjang dengan query params
    homepage: z.string()
        .url("Format URL tidak valid")
        .optional()
        .nullable()
        .or(emptyString),

    // hrdMng: TEXT (dari VARCHAR(30))
    hrdMng: optionalText(),

    // npwpMng: VARCHAR(20)
    npwpMng: optionalString(20),
});

// Type inference otomatis dari schema Zod (Untuk Form Input)
export type CompanyFormValues = z.infer<typeof companySchema>;