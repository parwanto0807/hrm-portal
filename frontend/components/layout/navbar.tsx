"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import LogoutButton from '../auth/LogoutButton';
import { useAuth } from '@/app/hooks/useAuth';
import UserProfileDropdown from '../UserProfileDropdown';
import NotificationBell from '../NotificationDropdown';
import { useSidebarToggle } from '@/app/hooks/use-sidebar-toggle';
import { useStore } from '@/app/hooks/use-store';
import { getMenuList } from '@/lib/menu-list';
import { cn } from '@/lib/utils';


export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const sidebar = useStore(useSidebarToggle, (state) => state);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mobileImgError, setMobileImgError] = useState(false);
    const pathname = usePathname();

    const { isAuthenticated, getUser, isLoading } = useAuth();

    const [authState, setAuthState] = useState<{
        isAuth: boolean;
        user: any | null;
    }>({
        isAuth: false,
        user: null,
    });

    const authCheck = useCallback(() => {
        if (mounted && !isLoading()) {
            const isAuth = isAuthenticated();
            const user = getUser();

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

    useEffect(() => {
        authCheck();
    }, [authCheck]);

    useEffect(() => {
        setMounted(true);

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

    useEffect(() => {
        if (!mounted) return;

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [mounted]);

    const toggleDarkMode = useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme, setTheme]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const headerClass = useMemo(() => {
        if (!mounted) return 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md py-3';

        const baseClass = scrolled
            ? 'bg-white/97 dark:bg-gray-900/97 backdrop-blur-lg shadow-lg py-2'
            : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md py-3';

        // Calculate dynamic width/position based on sidebar state
        const sidebarClass = sidebar?.isOpen
            ? 'lg:pl-[280px]'
            : 'lg:pl-[100px]';

        return `${baseClass} ${sidebarClass}`;
    }, [mounted, scrolled, sidebar?.isOpen]);

    const headerHeightClass = useMemo(() =>
        mounted && scrolled ? 'h-16' : 'h-20',
        [mounted, scrolled]
    );

    const getUserInitials = useCallback(() => {
        const user = authState.user;
        if (!user) return 'U';
        if (user.name) return user.name.charAt(0).toUpperCase();
        if (user.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    }, [authState.user]);



    // Menu items mapping based on current path
    const getActiveMenuItem = useCallback(() => {
        const userRole = authState.user?.role || 'user'; // Default to user if not available
        const allMenus = getMenuList(pathname, userRole);

        // Flatten menus from all groups
        const flatMenus = allMenus.flatMap(group => group.menus);

        // Find the active menu item based on exact match first, then parent match
        // Note: Sort by href length descending to match most specific route first
        const sortedMenus = [...flatMenus].sort((a, b) => b.href.length - a.href.length);

        const activeItem = sortedMenus.find(item => {
            if (item.href === '/dashboard' && pathname === '/dashboard') return true;
            // Handle root dashboard specifically to avoid broad match
            if (item.href !== '/dashboard' && pathname.startsWith(item.href)) return true;
            return false;
        });

        // Loop back for generic Dashboard if strictly on dashboard
        if (!activeItem && pathname === '/dashboard') {
            return flatMenus.find(m => m.href === '/dashboard') || flatMenus[0];
        }

        return activeItem || flatMenus[0];
    }, [pathname, authState.user]);

    if (!mounted || isLoading()) {
        return <HeaderSkeleton />;
    }

    const isAuth = mounted && authState.isAuth;
    const user = mounted ? authState.user : null;
    const activeMenuItem = getActiveMenuItem();

    return (
        <>
            {/* Header */}
            <header
                suppressHydrationWarning
                className={`
                fixed top-0 left-0 right-0 z-50 transition-all duration-300
                ${headerClass}
            `}>
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">

                        {/* Left: Active Menu Item Only */}
                        <div className="flex items-center">
                            {/* Active Menu Item - Large Display */}
                            <div className="hidden lg:flex items-center gap-3">
                                <div className="relative group">
                                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-50/80 to-blue-50/80 dark:from-sky-900/30 dark:to-blue-900/30">
                                        {/* Render Icon Dynamically */}
                                        {activeMenuItem?.icon && (() => {
                                            const Icon = activeMenuItem.icon;
                                            // Check if it's a function/component (LucideIcon) or string (SVG path)
                                            if (typeof Icon === 'function' || typeof Icon === 'object') {
                                                // @ts-ignore - Dynamic icon component
                                                return <Icon className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
                                            }
                                            // Fallback if it's still a string (though getMenuList uses components)
                                            return (
                                                <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={String(Icon)} />
                                                </svg>
                                            );
                                        })()}
                                        <span className="text-sky-600 dark:text-sky-400 font-bold text-lg tracking-wide uppercase">
                                            {activeMenuItem.label}
                                        </span>
                                    </div>
                                    {/* Animated underline */}
                                    <div className={cn(
                                        "absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded-full transition-all duration-500",
                                        "w-4/5 h-[3px]", // Sedikit lebih tipis agar terlihat elegan
                                        // Gradient 3-warna yang lebih modern
                                        "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600",
                                        "dark:from-cyan-300 dark:via-sky-400 dark:to-blue-500",
                                        // Efek Glow (Pendaran) di bawah garis
                                        "shadow-[0_1px_12px_rgba(56,189,248,0.5)] dark:shadow-[0_1px_15px_rgba(56,189,248,0.3)]",
                                        // Animasi halus saat active
                                        "opacity-100 scale-x-100"
                                    )} />
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-sky-400/20 to-blue-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                                </div>
                            </div>

                            {/* Mobile: Current Page Title */}
                            <div className="lg:hidden">
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-50/80 to-blue-50/80 dark:from-sky-900/30 dark:to-blue-900/30">
                                    {/* Render Icon Dynamically for Mobile */}
                                    {activeMenuItem?.icon && (() => {
                                        const Icon = activeMenuItem.icon;
                                        if (typeof Icon === 'function' || typeof Icon === 'object') {
                                            // @ts-ignore
                                            return <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
                                        }
                                        return (
                                            <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={String(Icon)} />
                                            </svg>
                                        );
                                    })()}
                                    <span className="text-sky-600 dark:text-sky-400 font-bold text-sm tracking-wide uppercase">
                                        {activeMenuItem.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions & User Profile - Always at far right */}
                        <div className="flex items-center gap-2">
                            {isAuth ? (
                                <>
                                    {/* Desktop Actions */}
                                    <div className="hidden lg:flex items-center gap-4">
                                        {/* Theme Toggle */}
                                        <button
                                            onClick={toggleDarkMode}
                                            className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
                                        >
                                            {theme === 'dark' ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Notification Bell */}
                                        <NotificationBell isMobile={false} />

                                        {/* User Profile Dropdown - POSISI PALING KANAN */}
                                        {user && (
                                            <UserProfileDropdown
                                                user={user}
                                            />
                                        )}
                                    </div>

                                    {/* Mobile Actions */}
                                    <div className="flex lg:hidden items-center gap-2">
                                        {/* Theme Toggle Mobile */}
                                        <button
                                            onClick={toggleDarkMode}
                                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            {theme === 'dark' ? (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Notification Mobile */}
                                        <NotificationBell isMobile={true} />

                                        {/* User Avatar */}
                                        <div className="flex items-center">
                                            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gradient-to-r from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                                                {user?.image && !mobileImgError ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.name || 'User'}
                                                        className="w-full h-full object-cover"
                                                        referrerPolicy="no-referrer"
                                                        onError={() => setMobileImgError(true)}
                                                    />
                                                ) : (
                                                    <span className="text-sm">{getUserInitials()}</span>
                                                )}
                                            </div>
                                        </div>

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
                                            <div className="relative w-5 h-5">
                                                <span className={`
                                                    absolute left-0 top-1 w-5 h-0.5 bg-current rounded-full transition-all duration-300
                                                    ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}
                                                `}></span>
                                                <span className={`
                                                    absolute left-0 top-2 w-5 h-0.5 bg-current rounded-full transition-all duration-300
                                                    ${mobileMenuOpen ? 'opacity-0' : ''}
                                                `}></span>
                                                <span className={`
                                                    absolute left-0 top-3 w-5 h-0.5 bg-current rounded-full transition-all duration-300
                                                    ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}
                                                `}></span>
                                            </div>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // Not authenticated state
                                <div className="flex items-center gap-3">
                                    {/* Theme Toggle */}
                                    <button
                                        onClick={toggleDarkMode}
                                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        {theme === 'dark' ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                            </svg>
                                        )}
                                    </button>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                                    >
                                        LOG IN
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-lg shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                                    >
                                        SIGN UP
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Overlay */}
            <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                <div className={`absolute top-16 right-4 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
                    {isAuth ? (
                        <>
                            {/* User Info Expanded (Mobile Menu) */}
                            <div className="p-5 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-white dark:border-gray-700 bg-gradient-to-r from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                        {user?.image && !mobileImgError ? (
                                            <img
                                                src={user.image}
                                                alt={user.name || 'User'}
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                                onError={() => setMobileImgError(true)}
                                            />
                                        ) : (
                                            <span className="text-sm">{getUserInitials()}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
                                        <p className="text-xs text-sky-600 dark:text-sky-400 font-bold mt-1 uppercase">{user?.role || 'Employee'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                                {/* Mobile Navigation Menu */}
                                <div className="space-y-1 mb-4">
                                    {[
                                        { name: 'DASHBOARD', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                                        { name: 'EMPLOYEES', href: '/dashboard/employees', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.197h-5.197a4 4 0 01-3.599-2.257l-.955-1.914A4 4 0 007.697 2H4.5A2.5 2.5 0 002 4.5v15A2.5 2.5 0 004.5 22h15a2.5 2.5 0 002.5-2.5v-15A2.5 2.5 0 0019.5 2z' },
                                        { name: 'ATTENDANCE', href: '/dashboard/attendance', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                                        { name: 'LEAVES', href: '/dashboard/leaves', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                                        { name: 'PAYROLL', href: '/dashboard/payroll', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                                        { name: 'REPORTS', href: '/dashboard/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                                    ].map((item) => {
                                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-bold tracking-wider uppercase ${isActive ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30' : 'text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                                </svg>
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                <div className="my-4 border-t border-gray-100 dark:border-gray-800"></div>

                                {/* Mobile Actions */}
                                <div className="space-y-1">
                                    <Link
                                        href="/dashboard/settings"
                                        className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>SETTINGS</span>
                                    </Link>

                                    <Link
                                        href="/dashboard/help"
                                        className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>HELP & SUPPORT</span>
                                    </Link>

                                    <div className="pt-3">
                                        <LogoutButton className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold text-sm rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] uppercase tracking-wide" />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-6">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Welcome to HRM Pro</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Sign in to manage your HR operations</p>
                            </div>
                            <div className="space-y-4">
                                <Link
                                    href="/login"
                                    className="block w-full text-center py-3 text-sky-600 dark:text-sky-400 font-bold hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors uppercase tracking-wider"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="block w-full text-center py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold rounded-lg shadow hover:shadow-lg transition-all duration-300 uppercase tracking-wider"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign Up
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
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md py-3">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Active Menu Skeleton */}
                        <div className="flex items-center">
                            <div className="hidden lg:flex items-center gap-3">
                                <div className="w-40 h-10 bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="lg:hidden">
                                <div className="w-32 h-8 bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 rounded-lg animate-pulse"></div>
                            </div>
                        </div>

                        {/* Right Side Skeleton */}
                        <div className="flex items-center gap-3">
                            <div className="hidden lg:flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                <div className="w-36 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="flex lg:hidden items-center gap-2">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <div className="h-20"></div>
        </>
    );
}