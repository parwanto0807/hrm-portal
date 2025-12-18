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
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Building2, AlertCircle, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CompanyForm from "@/components/settings/company/CompanyFormWithValidation";
import HeaderCard from "@/components/ui/header-card";
import SearchInput from "@/components/ui/SearchInput";

export default function CompanyPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search state (placeholder functionality)
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setIsSearching(true);
        // Simulate search delay
        setTimeout(() => {
            setIsSearching(false);
        }, 500);
        console.log("Searching for:", term);
    };

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
                console.error("Error fetching company data:", err);
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
        <div className="w-full">
            {/* Breadcrumb Section Wrapped with Badge Style */}
            <nav aria-label="Breadcrumb" className="px-2 py-2 sm:px-4">
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
                <div className="px-2 sm:px-4 mb-4">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Header Section */}
            <div className="mb-2 px-2 sm:px-4 md:px-4">
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
            <CompanyForm initialData={data} />
        </div>
    );
}