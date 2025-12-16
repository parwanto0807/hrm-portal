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

export default function UserProfileDropdown({ user, isDarkMode, toggleDarkMode }: UserProfileDropdownProps) {
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
            name: 'Account Settings',
            href: '/dashboard/settings',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
            badge: null
        },
        {
            name: 'Team Members',
            href: '/dashboard/team',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.197h-5.197a4 4 0 01-3.599-2.257l-.955-1.914A4 4 0 007.697 2H4.5A2.5 2.5 0 002 4.5v15A2.5 2.5 0 004.5 22h15a2.5 2.5 0 002.5-2.5v-15A2.5 2.5 0 0019.5 2z',
            badge: '3'
        },
        {
            name: 'Documents',
            href: '/dashboard/documents',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            badge: '12'
        },
        {
            name: 'Help & Support',
            href: '/dashboard/help',
            icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            badge: null
        }
    ];

    // Quick stats for user
    const userStats = [
        { label: 'Projects', value: '12' },
        { label: 'Tasks', value: '24' },
        { label: 'Teams', value: '3' }
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

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            {userStats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                                </div>
                            ))}
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

                        {/* Theme Toggle and Logout */}
                        <div className="space-y-1">
                            <button
                                onClick={toggleDarkMode}
                                className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        {isDarkMode ? (
                                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                    </span>
                                </div>
                                <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${isDarkMode ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </button>

                            <Link
                                href="/dashboard/integrations"
                                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Integrations</span>
                                </div>
                                <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">New</span>
                            </Link>

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