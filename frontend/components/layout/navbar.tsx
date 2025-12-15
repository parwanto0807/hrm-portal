// components/Header.tsx (complete)
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '../auth/LogoutButton';
import { useAuth } from '@/app/hooks/useAuth';
import UserProfileDropdown from '../UserProfileDropdown'; // Komponen baru yang akan kita buat

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileImgError, setMobileImgError] = useState(false);
    const pathname = usePathname();
    const { isAuthenticated, getUser } = useAuth();

    // PERBAIKAN UTAMA:
    // Kita hanya menganggap user login jika komponen sudah mounted di client.
    // Ini memastikan render pertama di client (false) cocok dengan render server (false).
    const isAuth = mounted && isAuthenticated();
    const user = mounted ? getUser() : null;

    // Set mounted after component mounts
    useEffect(() => {
        setMounted(true);

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Handle scroll effect - only on client
    useEffect(() => {
        if (!mounted) return;

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [mounted]);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationOpen && !(event.target as Element).closest('.notification-container')) {
                setNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [notificationOpen]);

    // Toggle dark/light mode
    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Toggle notification dropdown
    const toggleNotifications = () => {
        setNotificationOpen(!notificationOpen);
        // Mark all as read when opening
        if (!notificationOpen) {
            setUnreadCount(0);
        }
    };

    // Sample notification data
    const sampleNotifications = [
        {
            id: 1,
            title: 'New Leave Request',
            message: 'John Doe submitted a leave request for tomorrow',
            time: '5 minutes ago',
            type: 'leave',
            read: false,
            priority: 'high'
        },
        {
            id: 2,
            title: 'Attendance Reminder',
            message: 'Clock-in time missed for 3 employees today',
            time: '1 hour ago',
            type: 'attendance',
            read: false,
            priority: 'medium'
        },
        {
            id: 3,
            title: 'Payroll Processed',
            message: 'Monthly payroll for December has been processed',
            time: '3 hours ago',
            type: 'payroll',
            read: true,
            priority: 'info'
        },
        {
            id: 4,
            title: 'New Employee Onboarded',
            message: 'Sarah Johnson joined the Marketing team',
            time: '1 day ago',
            type: 'employee',
            read: true,
            priority: 'low'
        },
        {
            id: 5,
            title: 'System Update',
            message: 'HRM Pro will undergo maintenance this weekend',
            time: '2 days ago',
            type: 'system',
            read: true,
            priority: 'info'
        }
    ];

    // Calculate unread count
    useEffect(() => {
        const unread = sampleNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
    }, []);

    // Mark all as read
    const markAllAsRead = () => {
        setUnreadCount(0);
        // In real app, you would update the backend here
    };

    // Navigation items
    const navItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
        },
        {
            name: 'Employees',
            href: '/dashboard/employees',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.197h-5.197a4 4 0 01-3.599-2.257l-.955-1.914A4 4 0 007.697 2H4.5A2.5 2.5 0 002 4.5v15A2.5 2.5 0 004.5 22h15a2.5 2.5 0 002.5-2.5v-15A2.5 2.5 0 0019.5 2z'
        },
        {
            name: 'Attendance',
            href: '/dashboard/attendance',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            name: 'Payroll',
            href: '/dashboard/payroll',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            name: 'Reports',
            href: '/dashboard/reports',
            icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        },
    ];

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Don't render scroll-dependent UI until mounted
    const headerClass = mounted
        ? scrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg py-3'
            : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md py-4'
        : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md py-4'; // Default on server

    const headerHeightClass = mounted && scrolled ? 'h-20' : 'h-24';

    // PERBAIKAN: Fungsi untuk mendapatkan initial avatar
    const getUserInitials = () => {
        if (!user) return 'U';
        if (user.name) return user.name.charAt(0).toUpperCase();
        if (user.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    };

    return (
        <>
            {/* Header */}
            <header className={`
                fixed top-0 left-0 right-0 z-50 transition-all duration-300
                ${headerClass}
            `}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo with Animation */}
                        <Link href="/" className="group flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                {/* Only show ping animation on client */}
                                {mounted && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                                    HRM Pro
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Human Resource Management
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation - Clean & Minimal */}
                        {isAuth ? (
                            <div className="hidden lg:flex items-center gap-6">
                                {/* Navigation Items */}
                                <div className="flex items-center gap-1">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`
                                                    relative flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200
                                                    ${isActive
                                                        ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 font-semibold'
                                                        : 'text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }
                                                `}
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                                </svg>
                                                <span className="font-medium">{item.name}</span>
                                                {isActive && (
                                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-sky-500 dark:bg-sky-400 rounded-full"></div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Divider */}
                                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                                >
                                    {isDarkMode ? (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        </svg>
                                    )}
                                </button>

                                {/* Notification Bell with Dropdown */}
                                <div className="relative notification-container">
                                    <button
                                        onClick={toggleNotifications}
                                        className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
                                        aria-label="Notifications"
                                    >
                                        <svg
                                            className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        {unreadCount > 0 && (
                                            <>
                                                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                    <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-500 text-xs font-semibold text-white">
                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                    </span>
                                                </span>
                                            </>
                                        )}
                                    </button>

                                    {/* Notification Dropdown */}
                                    {notificationOpen && (
                                        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 animate-in slide-in-from-top-5 duration-300">
                                            {/* Header */}
                                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            Notifications
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {unreadCount > 0
                                                                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                                                : 'All caught up!'
                                                            }
                                                        </p>
                                                    </div>
                                                    {unreadCount > 0 && (
                                                        <button
                                                            onClick={markAllAsRead}
                                                            className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 px-3 py-1 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
                                                        >
                                                            Mark all as read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Notification List */}
                                            <div className="max-h-[400px] overflow-y-auto">
                                                {sampleNotifications.length > 0 ? (
                                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                                        {sampleNotifications.map((notification) => (
                                                            <div
                                                                key={notification.id}
                                                                className={`
                                                                    p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200
                                                                    ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                                                                `}
                                                            >
                                                                <div className="flex gap-3">
                                                                    {/* Notification Icon */}
                                                                    <div className={`
                                                                        flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                                                                        ${notification.priority === 'high'
                                                                            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                                                            : notification.priority === 'medium'
                                                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                                                                : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                                                                        }
                                                                    `}>
                                                                        {notification.type === 'leave' && (
                                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                            </svg>
                                                                        )}
                                                                        {notification.type === 'attendance' && (
                                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                        )}
                                                                        {notification.type === 'payroll' && (
                                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                        )}
                                                                        {notification.type === 'employee' && (
                                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.197h-5.197a4 4 0 01-3.599-2.257l-.955-1.914A4 4 0 007.697 2H4.5A2.5 2.5 0 002 4.5v15A2.5 2.5 0 004.5 22h15a2.5 2.5 0 002.5-2.5v-15A2.5 2.5 0 0019.5 2z" />
                                                                            </svg>
                                                                        )}
                                                                        {notification.type === 'system' && (
                                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            </svg>
                                                                        )}
                                                                    </div>

                                                                    {/* Notification Content */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <div>
                                                                                <h4 className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                                    {notification.title}
                                                                                </h4>
                                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                                                    {notification.message}
                                                                                </p>
                                                                            </div>
                                                                            {!notification.read && (
                                                                                <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 mt-1"></div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center justify-between mt-2">
                                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                {notification.time}
                                                                            </span>
                                                                            <button className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                                                                                View details
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-8 text-center">
                                                        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                            </svg>
                                                        </div>
                                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                            No notifications
                                                        </h4>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            You're all caught up! Check back later for updates.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                                <Link
                                                    href="/notifications"
                                                    className="block w-full text-center py-2.5 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                                                    onClick={() => setNotificationOpen(false)}
                                                >
                                                    View all notifications
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* User Profile Dropdown */}
                                {mounted && user && (
                                    <UserProfileDropdown
                                        user={user}
                                        isDarkMode={isDarkMode}
                                        toggleDarkMode={toggleDarkMode}
                                    />
                                )}
                            </div>
                        ) : (
                            // Not authenticated state - Desktop
                            <div className="hidden lg:flex items-center gap-4">
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {isDarkMode ? (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        </svg>
                                    )}
                                </button>
                                <Link
                                    href="/login"
                                    className="px-5 py-2.5 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                                >
                                    Get Started Free
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button with Animation */}
                        <div className="flex lg:hidden items-center gap-3">
                            {/* Theme Toggle Mobile */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                {isDarkMode ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            {isAuth && (
                                <>
                                    {/* Mobile Notification */}
                                    <div className="relative notification-container">
                                        <button
                                            onClick={toggleNotifications}
                                            className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                                            )}
                                        </button>

                                        {/* Mobile Notification Dropdown */}
                                        {notificationOpen && (
                                            <div className="fixed inset-0 z-50 lg:hidden">
                                                {/* Backdrop */}
                                                <div
                                                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                                    onClick={() => setNotificationOpen(false)}
                                                ></div>

                                                {/* Dropdown */}
                                                <div className="absolute top-20 right-4 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in slide-in-from-top-5 duration-300">
                                                    {/* Header */}
                                                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                    Notifications
                                                                </h3>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {unreadCount > 0
                                                                        ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                                                        : 'All caught up!'
                                                                    }
                                                                </p>
                                                            </div>
                                                            {unreadCount > 0 && (
                                                                <button
                                                                    onClick={markAllAsRead}
                                                                    className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 px-3 py-1 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
                                                                >
                                                                    Mark all as read
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Notification List */}
                                                    <div className="max-h-[400px] overflow-y-auto">
                                                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                                            {sampleNotifications.map((notification) => (
                                                                <div
                                                                    key={notification.id}
                                                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                                                                >
                                                                    <div className="flex gap-3">
                                                                        {/* Notification Icon */}
                                                                        <div className={`
                                                                            flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                                                                            ${notification.priority === 'high'
                                                                                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                                                                : notification.priority === 'medium'
                                                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                                                                    : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                                                                            }
                                                                        `}>
                                                                            {notification.type === 'leave' && (
                                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                </svg>
                                                                            )}
                                                                            {notification.type === 'attendance' && (
                                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                            )}
                                                                            {notification.type === 'payroll' && (
                                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                            )}
                                                                            {notification.type === 'employee' && (
                                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.197h-5.197a4 4 0 01-3.599-2.257l-.955-1.914A4 4 0 007.697 2H4.5A2.5 2.5 0 002 4.5v15A2.5 2.5 0 004.5 22h15a2.5 2.5 0 002.5-2.5v-15A2.5 2.5 0 0019.5 2z" />
                                                                                </svg>
                                                                            )}
                                                                            {notification.type === 'system' && (
                                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                </svg>
                                                                            )}
                                                                        </div>

                                                                        {/* Notification Content */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <div>
                                                                                    <h4 className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                                        {notification.title}
                                                                                    </h4>
                                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                                                        {notification.message}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center justify-between mt-2">
                                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                    {notification.time}
                                                                                </span>
                                                                                <button className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                                                                                    View details
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                                        <Link
                                                            href="/notifications"
                                                            className="block w-full text-center py-2.5 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                                                            onClick={() => setNotificationOpen(false)}
                                                        >
                                                            View all notifications
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Avatar */}
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-sky-400 to-emerald-500 flex items-center justify-center text-white font-semibold shadow-lg">
                                            {user?.image && !mobileImgError ? (
                                                <img
                                                    src={user.image}
                                                    alt={user.name || 'User'}
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                    onError={() => setMobileImgError(true)}
                                                />
                                            ) : (
                                                user ? getUserInitials() : 'U'
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Hamburger Menu Button */}
                            <button
                                onClick={() => {
                                    if (onMenuClick) {
                                        onMenuClick();
                                    } else {
                                        setMobileMenuOpen(!mobileMenuOpen);
                                    }
                                }}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Toggle menu"
                            >
                                <div className="relative w-6 h-6">
                                    <span className={`
                                        absolute left-0 top-1.5 w-6 h-0.5 bg-current rounded-full transition-all duration-300
                                        ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}
                                    `}></span>
                                    <span className={`
                                        absolute left-0 top-3 w-6 h-0.5 bg-current rounded-full transition-all duration-300
                                        ${mobileMenuOpen ? 'opacity-0' : ''}
                                    `}></span>
                                    <span className={`
                                        absolute left-0 top-4.5 w-6 h-0.5 bg-current rounded-full transition-all duration-300
                                        ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}
                                    `}></span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Overlay */}
            <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                <div className={`absolute top-20 right-4 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
                    {isAuth ? (
                        <>
                            {/* User Info Expanded (Mobile Menu) */}
                            <div className="p-6 bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-lg border-2 border-white dark:border-gray-700 bg-gradient-to-r from-sky-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xl">
                                        {user?.image && !mobileImgError ? (
                                            <img
                                                src={user.image}
                                                alt={user.name || 'User'}
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                                onError={() => setMobileImgError(true)}
                                            />
                                        ) : (
                                            user ? getUserInitials() : 'U'
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
                                        <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mt-1">{user?.role || 'Employee'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 overflow-y-auto max-h-[calc(100vh-250px)]">
                                {/* Nav Items */}
                                <div className="space-y-1">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => setMobileMenuOpen(false)}>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                                                <span className="font-medium">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                <div className="my-4 border-t border-gray-100 dark:border-gray-800"></div>

                                {/* RESTORED: Mobile Menu Links & Theme Toggle */}
                                <div className="space-y-1">
                                    <button onClick={toggleDarkMode} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                        {isDarkMode ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                <span className="font-medium">Light Mode</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                                <span className="font-medium">Dark Mode</span>
                                            </>
                                        )}
                                    </button>

                                    <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        <span className="font-medium">My Profile</span>
                                    </Link>

                                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span className="font-medium">Settings</span>
                                    </Link>

                                    <Link href="/dashboard/help" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="font-medium">Help & Support</span>
                                    </Link>

                                    <div className="pt-2">
                                        <LogoutButton className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-6">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Welcome to HRM Pro</h3>
                                <p className="text-gray-600 dark:text-gray-400">Sign in to manage your HR operations</p>
                            </div>
                            <div className="space-y-4">
                                <Link href="/login" className="block w-full text-center py-3 text-sky-600 dark:text-sky-400 font-medium hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                                <Link href="/signup" className="block w-full text-center py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>Get Started Free</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add padding for fixed header */}
            <div className={headerHeightClass}></div>
        </>
    );
}