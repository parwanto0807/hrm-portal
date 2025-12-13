// components/dashboard/SkeletonDashboard.tsx
export const SkeletonDashboard = () => {
    return (
        <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                            <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                    </div>
                ))}
            </div>

            {/* Quick Access Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-3"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto mb-1"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};