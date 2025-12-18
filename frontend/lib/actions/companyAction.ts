"use server";

import { api } from "@/lib/api";
import { CompanyFormValues, companySchema } from "@/schemas/company/companySchema";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers"; // 1. Import cookies

// --- HELPER FUNCTION ---
// Fungsi ini mengambil semua cookie dari browser user untuk diteruskan ke backend
async function getAuthHeaders() {
    const cookieStore = await cookies();

    // Mengambil string lengkap cookie (misal: "connect.sid=...; theme=dark;")
    // Ini berguna jika backend Express menggunakan express-session atau cookie-parser
    return {
        Cookie: cookieStore.toString(),
        // Jika backend pakai Bearer Token, ganti baris di atas dengan:
        // "Authorization": `Bearer ${cookieStore.get('accessToken')?.value}`
    };
}

// --- CREATE ACTION ---
export async function createCompanyAction(data: CompanyFormValues) {
    // 1. Validasi Zod
    const validation = companySchema.safeParse(data);

    if (!validation.success) {
        return { success: false, error: "Data input tidak valid" };
    }

    try {
        // 2. Siapkan Headers (Cookie)
        const headers = await getAuthHeaders();

        // 3. Kirim ke Backend Express
        // PERHATIKAN: axios.post(url, data, config) -> config ada di urutan ke-3
        await api.post("/company", data, {
            headers: headers,
        });

        // 4. Revalidate cache
        revalidatePath("/dashboard/settings/master/company");

        return { success: true };
    } catch (error: any) {
        console.error("Create Error:", error?.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.msg || "Gagal membuat company",
        };
    }
}

// --- UPDATE ACTION ---
export async function updateCompanyAction(id: string, data: CompanyFormValues) {
    // 1. Validasi Zod
    const validation = companySchema.safeParse(data);

    if (!validation.success) {
        return { success: false, error: "Data input tidak valid" };
    }

    try {
        // 2. Siapkan Headers (Cookie)
        const headers = await getAuthHeaders();

        // 3. Kirim ke Backend Express
        // Gunakan PATCH untuk update (sesuai route backend)
        await api.patch(`/company/${id}`, data, {
            headers: headers,
        });

        // 4. Revalidate cache
        revalidatePath("/dashboard/settings/master/company");

        return { success: true };
    } catch (error: any) {
        console.error("Update Error:", error?.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.msg || "Gagal mengupdate company",
        };
    }
}

// --- DELETE ACTION ---
export async function deleteCompanyAction(id: string) {
    try {
        // 1. Siapkan Headers (Cookie)
        const headers = await getAuthHeaders();

        // 2. Kirim Request Delete
        // PERHATIKAN: axios.delete(url, config) -> config ada di urutan ke-2
        await api.delete(`/company/${id}`, {
            headers: headers,
        });

        // 3. Revalidate cache
        revalidatePath("/dashboard/settings/master/company");

        return { success: true };
    } catch (error: any) {
        console.error("Delete Error:", error?.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.msg || "Gagal menghapus data"
        };
    }
}