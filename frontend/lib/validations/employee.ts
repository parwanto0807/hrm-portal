import { z } from "zod";

export const employeeFormSchema = z.object({
    // Identification
    emplId: z.string().min(1, "Employee ID is required").max(10, "Max 10 characters"),
    nik: z.string().nullish().or(z.literal("")),
    idAbsen: z.string().nullish().or(z.literal("")),
    nama: z.string().min(2, "Name must be at least 2 characters"),
    ktpNo: z.string().nullish().or(z.literal("")),
    npwp: z.string().nullish().or(z.literal("")),
    tglNpwp: z.string().nullish().or(z.literal("")),

    // Personal
    kdSex: z.enum(["LAKILAKI", "PEREMPUAN"]),
    email: z.string().email("Invalid email address").nullish().or(z.literal("")),
    handphone: z.string().nullish().or(z.literal("")),
    tglLhr: z.string().nullish().or(z.literal("")),
    tmpLhr: z.string().nullish().or(z.literal("")),
    kdAgm: z.string().nullish().or(z.literal("")),
    kdSkl: z.string().nullish().or(z.literal("")),
    alamat1: z.string().nullish().or(z.literal("")),
    alamat2: z.string().nullish().or(z.literal("")),
    kota: z.string().nullish().or(z.literal("")),
    kdPos: z.string().nullish().or(z.literal("")),
    tglNikah: z.string().nullish().or(z.literal("")),
    jmlAnak: z.coerce.number().int().min(0).default(0),

    // Employment
    tglMsk: z.string().nullish().or(z.literal("")),
    tglAngkat: z.string().nullish().or(z.literal("")),
    tglOut: z.string().nullish().or(z.literal("")),
    kdSts: z.enum(["AKTIF", "TIDAK_AKTIF"]),
    kdJns: z.enum(["TETAP", "KONTRAK", "HARIAN"]),
    kdDept: z.string().nullish().or(z.literal("")),
    kdJab: z.string().nullish().or(z.literal("")),
    kdPkt: z.string().nullish().or(z.literal("")),
    kdCmpy: z.string().nullish().or(z.literal("")),
    kdFact: z.string().nullish().or(z.literal("")),
    superiorId: z.string().nullish().or(z.literal("")),
    superior2Id: z.string().nullish().or(z.literal("")),
    jnsJamId: z.string().nullish().or(z.literal("")),
    groupShiftId: z.string().nullish().or(z.literal("")),

    // BPJS
    noBpjsTk: z.string().nullish().or(z.literal("")),
    noBpjsKes: z.string().nullish().or(z.literal("")),
    kdBpjsTk: z.boolean().default(true),
    kdBpjsKes: z.boolean().default(true),

    // Bank
    bankCode: z.string().nullish().or(z.literal("")),
    bankUnit: z.string().nullish().or(z.literal("")),
    bankRekNo: z.string().nullish().or(z.literal("")),
    bankRekName: z.string().nullish().or(z.literal("")),

    // Payroll
    pokokBln: z.coerce.number().min(0).default(0),
    tTransport: z.coerce.number().min(0).default(0),
    tMakan: z.coerce.number().min(0).default(0),
    tJabatan: z.coerce.number().min(0).default(0),
    tKeluarga: z.coerce.number().min(0).default(0),
    tKomunikasi: z.coerce.number().min(0).default(0),
    tKhusus: z.coerce.number().min(0).default(0),
    tLmbtetap: z.coerce.number().min(0).default(0),
    fixOther: z.coerce.number().min(0).default(0),
    kdPtkp: z.coerce.number().int().min(1).default(1),
    potRumah: z.coerce.number().min(0).default(0),
    noAnggota: z.string().nullish().or(z.literal("")),

    // Booleans
    kdTransp: z.boolean().default(true),
    kdMakan: z.boolean().default(true),
    kdOut: z.boolean().default(false),
    kdLmb: z.boolean().default(true),
    kdSpl: z.boolean().default(true),
    kdPjk: z.boolean().default(true),
    kdKoperasi: z.boolean().default(false),
    kdptRumah: z.boolean().default(false),
    kdSpsi: z.boolean().default(false),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
