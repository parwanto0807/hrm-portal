// components/providers/ClientProviders.tsx
"use client"

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "./theme-provider";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import PWAInstallPrompt from "@/components/PWAInstallPrompt";

interface ClientProvidersProps {
    children: React.ReactNode;
    googleClientId?: string;
}

export default function ClientProviders({
    children,
    googleClientId
}: ClientProvidersProps) {
    // State untuk cek apakah sudah mounted
    const [mounted, setMounted] = useState(false);

    // Create QueryClient instance
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                refetchOnWindowFocus: false,
            },
        },
    }));

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // Render minimal version sebelum mounted
    // Ini mencegah blank screen
    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    // Setelah mounted, render full providers
    if (!googleClientId) {
        return (
            <QueryClientProvider client={queryClient}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <PWAInstallPrompt />
                </ThemeProvider>
            </QueryClientProvider>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <GoogleOAuthProvider clientId={googleClientId}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <PWAInstallPrompt />
                </ThemeProvider>
            </GoogleOAuthProvider>
        </QueryClientProvider>
    );
}