import { z } from "zod";

// Helper untuk menangani field optional yang mungkin dikirim sebagai string kosong dari form
const emptyString = z.literal("").transform(() => null);
const optionalString = (max: number) =>
    z.string().max(max, `Maksimal ${max} karakter`).optional().nullable().or(emptyString);

export const companySchema = z.object({
    // kodeCmpy: Wajib, Char(3) -> min 1, max 3
    kodeCmpy: z.string()
        .min(1, "Kode Company wajib diisi")
        .max(3, "Kode Company maksimal 3 karakter"),

    // company: VarChar(40)
    company: z.string()
        .max(40, "Nama Company maksimal 40 karakter")
        .optional() // Boleh kosong karena di DB nullable
        .nullable(),

    address1: optionalString(40),
    address2: optionalString(40),
    address3: optionalString(40),

    // tlp & fax: VarChar(15)
    tlp: optionalString(15),
    fax: optionalString(15),

    // npwp: VarChar(20)
    npwp: optionalString(20),

    // director: VarChar(25)
    director: optionalString(25),
    npwpDir: optionalString(20),

    logo: optionalString(80),
    npp: optionalString(30),
    astekBayar: optionalString(80),

    // email: Validasi format email + max 30 chars
    email: z.string()
        .email("Format email tidak valid")
        .max(30, "Email maksimal 30 karakter")
        .optional()
        .nullable()
        .or(emptyString),

    // homepage: Validasi URL (opsional)
    homepage: z.string()
        .url("Format URL tidak valid")
        .max(50, "Homepage maksimal 50 karakter")
        .optional()
        .nullable()
        .or(emptyString),

    hrdMng: optionalString(30),
    npwpMng: optionalString(20),
});

// Type inference otomatis dari schema Zod (Untuk Form Input)
export type CompanyFormValues = z.infer<typeof companySchema>;