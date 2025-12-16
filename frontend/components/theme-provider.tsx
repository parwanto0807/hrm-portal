"use client"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    // Tambahkan state untuk cek apakah component sudah mounted
    const [mounted, setMounted] = React.useState(false)

    // Set mounted menjadi true setelah component di-render di client
    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Sebelum mounted, render children tanpa ThemeProvider
    // Ini mencegah hydration mismatch error
    if (!mounted) {
        return <>{children}</>
    }

    // Setelah mounted, baru render dengan ThemeProvider
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
