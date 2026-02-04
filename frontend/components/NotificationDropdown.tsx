"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    type: string;
    read: boolean;
    priority: string;
}

interface NotificationBellProps {
    isMobile?: boolean;
}

export default function NotificationBell({ isMobile = false }: NotificationBellProps) {
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const sampleNotifications: Notification[] = [
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
            message: 'Axon HRM will undergo maintenance this weekend',
            time: '2 days ago',
            type: 'system',
            read: true,
            priority: 'info'
        }
    ];

    useEffect(() => {
        const unread = sampleNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
    }, []);

    const toggleNotifications = () => {
        setNotificationOpen(!notificationOpen);
        if (!notificationOpen) {
            setUnreadCount(0);
        }
    };

    const markAllAsRead = () => {
        setUnreadCount(0);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'leave':
                return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
            case 'attendance':
                return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
            case 'payroll':
                return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
            case 'employee':
                return 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.197h-5.197a4 4 0 01-3.599-2.257l-.955-1.914A4 4 0 007.697 2H4.5A2.5 2.5 0 002 4.5v15A2.5 2.5 0 004.5 22h15a2.5 2.5 0 002.5-2.5v-15A2.5 2.5 0 0019.5 2z';
            case 'system':
                return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z';
            default:
                return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
        }
    };

    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400';
            case 'medium':
                return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
            default:
                return 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400';
        }
    };

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

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && notificationOpen) {
                setNotificationOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [notificationOpen]);

    return (
        <div className="relative notification-container">
            <button
                onClick={toggleNotifications}
                className={`relative p-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ${isMobile ? '' : 'group'}`}
                aria-label="Notifications"
            >
                <svg
                    className={`transition-transform duration-300 ${isMobile ? 'w-6 h-6' : 'w-6 h-6 group-hover:scale-110'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-500 text-xs font-semibold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {notificationOpen && (
                <div className={isMobile ?
                    "fixed inset-0 z-50 lg:hidden" :
                    "absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 animate-in slide-in-from-top-5 duration-300"
                }>
                    {isMobile ? (
                        <>
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setNotificationOpen(false)}></div>
                            <div className="absolute top-20 right-4 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in slide-in-from-top-5 duration-300">
                                <NotificationContent
                                    notifications={sampleNotifications}
                                    unreadCount={unreadCount}
                                    onMarkAllAsRead={markAllAsRead}
                                    onClose={() => setNotificationOpen(false)}
                                    isMobile={isMobile}
                                />
                            </div>
                        </>
                    ) : (
                        <NotificationContent
                            notifications={sampleNotifications}
                            unreadCount={unreadCount}
                            onMarkAllAsRead={markAllAsRead}
                            onClose={() => setNotificationOpen(false)}
                            isMobile={isMobile}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function NotificationContent({
    notifications,
    unreadCount,
    onMarkAllAsRead,
    onClose,
    isMobile
}: {
    notifications: Notification[];
    unreadCount: number;
    onMarkAllAsRead: () => void;
    onClose: () => void;
    isMobile?: boolean;
}) {
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'leave':
                return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
            case 'attendance':
                return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
            case 'payroll':
                return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
            case 'employee':
                return 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.197h-5.197a4 4 0 01-3.599-2.257l-.955-1.914A4 4 0 007.697 2H4.5A2.5 2.5 0 002 4.5v15A2.5 2.5 0 004.5 22h15a2.5 2.5 0 002.5-2.5v-15A2.5 2.5 0 0019.5 2z';
            case 'system':
                return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z';
            default:
                return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
        }
    };

    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400';
            case 'medium':
                return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
            default:
                return 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400';
        }
    };

    return (
        <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className={`font-semibold text-gray-900 dark:text-white ${isMobile ? 'text-sm' : 'text-lg'}`}>
                            Notifications
                        </h3>
                        <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                            {unreadCount > 0
                                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                : 'All caught up!'
                            }
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllAsRead}
                            className={`font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 px-3 py-1 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors ${isMobile ? 'text-[11px]' : 'text-sm'}`}
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {notifications.map((notification) => (
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
                                        flex-shrink-0 md:w-10 md:h-10 w-8 h-8 rounded-lg flex items-center justify-center
                                        ${getPriorityClass(notification.priority)}
                                    `}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getNotificationIcon(notification.type)} />
                                        </svg>
                                    </div>

                                    {/* Notification Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'} ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                                                    {notification.title}
                                                </h4>
                                                <p className={`text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 mt-1"></div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                                                {notification.time}
                                            </span>
                                            <button className={`font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
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
                        <div className="md:w-16 md:h-16 w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h4 className={`font-semibold text-gray-900 dark:text-white mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                            No notifications
                        </h4>
                        <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                            You're all caught up! Check back later for updates.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <Link
                    href="/notifications"
                    className={`block w-full text-center py-2.5 font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors ${isMobile ? 'text-[11px]' : 'text-sm'}`}
                    onClick={onClose}
                >
                    View all notifications
                </Link>
            </div>
        </>
    );
}