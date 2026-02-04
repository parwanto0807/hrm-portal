"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    DollarSign,
    Settings,
    Bell,
    HelpCircle,
    BarChart3
} from 'lucide-react';
import LogoutButton from '../auth/LogoutButton';
import { useAuth } from '@/app/hooks/useAuth';
import Image from 'next/image';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Karyawan', href: '/dashboard/employees' },
    { icon: Calendar, label: 'Absensi', href: '/dashboard/attendance' },
    { icon: FileText, label: 'Pengajuan', href: '/dashboard/leaves' },
    { icon: DollarSign, label: 'Payroll', href: '/dashboard/payroll' },
    { icon: BarChart3, label: 'Laporan', href: '/dashboard/reports' },
    { icon: Bell, label: 'Notifikasi', href: '/dashboard/notifications' },
    { icon: Settings, label: 'Pengaturan', href: '/dashboard/settings' },
    { icon: HelpCircle, label: 'Bantuan', href: '/dashboard/help' },
];

export const Sidebar = () => {
    const pathname = usePathname();
    const { getUser } = useAuth();
    const [mounted, setMounted] = useState(false);

    // Only access user data on client side
    const user = mounted ? getUser() : null;

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // Helper to check active state
    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(path);
    };

    const getUserInitials = () => {
        if (!user) return 'U';
        if (user.name) return user.name.charAt(0).toUpperCase();
        if (user.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    };

    return (
        <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-gray-900 dark:text-white">Axon HRM</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Enterprise Edition</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {menuItems.map((item, index) => {
                        const active = isActive(item.href);
                        return (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                        ${active
                                            ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }
                                    `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                    {active && (
                                        <div className="ml-auto w-2 h-2 bg-sky-500 rounded-full"></div>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-sky-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        {mounted && user?.image ? (
                            <Image
                                src={user.image}
                                alt={user.name || 'User'}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white font-bold">{getUserInitials()}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user?.role || 'Employee'}
                        </p>
                    </div>
                    <LogoutButton variant="ghost" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-500 dark:text-gray-400" />
                </div>
            </div>
        </div>
    );
};