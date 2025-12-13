"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
    const context = useNextTheme()

    const toggleTheme = React.useCallback(() => {
        const current = context.theme === 'light' ? context.resolvedTheme : context.theme
        context.setTheme(current === 'dark' ? 'light' : 'dark')
    }, [context])

    return { ...context, toggleTheme }
}