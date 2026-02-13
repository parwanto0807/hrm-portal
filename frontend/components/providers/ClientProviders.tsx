// components/providers/ClientProviders.tsx
"use client"

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "./theme-provider";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { requestNotificationPermission, onMessageListener } from "@/lib/firebase";
import { toast } from "sonner";
import { AxonLoader } from "@/components/ui/AxonLoader";

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

    // Firebase Messaging
    useEffect(() => {
        if (mounted) {
            // Request permission
            requestNotificationPermission();

            // Set up foreground listener
            const unsubscribe = onMessageListener((payload: any) => {

                if (payload?.notification) {
                    toast(payload.notification.title || 'New Notification', {
                        description: payload.notification.body,
                    });
                }
            });

            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [mounted]);

    // Render AxonLoader sebelum mounted untuk mencegah blank screen/Generic Loading text
    if (!mounted) {
        return <AxonLoader />;
    }

    const content = (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <PWAInstallPrompt />
        </ThemeProvider>
    );

    // Setelah mounted, render full providers
    return (
        <QueryClientProvider client={queryClient}>
            {googleClientId ? (
                <GoogleOAuthProvider clientId={googleClientId}>
                    {content}
                </GoogleOAuthProvider>
            ) : content}
        </QueryClientProvider>
    );
}