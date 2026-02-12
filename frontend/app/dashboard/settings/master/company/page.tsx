"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCompanies } from "@/lib/data/companyData";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Shadcn UI Components
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Building2, AlertCircle, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CompanyForm from "@/components/settings/company/CompanyFormWithValidation";
import HeaderCard from "@/components/ui/header-card";
import { CompanyData } from "@/types/company/companyType";

export default function CompanyPage() {
    const [data, setData] = useState<CompanyData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const res = await getCompanies();
                if (!res || res.length === 0) {
                    setData(null);
                } else {
                    setData(res[0]);
                }
            } catch (err) {
                console.error("❌ Error fetching company data:", err);
                const errorMessage = err instanceof Error ? err.message : "Gagal memuat data perusahaan";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="p-2 md:p-6 space-y-4">
            {/* Breadcrumb Section Wrapped with Badge Style */}
            <nav aria-label="Breadcrumb" className="py-2">
                <Breadcrumb>
                    <BreadcrumbList className="flex items-center gap-1 sm:gap-2">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard">
                                    <Badge variant="outline" className="font-medium hover:bg-accent transition-colors">
                                        Dashboard
                                    </Badge>
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbSeparator>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </BreadcrumbSeparator>

                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard/settings">
                                    <Badge variant="outline" className="font-medium hover:bg-accent transition-colors">
                                        Settings
                                    </Badge>
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbSeparator>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </BreadcrumbSeparator>

                        <BreadcrumbItem>
                            <BreadcrumbPage>
                                <Badge variant="secondary" className="font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-none">
                                    Company
                                </Badge>
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </nav>

            {/* Error Alert */}
            {error && (
                <div className="mb-4">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Header Section */}
            <div className="mb-2">
                <HeaderCard
                    title="Company Profile"
                    description="Manage company details and information"
                    icon={<Building2 className="h-6 w-6" />}
                    gradientFrom="from-blue-600"
                    gradientTo="to-cyan-600"
                    showActionArea={true}
                    actionArea={false}
                />
            </div>

            {/* Form Section */}
            <CompanyForm initialData={data || undefined} />
        </div>
    );
}