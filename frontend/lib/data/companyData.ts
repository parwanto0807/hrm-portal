// lib/data/companyData.ts
import { CompanyData } from "@/types/company/companyType";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper untuk refresh token dan retry request
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const defaultOptions: RequestInit = {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include',
        cache: "no-store",
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    let response = await fetch(url, mergedOptions);

    if (response.status === 401) {
        console.warn("Access token expired, attempting refresh...");
        try {
            // Attempt to refresh token
            const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
            });

            if (refreshRes.ok) {
                console.log("Token refreshed successfully, retrying request...");
                // Retry original request
                response = await fetch(url, mergedOptions);
            } else {
                console.error("Failed to refresh token:", refreshRes.statusText);
                // Optional: Redirect to login or handled by caller
            }
        } catch (error) {
            console.error("Error during token refresh:", error);
        }
    }

    return response;
}

// ==================== VERSI CLIENT (untuk Client Components) ====================
export async function getCompanies(): Promise<CompanyData[]> {
    try {
        const res = await fetchWithAuth(`${BASE_URL}/company`, {
            method: "GET",
        });

        if (!res.ok) {
            if (res.status === 401) {
                console.warn("Unauthorized access to getCompanies. Token might be expired.");
                return [];
            }
            throw new Error(`Failed to fetch companies: ${res.statusText} (${res.status})`);
        }

        const data: CompanyData[] = await res.json();
        return data;

    } catch (error) {
        console.error("Failed to fetch companies:", error);
        return [];
    }
}

export async function getCompanyById(id: string): Promise<CompanyData | null> {
    try {
        const res = await fetchWithAuth(`${BASE_URL}/company/${id}`, {
            method: "GET",
        });

        if (!res.ok) {
            if (res.status === 401) return null;
            return null;
        }

        const data: CompanyData = await res.json();
        return data;

    } catch (error) {
        console.error("Error fetching company:", error);
        return null;
    }
}

export async function createCompany(data: Partial<CompanyData>): Promise<CompanyData | null> {
    try {
        const res = await fetchWithAuth(`${BASE_URL}/company`, {
            method: "POST",
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error(`Failed to create company: ${res.statusText}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error creating company:", error);
        return null;
    }
}

export async function updateCompany(id: string, data: Partial<CompanyData>): Promise<CompanyData | null> {
    try {
        const res = await fetchWithAuth(`${BASE_URL}/company/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error(`Failed to update company: ${res.statusText}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error updating company:", error);
        return null;
    }
}