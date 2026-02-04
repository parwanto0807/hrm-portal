import { z } from "zod";

export const employeeFormSchema = z.object({
    // Identification
    emplId: z.string().min(1, "Employee ID is required").max(10, "Max 10 characters"),
    nik: z.string().nullish().or(z.literal("")),
    idAbsen: z.string().nullish().or(z.literal("")),
    nama: z.string().min(2, "Name must be at least 2 characters"),

    // Personal
    kdSex: z.enum(["LAKILAKI", "PEREMPUAN"]),
    email: z.string().email("Invalid email address").nullish().or(z.literal("")),
    handphone: z.string().nullish().or(z.literal("")),
    tglLhr: z.string().nullish().or(z.literal("")),

    // Employment
    tglMsk: z.string().nullish().or(z.literal("")),
    tglOut: z.string().nullish().or(z.literal("")),
    kdSts: z.enum(["AKTIF", "TIDAK_AKTIF"]),
    kdJns: z.enum(["TETAP", "KONTRAK", "HARIAN"]),
    kdDept: z.string().nullish().or(z.literal("")),
    kdJab: z.string().nullish().or(z.literal("")),
    kdCmpy: z.string().nullish().or(z.literal("")),
    kdFact: z.string().nullish().or(z.literal("")),
    superiorId: z.string().nullish().or(z.literal("")),
    superior2Id: z.string().nullish().or(z.literal("")),

    // Bank
    bankCode: z.string().nullish().or(z.literal("")),
    bankUnit: z.string().nullish().or(z.literal("")),
    bankRekNo: z.string().nullish().or(z.literal("")),
    bankRekName: z.string().nullish().or(z.literal("")),

    // Payroll
    pokokBln: z.number().min(0),
    tTransport: z.number().min(0),
    tMakan: z.number().min(0),
    tJabatan: z.number().min(0),
    tKeluarga: z.number().min(0),
    tKomunikasi: z.number().min(0),
    tKhusus: z.number().min(0),
    tLmbtetap: z.number().min(0),
    fixOther: z.number().min(0),

    // Booleans
    kdTransp: z.boolean(),
    kdMakan: z.boolean(),
    kdOut: z.boolean(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
