"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeProvider } from "@/components/providers/theme-provider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* ==================== 1. SIDEBAR (DESKTOP) ==================== */}
                <div className="hidden md:block fixed inset-y-0 left-0 z-50 w-64">
                    <Sidebar />
                </div>

                {/* ==================== 2. SIDEBAR (MOBILE DRAWER) ==================== */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                                className="fixed inset-0 bg-black z-40 md:hidden"
                            />

                            {/* Mobile Sidebar */}
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
                            >
                                <Sidebar />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ==================== 3. MAIN CONTENT AREA ==================== */}
                <div className="flex-1 flex flex-col w-full md:ml-64">
                    {/* NAVBAR */}
                    <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

                    {/* PAGE CONTENT */}
                    <main className="flex-1">
                        <div className="w-full h-full overflow-y-auto">
                            <div className="min-h-full p-4 md:p-6 lg:p-8">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
}