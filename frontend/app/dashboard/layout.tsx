"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { useAuth } from "@/app/hooks/useAuth";
import { useStore } from "@/app/hooks/use-store";
import { useSidebarToggle } from "@/app/hooks/use-sidebar-toggle";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/dashboard/BottomNav";


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { getUser } = useAuth();
    const user = getUser();
    const sidebar = useStore(useSidebarToggle, (state) => state);

    if (!sidebar) return null;

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar />

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
                                className="fixed inset-0 bg-black/50 z-[60] md:hidden"
                            />

                            {/* Mobile Sidebar */}
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 left-0 z-[70] w-64 md:hidden"
                            >
                                <Sidebar
                                    className="w-full h-full static translate-x-0 bg-background"
                                />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ==================== 3. MAIN CONTENT AREA ==================== */}
                <div className={cn(
                    "flex-1 flex flex-col w-full transition-[margin-left] ease-in-out duration-300",
                    sidebar?.isOpen === false ? "lg:ml-[100px]" : "lg:ml-[280px]"
                )}>
                    {/* NAVBAR */}
                    <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

                    {/* PAGE CONTENT */}
                    <main className="flex-1">
                        <div className="w-full h-full overflow-y-auto">
                            <div className={cn(
                                "min-h-full py-2 px-[2px] md:p-6 lg:p-8"
                            )}>
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            {(user?.role?.toLowerCase() === 'employee') && <BottomNav />}
        </ThemeProvider>
    );
}