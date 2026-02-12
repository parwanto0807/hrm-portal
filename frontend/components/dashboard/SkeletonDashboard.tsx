// components/dashboard/SkeletonDashboard.tsx
export const SkeletonDashboard = () => {
    return (
        <div className="w-full max-w-full px-4 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                            <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                    </div>
                ))}
            </div>

            {/* Content Grid - Matching Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                {/* Left Column (2/3 width on desktop) */}
                <div className="lg:col-span-2 w-full space-y-8">
                    {/* Chart Summary Skeleton */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Chart 1 */}
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            </div>

                            {/* Chart 2 */}
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Skeleton - Mobile Only */}
                    <div className="block lg:hidden bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-3"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto mb-1"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3 width on desktop) - Recent Activity */}
                <div className="lg:col-span-1 w-full">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                            <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};