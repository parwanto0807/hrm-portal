// components/dashboard/Sidebar.tsx
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    DollarSign,
    Settings,
    LogOut,
    Bell,
    HelpCircle,
    BarChart3
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Users, label: 'Karyawan' },
    { icon: Calendar, label: 'Absensi' },
    { icon: FileText, label: 'Pengajuan' },
    { icon: DollarSign, label: 'Payroll' },
    { icon: BarChart3, label: 'Laporan' },
    { icon: Bell, label: 'Notifikasi' },
    { icon: Settings, label: 'Pengaturan' },
    { icon: HelpCircle, label: 'Bantuan' },
];

export const Sidebar = () => {
    return (
        <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-gray-900 dark:text-white">HRM Portal</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Enterprise Edition</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <button
                                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  ${item.active
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
                  transition-colors
                `}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                                {item.active && (
                                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">JD</span>
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">John Doe</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">HR Manager</p>
                    </div>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
                        <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};