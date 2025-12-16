"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const PWAInstallPrompt = dynamic(() => import('@/components/PWAInstallPrompt'), {
    ssr: false,
});

export default function ClientProviders({
    children,
    googleClientId,
}: {
    children: React.ReactNode;
    googleClientId?: string;
}) {
    if (!googleClientId) {
        return <>{children}</>;
    }

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // During SSR/Hydration, render children directly to match server HTML
    // This prevents GoogleOAuthProvider from injecting scripts before hydration is complete
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            {children}
            <PWAInstallPrompt />
        </GoogleOAuthProvider>
    );
}
