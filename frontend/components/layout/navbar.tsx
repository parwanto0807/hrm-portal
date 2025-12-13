// components/layout/navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Menu,
    Bell,
    User,
    ChevronDown,
    Sun,
    Moon,
    LogOut,
    Users // Icon untuk Logo
} from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'

interface NavbarProps {
    onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { theme, toggleTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (isProfileOpen || isNotificationsOpen) {
                if (!target.closest('.profile-dropdown') && !target.closest('.notifications-dropdown')) {
                    setIsProfileOpen(false)
                    setIsNotificationsOpen(false)
                }
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isProfileOpen, isNotificationsOpen])

    const notifications = [
        { id: 1, title: 'Pengajuan cuti baru', description: 'Sarah Miller mengajukan cuti 3 hari', time: '10m ago', unread: true },
        { id: 2, title: 'Laporan bulanan', description: 'Laporan HR bulan November sudah siap', time: '1h ago', unread: true },
        { id: 3, title: 'Review kinerja', description: 'Jadwal review team Development', time: '2h ago', unread: false },
        { id: 4, title: 'Penggajian', description: 'Payroll Desember akan diproses besok', time: '1d ago', unread: false },
    ]

    const unreadCount = notifications.filter(n => n.unread).length

    return (
        <>
            {/* Navbar */}
            <nav className={`
                fixed top-0 left-0 right-0 z-40 transition-all duration-300
                ${scrolled
                    ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm'
                    : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
                }
            `}>
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* LEFT SECTION: Mobile Toggle & Logo */}
                        <div className="flex items-center gap-4">
                            {/* Mobile Sidebar Toggle Button */}
                            <button
                                onClick={onMenuClick}
                                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Menu size={24} />
                            </button>

                            {/* Brand Logo */}
                            <Link href="/dashboard" className="flex items-center space-x-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        HRM Portal
                                    </h1>
                                </div>
                            </Link>
                        </div>

                        {/* RIGHT SECTION: Theme, Notifications, Profile */}
                        <div className="flex items-center space-x-2 md:space-x-4">

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
                                aria-label="Toggle theme"
                            >
                                {/* 👇 3. UBAH LOGIKA DI SINI */}
                                {!mounted ? (
                                    // Render icon default (misal Sun) saat loading agar HTML server & client sama
                                    <Sun size={20} />
                                ) : theme === 'light' ? (
                                    <Moon size={20} className="group-hover:rotate-12 transition-transform" />
                                ) : (
                                    <Sun size={20} className="group-hover:rotate-12 transition-transform" />
                                )}

                                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {/* Pastikan text juga aman dari hydration error */}
                                    {!mounted ? 'Mode' : (theme === 'light' ? 'Mode Gelap' : 'Mode Terang')}
                                </span>
                            </button>

                            {/* Notifications */}
                            <div className="relative notifications-dropdown">
                                <button
                                    onClick={() => {
                                        setIsNotificationsOpen(!isNotificationsOpen)
                                        setIsProfileOpen(false)
                                    }}
                                    className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {isNotificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Notifikasi</h3>
                                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                                {unreadCount} Baru
                                            </span>
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${notification.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                                            {notification.title}
                                                        </h4>
                                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                            {notification.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                        {notification.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile Dropdown */}
                            <div className="relative profile-dropdown">
                                <button
                                    onClick={() => {
                                        setIsProfileOpen(!isProfileOpen)
                                        setIsNotificationsOpen(false)
                                    }}
                                    className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md">
                                        JD
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">John Doe</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">HR Manager</p>
                                    </div>
                                    <ChevronDown size={16} className="text-gray-400 hidden md:block" />
                                </button>

                                {/* Profile Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        {/* Mobile User Info (Only visible in dropdown on mobile) */}
                                        <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                            <p className="font-semibold text-gray-900 dark:text-white">John Doe</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">john.doe@company.com</p>
                                        </div>

                                        <div className="p-2">
                                            <Link
                                                href="/profile"
                                                className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                <User size={16} />
                                                <span>Profil Saya</span>
                                            </Link>
                                            <button
                                                onClick={() => console.log('Logout')}
                                                className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <LogOut size={16} />
                                                <span>Keluar</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            {/* Spacer for fixed navbar */}
            <div className="h-16"></div>
        </>
    )
}