import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Bell,
  Settings,
  HelpCircle
} from "lucide-react";

import {
  MenuGroup
} from "@/types/menu";

export function getMenuList(pathname: string, role: string): MenuGroup[] {
  const userRole = role?.toUpperCase() || "GUEST";

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  const allGroups: MenuGroup[] = [
    {
      groupLabel: "Menu Utama",
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "DEPARTMENT_MANAGER", "EMPLOYEE", "GUEST"],
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: isActive("/dashboard"),
          icon: LayoutDashboard,
          submenus: []
        },
        {
          href: "/dashboard/employees",
          label: "Karyawan",
          active: isActive("/dashboard/employees"),
          icon: Users,
          submenus: [],
          roles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"]
        },
        {
          href: "/dashboard/check-in",
          label: "Absensi",
          active: isActive("/dashboard/check-in"),
          icon: Calendar,
          submenus: [],
          roles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "DEPARTMENT_MANAGER", "EMPLOYEE"]
        },
        {
          href: "/dashboard/leaves",
          label: "Pengajuan",
          active: isActive("/dashboard/leaves"),
          icon: FileText,
          submenus: [],
          roles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "DEPARTMENT_MANAGER", "EMPLOYEE"]
        },
        {
          href: "/dashboard/management-pengajuan",
          label: "Management Pengajuan",
          active: isActive("/dashboard/management-pengajuan"),
          icon: FileText,
          submenus: [],
          roles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"]
        },
        {
          href: "/dashboard/payroll",
          label: userRole === "EMPLOYEE" ? "Lihat Slip Gaji" : "Payroll",
          active: isActive("/dashboard/payroll"),
          icon: DollarSign,
          submenus: [],
          roles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "EMPLOYEE"]
        },
        {
          href: "/dashboard/reports",
          label: "Laporan",
          active: isActive("/dashboard/reports"),
          icon: BarChart3,
          submenus: [],
          roles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"]
        }
      ]
    },
    {
      groupLabel: "Sistem",
      allowedRoles: ["SUPER_ADMIN"],
      menus: [
        {
          href: "/dashboard/notifications",
          label: "Notifikasi",
          active: isActive("/dashboard/notifications"),
          icon: Bell,
          submenus: []
        },
        {
          href: "/dashboard/settings",
          label: "Pengaturan",
          active: isActive("/dashboard/settings"),
          icon: Settings,
          submenus: [],
          roles: ["SUPER_ADMIN", "ADMIN"]
        },
        {
          href: "/dashboard/help",
          label: "Bantuan",
          active: isActive("/dashboard/help"),
          icon: HelpCircle,
          submenus: []
        }
      ]
    }
  ];

  return allGroups
    .filter(group => !group.allowedRoles || group.allowedRoles.includes(userRole))
    .map(group => ({
      ...group,
      menus: group.menus.filter(menu => {
        if (!menu.roles) return true; // Default to all if not specified
        return menu.roles.includes(userRole);
      })
    }));
}
