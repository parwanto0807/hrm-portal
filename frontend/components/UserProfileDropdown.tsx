"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './auth/LogoutButton';


interface UserProfileDropdownProps {
    user: {
        name?: string;
        email?: string;
        image?: string;
        role?: string;
    };
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export default function UserProfileDropdown({ user }: Omit<UserProfileDropdownProps, 'isDarkMode' | 'toggleDarkMode'>) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [imgError, setImgError] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && dropdownOpen) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [dropdownOpen]);

    // Close dropdown on route change
    useEffect(() => {
        setDropdownOpen(false);
    }, [pathname]);

    // Get user initials for avatar fallback
    const getUserInitials = () => {
        if (!user) return 'U';
        if (user.name) return user.name.charAt(0).toUpperCase();
        if (user.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    };

    // Navigation items for dropdown
    const dropdownItems = [
        {
            name: 'My Profile',
            href: '/dashboard/profile',
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            badge: null
        },
        {
            name: 'Help & Support',
            href: '/dashboard/help',
            icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            badge: null
        }
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            {/* User Avatar Button */}
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group relative"
                aria-label="User menu"
            >
                {/* Avatar Container */}
                <div className="relative">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg group-hover:scale-105 transition-transform duration-300">
                        {user?.image && !imgError ? (
                            <img
                                src={user.image}
                                alt={user.name || 'User'}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-sky-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                                {getUserInitials()}
                            </div>
                        )}
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>

                {/* User Info (Desktop only) */}
                <div className="hidden lg:block text-left">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate max-w-[120px]">
                        {user?.name || 'User Name'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                        {user?.email || 'user@example.com'}
                    </p>
                </div>

                {/* Chevron Icon */}
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>

                {/* Background Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 animate-in slide-in-from-top-5 duration-300">
                    {/* User Profile Header */}
                    <div className="p-6 bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white dark:border-gray-700 shadow-lg bg-gradient-to-r from-sky-500 to-emerald-500">
                                    {user?.image && !imgError ? (
                                        <img
                                            src={user.image}
                                            alt={user.name || 'User'}
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                                            {getUserInitials()}
                                        </div>
                                    )}
                                </div>
                                {/* Status Badge */}
                                <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    PRO
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                    {user?.name || 'User Name'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {user?.email || 'user@example.com'}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300">
                                        {user?.role || 'Employee'}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Last active: Just now
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="p-4 max-h-[400px] overflow-y-auto">
                        <div className="space-y-1">
                            {dropdownItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group/item"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover/item:bg-sky-100 dark:group-hover/item:bg-sky-900/30 transition-colors">
                                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover/item:text-sky-600 dark:group-hover/item:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-sky-600 dark:group-hover/item:text-sky-400">
                                            {item.name}
                                        </span>
                                    </div>
                                    {item.badge && (
                                        <span className="px-2 py-1 text-xs font-bold bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>

                        <div className="my-4 border-t border-gray-100 dark:border-gray-800"></div>

                        {/* Logout */}
                        <div className="space-y-1">
                            <div className="pt-2">
                                <LogoutButton className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>© 2024 HRM Pro</span>
                            <span>v2.1.0</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}