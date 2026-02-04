import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useStore } from "@/app/hooks/use-store";
import { Menu } from "@/components/dashboard/menu";
import { useSidebarToggle } from "@/app/hooks/use-sidebar-toggle";
import { SidebarToggle } from "@/components/dashboard/sidebar-toggle";
import { useTheme } from "next-themes";

import { useEffect, useState } from "react";

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!sidebar) return null;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-51 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        sidebar.isOpen ? "w-[280px]" : "w-[100px]",
        "bg-background border-r",
        className
      )}
    >
      <SidebarToggle isOpen={sidebar.isOpen} setIsOpen={sidebar.setIsOpen} />

      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto">
        {/* Logo Section */}
        <div className="flex-shrink-0 mb-6">
          <Link href="#" className={cn("group flex items-center gap-3", !sidebar.isOpen && "justify-center")}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 p-0.5">
                <Image
                  src="/icons/axon-hrm-icon-192x192.png"
                  alt="Axon HRM"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Only show ping animation on client */}
              {mounted && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
              )}
            </div>
            {sidebar.isOpen && (
              <div className="flex flex-col">
                <span className="text-[14px] md:text-xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                  Axon HRM
                </span>
                <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Human Resource Management
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-1 overflow-y-auto">
          <Menu
            isOpen={sidebar.isOpen}
            theme={theme === "dark" || theme === "light" ? theme : "light"}
          />
        </div>
      </div>
    </aside>
  );
}