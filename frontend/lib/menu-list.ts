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
  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  return [
    {
      groupLabel: "Menu Utama",
      allowedRoles: ["super", "admin", "pic", "user"],
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
          submenus: []
        },
        {
          href: "/dashboard/attendance",
          label: "Absensi",
          active: isActive("/dashboard/attendance"),
          icon: Calendar,
          submenus: []
        },
        {
          href: "/dashboard/leaves",
          label: "Pengajuan",
          active: isActive("/dashboard/leaves"),
          icon: FileText,
          submenus: []
        },
        {
          href: "/dashboard/payroll",
          label: "Payroll",
          active: isActive("/dashboard/payroll"),
          icon: DollarSign,
          submenus: []
        },
        {
          href: "/dashboard/reports",
          label: "Laporan",
          active: isActive("/dashboard/reports"),
          icon: BarChart3,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Sistem",
      allowedRoles: ["super", "admin", "pic", "user"],
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
          submenus: []
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
}
