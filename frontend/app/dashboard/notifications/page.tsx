"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
    Bell,
    CheckCircle,
    Clock,
    FileText,
    CreditCard,
    MoreHorizontal,
    Check,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
    id: string;
    subject: string;
    note: string;
    createdAt: string;
    type: number;
    isRead: boolean;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    });

    const fetchNotifications = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`notifications?page=${page}&limit=${pagination.limit}`);
            if (response.data.success) {
                setNotifications(response.data.data);
                if (response.data.pagination) {
                    setPagination(response.data.pagination);
                }
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            toast.error("Gagal memuat notifikasi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(1);
    }, []);

    const markAllAsRead = async () => {
        try {
            await api.put("notifications/read-all");
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success("Semua notifikasi ditandai sudah dibaca");
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            toast.error("Gagal menandai semua dibaca");
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.put(`notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const getIcon = (type: number) => {
        switch (type) {
            case 1: return <Clock className="w-5 h-5 text-amber-600" />; // Attendance
            case 2: return <FileText className="w-5 h-5 text-rose-600" />; // Request
            case 3: return <CreditCard className="w-5 h-5 text-emerald-600" />; // Payroll
            default: return <Bell className="w-5 h-5 text-sky-600" />;
        }
    };

    const getBgColor = (type: number) => {
        switch (type) {
            case 1: return "bg-amber-100 dark:bg-amber-900/20";
            case 2: return "bg-rose-100 dark:bg-rose-900/20";
            case 3: return "bg-emerald-100 dark:bg-emerald-900/20";
            default: return "bg-sky-100 dark:bg-sky-900/20";
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchNotifications(newPage);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-6 h-6 text-sky-500" />
                        Notifikasi
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Kelola semua pembaruan dan aktivitas akun Anda.
                    </p>
                </div>
                <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 hover:bg-sky-100 dark:text-sky-400 dark:bg-sky-900/20 dark:hover:bg-sky-900/40 rounded-lg transition-colors"
                >
                    <CheckCircle className="w-4 h-4" />
                    Tandai Semua Dibaca
                </button>
            </div>

            {/* Notification List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 h-24 rounded-xl"></div>
                        ))}
                    </div>
                ) : notifications.length > 0 ? (
                    <>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 md:p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!notification.isRead ? 'bg-sky-50/40 dark:bg-sky-900/10' : ''}`}
                                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                                >
                                    <div className="flex gap-4 items-start">
                                        <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${getBgColor(notification.type)}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className={`text-base font-semibold ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {notification.subject}
                                                </p>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: id })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                {notification.note}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="flex-shrink-0 self-center">
                                                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full ring-4 ring-sky-100 dark:ring-sky-900/30"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Halaman {pagination.page} dari {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tidak ada notifikasi</h3>
                        <p className="text-gray-500 text-sm mt-1">Anda sudah membaca semua pemberitahuan.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
