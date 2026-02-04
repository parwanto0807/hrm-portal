
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding menus...');

  // 1. Clear existing menus to avoid duplicates (optional, for dev)
  // await prisma.roleMenu.deleteMany({});
  // await prisma.menu.deleteMany({});

  // --- DEFINE MENUS ---
  const menus = [
    // === COMMON / DASHBOARD ===
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
      order: 1,
      groupLabel: 'Menu Utama',
      roles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'EMPLOYEE'],
    },
    
    // === EMPLOYEE SPECIFIC ===
    {
      label: 'Absensi Saya',
      href: '/dashboard/attendance/my-attendance', // Specific route for employee
      icon: 'Calendar',
      order: 2,
      groupLabel: 'Aktivitas',
      roles: ['EMPLOYEE'],
    },
    {
      label: 'Pengajuan Cuti',
      href: '/dashboard/leaves/request',
      icon: 'FileText',
      order: 3,
      groupLabel: 'Aktivitas',
      roles: ['EMPLOYEE'],
    },
    {
      label: 'Lihat Slip Gaji', // NEW REQUEST
      href: '/dashboard/payroll/my-slip',
      icon: 'DollarSign',
      order: 4,
      groupLabel: 'Keuangan',
      roles: ['EMPLOYEE'],
    },
    {
      label: 'Profil Saya',
      href: '/dashboard/profile',
      icon: 'User',
      order: 5,
      groupLabel: 'Akun',
      roles: ['EMPLOYEE'],
    },

    // === ADMIN / HR MANAGER ===
    {
      label: 'Data Karyawan',
      href: '/dashboard/employees',
      icon: 'Users',
      order: 2,
      groupLabel: 'HR Management',
      roles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'],
    },
    {
      label: 'Manajemen Absensi',
      href: '/dashboard/attendance',
      icon: 'CalendarRange',
      order: 3,
      groupLabel: 'HR Management',
      roles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'],
    },
    {
      label: 'Payroll Processing',
      href: '/dashboard/payroll',
      icon: 'Banknote',
      order: 4,
      groupLabel: 'Finance',
      roles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'],
    },
    {
      label: 'Laporan',
      href: '/dashboard/reports',
      icon: 'BarChart3',
      order: 5,
      groupLabel: 'Analisis',
      roles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'],
    },
    {
      label: 'Pengaturan Sistem',
      href: '/dashboard/settings',
      icon: 'Settings',
      order: 99,
      groupLabel: 'System',
      roles: ['SUPER_ADMIN', 'ADMIN'], // Restricted settings
    },
  ];

  for (const menuData of menus) {
    // Create Menu
    const menu = await prisma.menu.create({
      data: {
        label: menuData.label,
        href: menuData.href,
        icon: menuData.icon,
        order: menuData.order,
        groupLabel: menuData.groupLabel,
      },
    });

    console.log(`Created menu: ${menu.label}`);

    // Create Role Assignments
    for (const role of menuData.roles) {
      await prisma.roleMenu.create({
        data: {
          role: role,
          menuId: menu.id,
        },
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
