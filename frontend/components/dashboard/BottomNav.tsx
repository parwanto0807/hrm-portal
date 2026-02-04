"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    FileText,
    User,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: "Beranda", icon: LayoutDashboard, href: "/dashboard" },
        { label: "Absensi", icon: Calendar, href: "/dashboard/attendance" },
        { label: "Pengajuan", icon: FileText, href: "/dashboard/leaves" },
        { label: "Slip Gaji", icon: Bell, href: "/dashboard/payroll" }, // Using Bell or DollarSign
        { label: "Profil", icon: User, href: "/dashboard/profile" },
    ];

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 md:hidden flex items-center justify-around px-2">
            {navItems.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={i}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-all duration-300",
                            isActive ? "text-sky-600" : "text-gray-400 group-hover:text-gray-600"
                        )}
                    >
                        <div className={cn(
                            "relative p-1 rounded-xl transition-all duration-300",
                            isActive && "bg-sky-50 dark:bg-sky-900/20"
                        )}>
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            {item.label === "Notifikasi" && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                            )}
                        </div>
                        <span className={cn(
                            "text-[8px] font-bold uppercase tracking-tight",
                            isActive ? "opacity-100" : "opacity-70"
                        )}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
