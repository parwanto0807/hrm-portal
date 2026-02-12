
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('--- START SEEDING ---');

  // 1. SEED SUPER ADMIN USER
  console.log('Seeding Super Admin...');
  const adminEmail = 'admin@hrm.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminPassword = hashedPassword; 

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      role: 'SUPER_ADMIN',
      name: 'Super Administrator',
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      role: 'SUPER_ADMIN',
      name: 'Super Administrator',
    },
  });

  console.log(`✅ Admin user created/updated: ${admin.email}`);


  // 2. SEED MENUS
  console.log('Seeding Menus...');
  const menus = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
      order: 1,
      groupLabel: 'Menu Utama',
      roles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'EMPLOYEE'],
    },
    {
      label: 'Absensi Saya',
      href: '/dashboard/attendance/my-attendance',
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
      label: 'Lihat Slip Gaji',
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
      label: 'Management Pengajuan',
      href: '/dashboard/management-pengajuan',
      icon: 'FileText',
      order: 6,
      groupLabel: 'HR Management',
      roles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'],
    },
    {
      label: 'Pengaturan Sistem',
      href: '/dashboard/settings',
      icon: 'Settings',
      order: 99,
      groupLabel: 'System',
      roles: ['SUPER_ADMIN'],
    },
    {
      label: 'User Roles & History',
      href: '/dashboard/settings/system/user-roles',
      icon: 'ShieldAlert',
      order: 1,
      groupLabel: 'System',
      roles: ['SUPER_ADMIN'],
    },
  ];

  for (const menuData of menus) {
    const menu = await prisma.menu.upsert({
      where: { id: (await prisma.menu.findFirst({ where: { label: menuData.label, href: menuData.href } }))?.id || '00000000-0000-0000-0000-000000000000' },
      update: {
        icon: menuData.icon,
        order: menuData.order,
        groupLabel: menuData.groupLabel,
      },
      create: {
        label: menuData.label,
        href: menuData.href,
        icon: menuData.icon,
        order: menuData.order,
        groupLabel: menuData.groupLabel,
      },
    });

    console.log(`Processing relations for menu: ${menu.label}`);

    for (const role of menuData.roles) {
      await prisma.roleMenu.upsert({
        where: {
          role_menuId: {
            role: role,
            menuId: menu.id,
          }
        },
        update: {},
        create: {
          role: role,
          menuId: menu.id,
        },
      });
    }
  }

  console.log('✅ Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
