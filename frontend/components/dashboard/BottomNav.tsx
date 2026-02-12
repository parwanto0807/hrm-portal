"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    FileText,
    CreditCard,
    MapPin,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: "Absensi", icon: Calendar, href: "/dashboard/attendance" },
        { label: "Pengajuan", icon: FileText, href: "/dashboard/leaves" },
        { label: "Check In", icon: MapPin, href: "/dashboard/check-in", isProminent: true },
        { label: "Slip Gaji", icon: CreditCard, href: "/dashboard/payroll" },
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    ];

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 md:hidden flex items-center justify-around px-2 pb-safe">
            {navItems.map((item, i) => {
                const isActive = pathname === item.href;

                if (item.isProminent) {
                    return (
                        <Link
                            key={i}
                            href={item.href}
                            className="relative -top-5 flex flex-col items-center gap-1 group"
                        >
                            <div className={cn(
                                "h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                                "bg-gradient-to-br from-indigo-600 to-blue-700 text-white",
                                "ring-4 ring-white dark:ring-gray-950 group-active:scale-90",
                                isActive && "from-emerald-500 to-teal-600 shadow-emerald-200 dark:shadow-emerald-900/20"
                            )}>
                                <item.icon size={28} strokeWidth={2.5} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest mt-1",
                                isActive ? "text-emerald-600" : "text-indigo-600"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                }

                const isDashboard = item.label === "Dashboard";
                const activeColor = isDashboard ? "text-emerald-600" : "text-sky-600";
                const activeBg = isDashboard ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-sky-50 dark:bg-sky-900/20";

                return (
                    <Link
                        key={i}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-all duration-300",
                            isActive ? activeColor : "text-gray-400"
                        )}
                    >
                        <div className={cn(
                            "relative p-2 rounded-xl transition-all duration-300",
                            isActive && activeBg
                        )}>
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
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

