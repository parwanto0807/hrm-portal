"use client";

import React from "react";
import { Hammer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ConstructionPageProps {
    title?: string;
    description?: string;
}

export default function ConstructionPage({
    title = "Under Construction",
    description = "Halaman ini sedang dalam tahap pengembangan. Silakan kembali lagi nanti."
}: ConstructionPageProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Hammer className="w-10 h-10 text-amber-600 dark:text-amber-500 animate-pulse" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    {description}
                </p>

                <div className="flex gap-3 justify-center">
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Ke Dashboard
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="mt-8 text-sm text-gray-400">
                © 2025 HR Management System
            </div>
        </div>
    );
}
