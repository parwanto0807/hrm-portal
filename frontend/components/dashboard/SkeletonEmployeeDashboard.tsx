// components/dashboard/SkeletonEmployeeDashboard.tsx
export const SkeletonEmployeeDashboard = () => {
    return (
        <div className="w-full px-4 pb-24 md:pb-6 space-y-6 animate-pulse">
            {/* Purple Header Card with Profile */}
            <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {/* Profile Photo */}
                        <div className="w-14 h-14 bg-white/20 rounded-full"></div>
                        <div className="space-y-2">
                            <div className="h-5 bg-white/30 rounded w-32"></div>
                            <div className="h-3 bg-white/20 rounded w-40"></div>
                        </div>
                    </div>
                    {/* Bell Icon */}
                    <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="text-center">
                            <div className="h-3 bg-white/20 rounded w-16 mx-auto mb-2"></div>
                            <div className="h-6 bg-white/30 rounded w-12 mx-auto mb-1"></div>
                            <div className="h-3 bg-white/20 rounded w-10 mx-auto"></div>
                        </div>
                    ))}
                </div>

                {/* Period Info */}
                <div className="mt-4 text-center">
                    <div className="h-3 bg-white/20 rounded w-32 mx-auto"></div>
                </div>
            </div>

            {/* Attendance Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                </div>
            </div>

            {/* Layanan Mandiri */}
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pengumuman */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                </div>
            </div>

            {/* Aktivitas 3 Hari Terakhir */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>

                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            </div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
