// components/UserProfileDropdown.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutButton from './auth/LogoutButton';

interface UserProfileDropdownProps {
    user: {
        name?: string;
        email: string;
        role?: string;
        image?: string;
    };
    // Menerima props untuk dark mode dari Header parent
    isDarkMode?: boolean;
    toggleDarkMode?: () => void;
}

export default function UserProfileDropdown({
    user,
    // Berikan default value agar tidak error jika props belum dikirim parent
    isDarkMode = false,
    toggleDarkMode = () => { }
}: UserProfileDropdownProps) {

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [imgError, setImgError] = useState(false); // State untuk handle error gambar
    const router = useRouter();

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

    // Get user initials for avatar
    const getUserInitials = () => {
        if (user.name) return user.name.charAt(0).toUpperCase();
        if (user.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    };

    const menuItems = [
        { label: 'My Profile', href: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { label: 'Settings', href: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        { label: 'Help & Support', href: '/help', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                aria-label="Open user menu"
            >
                {/* === AVATAR LOGIC === */}
                <div className="relative">
                    {user.image && !imgError ? (
                        <img
                            src={user.image}
                            alt={user.name || 'User'}
                            className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover"
                            // PERBAIKAN 1: Tambahkan referrerPolicy agar Google Image tidak memblokir
                            referrerPolicy="no-referrer"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {getUserInitials()}
                        </div>
                    )}
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>

                {/* Desktop Text */}
                <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {user.name || user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.role?.toLowerCase() || 'employee'}
                    </p>
                </div>

                {/* Chevron Icon */}
                <svg
                    className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* === DROPDOWN MENU === */}
            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 transform origin-top-right transition-all">

                    {/* Mobile User Info (Show only on small screens inside dropdown) */}
                    <div className="md:hidden px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user.name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                        </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                </svg>
                                <span>{item.label}</span>
                            </Link>
                        ))}

                        {/* PERBAIKAN 2: Theme Toggle Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault(); // Mencegah bubbling jika perlu
                                toggleDarkMode();
                                // Opsional: setDropdownOpen(false); jika ingin langsung tutup
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                            {isDarkMode ? (
                                <>
                                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                    {/* Logout */}
                    <div className="px-2 py-1">
                        <LogoutButton
                            variant="ghost"
                            className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-4"
                            onLogout={() => setDropdownOpen(false)}
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </LogoutButton>
                    </div>
                </div>
            )}
        </div>
    );
}