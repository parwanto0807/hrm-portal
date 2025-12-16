"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '../auth/LogoutButton';
import { useAuth } from '@/app/hooks/useAuth';
import UserProfileDropdown from '../UserProfileDropdown';
import NotificationBell from '../NotificationDropdown';


export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mobileImgError, setMobileImgError] = useState(false);
    const pathname = usePathname();

    const { isAuthenticated, getUser, isLoading } = useAuth();

    // PERBAIKAN 1: Gunakan useMemo untuk menghindari perubahan referensi
    const [authState, setAuthState] = useState<{
        isAuth: boolean;
        user: any | null;
    }>({
        isAuth: false,
        user: null,
    });

    // PERBAIKAN 2: Dapatkan nilai auth sekali dan gunakan dependency yang tepat
    const authCheck = useCallback(() => {
        if (mounted && !isLoading()) {
            const isAuth = isAuthenticated();
            const user = getUser();

            // Hanya update jika ada perubahan
            setAuthState(prev => {
                if (prev.isAuth === isAuth && prev.user === user) {
                    return prev;
                }
                return {
                    isAuth,
                    user,
                };
            });
        }
    }, [mounted, isLoading, isAuthenticated, getUser]);

    // PERBAIKAN 3: Efek untuk auth check dengan kondisi yang benar
    useEffect(() => {
        authCheck();
    }, [authCheck]); // Hanya depend pada authCheck yang stabil

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

        // Listen untuk auth changes dari komponen lain
        const handleAuthChange = () => {
            authCheck();
        };

        window.addEventListener('auth-change', handleAuthChange);
        window.addEventListener('storage', handleAuthChange);

        return () => {
            window.removeEventListener('auth-change', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, [authCheck]);

    // Handle scroll effect
    useEffect(() => {
        if (!mounted) return;

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, [mounted]);

    // Toggle dark/light mode
    const toggleDarkMode = useCallback(() => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // PERBAIKAN 4: Gunakan useMemo untuk computed values
    const headerClass = useMemo(() => {
        if (!mounted) return 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md py-4';
        return scrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg py-3'
            : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md py-4';
    }, [mounted, scrolled]);

    const headerHeightClass = useMemo(() =>
        mounted && scrolled ? 'h-20' : 'h-24',
        [mounted, scrolled]
    );

    // Navigation items - PERBAIKAN: Pindah ke useMemo
    const navItems = useMemo(() => [
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
    ], []);

    // Fungsi untuk mendapatkan initial avatar
    const getUserInitials = useCallback(() => {
        const user = authState.user;
        if (!user) return 'U';
        if (user.name) return user.name.charAt(0).toUpperCase();
        if (user.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    }, [authState.user]);

    // PERBAIKAN 5: Render skeleton saat loading
    if (!mounted || isLoading()) {
        return <HeaderSkeleton />;
    }

    // PERBAIKAN: Pastikan hydration stabil
    const isAuth = mounted && authState.isAuth;
    const user = mounted ? authState.user : null;

    return (
        <>
            {/* Header */}
            <header
                suppressHydrationWarning
                className={`
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
                                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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

                                {/* Notification Bell */}
                                <NotificationBell isMobile={false} />

                                {/* User Profile Dropdown */}
                                {user && (
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
                                    <NotificationBell isMobile={true} />

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
                                                getUserInitials()
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
                                            getUserInitials()
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
                                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                                </svg>
                                                <span className="font-medium">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                <div className="my-4 border-t border-gray-100 dark:border-gray-800"></div>

                                {/* Mobile Menu Links & Theme Toggle */}
                                <div className="space-y-1">
                                    <button
                                        onClick={toggleDarkMode}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        {isDarkMode ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                <span className="font-medium">Light Mode</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                </svg>
                                                <span className="font-medium">Dark Mode</span>
                                            </>
                                        )}
                                    </button>

                                    <Link
                                        href="/dashboard/profile"
                                        className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="font-medium">My Profile</span>
                                    </Link>

                                    <Link
                                        href="/dashboard/settings"
                                        className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="font-medium">Settings</span>
                                    </Link>

                                    <Link
                                        href="/dashboard/help"
                                        className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
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
                                <Link
                                    href="/login"
                                    className="block w-full text-center py-3 text-sky-600 dark:text-sky-400 font-medium hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="block w-full text-center py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Get Started Free
                                </Link>
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

// Skeleton Component
function HeaderSkeleton() {
    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md py-4">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Skeleton Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                            <div className="flex flex-col gap-2">
                                <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        </div>

                        {/* Skeleton Right Side */}
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex items-center gap-4">
                                <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                            </div>
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </header>
            <div className="h-24"></div>
        </>
    );
}