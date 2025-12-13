"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeProvider } from "@/components/providers/theme-provider"; // Import ThemeProvider

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        // Wrap everything with ThemeProvider
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">

                {/* ==================== 1. SIDEBAR (DESKTOP) ==================== */}
                <div className="hidden md:flex md:w-64 flex-col fixed inset-y-0 z-50">
                    <Sidebar />
                </div>

                {/* ==================== 2. SIDEBAR (MOBILE DRAWER) ==================== */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                                className="fixed inset-0 bg-black z-40 md:hidden"
                            />

                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl md:hidden"
                            >
                                <Sidebar />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ==================== 3. MAIN CONTENT AREA ==================== */}
                <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">

                    {/* NAVBAR */}
                    <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

                    {/* PAGE CONTENT */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        <div className="w-full"> {/* <--- Ubah jadi w-full */}
                            {children}
                        </div>
                    </main>
                </div>

            </div>
        </ThemeProvider>
    );
}