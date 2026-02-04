import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  type LucideIcon
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  allowedRoles: string[];
  menus: Menu[];
};

export function getMenuList(pathname: string, role: string): Group[] {
  const userRole = role?.toUpperCase() || "GUEST";

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  const allGroups: Group[] = [
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
          // @ts-ignore - added custom property for filtering
          roles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"]
        },
        {
          href: "/dashboard/attendance",
          label: "Absensi",
          active: isActive("/dashboard/attendance"),
          icon: Calendar,
          submenus: [],
          // @ts-ignore
          roles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "DEPARTMENT_MANAGER", "EMPLOYEE"]
        },
        {
          href: "/dashboard/leaves",
          label: "Pengajuan",
          active: isActive("/dashboard/leaves"),
          icon: FileText,
          submenus: [],
          // @ts-ignore
          roles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "DEPARTMENT_MANAGER", "EMPLOYEE"]
        },
        {
          href: "/dashboard/payroll",
          label: userRole === "EMPLOYEE" ? "Lihat Slip Gaji" : "Payroll",
          active: isActive("/dashboard/payroll"),
          icon: DollarSign,
          submenus: [],
          // @ts-ignore
          roles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "EMPLOYEE"]
        },
        {
          href: "/dashboard/reports",
          label: "Laporan",
          active: isActive("/dashboard/reports"),
          icon: BarChart3,
          submenus: [],
          // @ts-ignore
          roles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"]
        }
      ]
    },
    {
      groupLabel: "Sistem",
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "DEPARTMENT_MANAGER", "EMPLOYEE", "GUEST"],
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
          // @ts-ignore
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

  // Filter groups and their menus based on role
  return allGroups
    .filter(group => group.allowedRoles.includes(userRole))
    .map(group => ({
      ...group,
      menus: group.menus.filter(menu => {
        // @ts-ignore
        if (!menu.roles) return true; // Default to all if not specified
        // @ts-ignore
        return menu.roles.includes(userRole);
      })
    }));
}
