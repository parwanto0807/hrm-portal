"use client";

import { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell,
    LabelList
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock, Calendar } from 'lucide-react';

interface SalaryData {
    month: string;
    salary: number;
    bonus: number;
    deductions: number;
}

interface AttendanceData {
    month: string;
    late: number;
    earlyLeave: number;
    absent: number;
}

interface LeaveData {
    month: string;
    sick: number;
    annual: number;
    other: number;
}

interface PayloadEntry {
    color: string;
    dataKey: string;
    value: number;
    name: string;
}

// Data sample untuk 6 bulan terakhir
const salaryData: SalaryData[] = [
    { month: 'Jul', salary: 45.2, bonus: 8.5, deductions: 2.3 },
    { month: 'Aug', salary: 48.5, bonus: 9.2, deductions: 2.8 },
    { month: 'Sep', salary: 52.3, bonus: 10.5, deductions: 3.1 },
    { month: 'Oct', salary: 56.8, bonus: 11.8, deductions: 3.5 },
    { month: 'Nov', salary: 62.1, bonus: 13.2, deductions: 4.2 },
    { month: 'Dec', salary: 68.5, bonus: 15.0, deductions: 5.1 },
];

const attendanceData: AttendanceData[] = [
    { month: 'Jul', late: 12, earlyLeave: 8, absent: 2 },
    { month: 'Aug', late: 10, earlyLeave: 6, absent: 1 },
    { month: 'Sep', late: 8, earlyLeave: 5, absent: 1 },
    { month: 'Oct', late: 6, earlyLeave: 4, absent: 0 },
    { month: 'Nov', late: 5, earlyLeave: 3, absent: 0 },
    { month: 'Dec', late: 4, earlyLeave: 2, absent: 0 },
];

const leaveData: LeaveData[] = [
    { month: 'Jul', sick: 8, annual: 12, other: 3 },
    { month: 'Aug', sick: 6, annual: 15, other: 2 },
    { month: 'Sep', sick: 5, annual: 18, other: 4 },
    { month: 'Oct', sick: 7, annual: 20, other: 5 },
    { month: 'Nov', sick: 4, annual: 22, other: 3 },
    { month: 'Dec', sick: 3, annual: 25, other: 6 },
];

// Custom Tooltip untuk semua chart
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: PayloadEntry[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg p-3 sm:p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-[280px]">
                <p className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">{label} 2024</p>
                <div className="space-y-1">
                    {payload.map((entry: PayloadEntry, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-3 py-1">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                                    {entry.dataKey.replace(/([A-Z])/g, ' $1')}:
                                </span>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base whitespace-nowrap ml-2">
                                {entry.value.toLocaleString()} {entry.dataKey === 'salary' ? 'jt' : ''}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total: {payload.reduce((sum: number, entry: PayloadEntry) => sum + entry.value, 0).toLocaleString()}</p>
                </div>
            </div>
        );
    }
    return null;
};

// Responsive Legend Component
const ResponsiveLegend = (props: { payload?: { value: string; color: string }[] }) => {
    const { payload } = props;

    return (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-4 px-2">
            {payload?.map((entry: { value: string; color: string }, index: number) => (
                <div key={`item-${index}`} className="flex items-center gap-2">
                    <div
                        className="w-2.5 h-2.5 rounded-full sm:w-3 sm:h-3"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function DashboardCharts() {
    const [activeTab, setActiveTab] = useState<'salary' | 'attendance' | 'leave'>('salary');

    // Calculate trends
    const trends = useMemo(() => {
        const salaryTrend = ((salaryData[5].salary - salaryData[0].salary) / salaryData[0].salary * 100).toFixed(1);
        const lateTrend = ((attendanceData[0].late - attendanceData[5].late) / attendanceData[0].late * 100).toFixed(1);
        const leaveTrend = ((leaveData[5].annual - leaveData[0].annual) / leaveData[0].annual * 100).toFixed(1);

        return {
            salary: parseFloat(salaryTrend),
            late: parseFloat(lateTrend),
            leave: parseFloat(leaveTrend),
        };
    }, []);

    // Get current data based on active tab
    const currentData = useMemo(() => {
        switch (activeTab) {
            case 'salary': return salaryData;
            case 'attendance': return attendanceData;
            case 'leave': return leaveData;
        }
    }, [activeTab]);

    // Get chart config based on active tab
    const chartConfig = useMemo(() => {
        switch (activeTab) {
            case 'salary':
                return {
                    bars: [
                        { key: 'salary', name: 'Gaji', color: '#0ea5e9', gradient: 'url(#salaryGradient)' },
                        // { key: 'bonus', name: 'Bonus', color: '#8b5cf6', gradient: 'url(#bonusGradient)' },
                        { key: 'deductions', name: 'Potongan', color: '#f97316', gradient: 'url(#deductionsGradient)' }
                    ],
                    type: 'bar' as const,
                    unit: 'jt',
                    icon: TrendingUp,
                    total: salaryData.reduce((sum, item) => sum + item.salary, 0).toLocaleString(),
                    trend: trends.salary
                };
            case 'attendance':
                return {
                    bars: [
                        { key: 'late', name: 'Telat', color: '#ef4444', gradient: 'url(#lateGradient)' },
                        { key: 'earlyLeave', name: 'Pulang Awal', color: '#f59e0b', gradient: 'url(#earlyGradient)' },
                        { key: 'absent', name: 'Absen', color: '#64748b', gradient: 'url(#absentGradient)' }
                    ],
                    type: 'bar' as const,
                    unit: 'kali',
                    icon: Clock,
                    total: attendanceData.reduce((sum, item) => sum + item.late, 0).toLocaleString(),
                    trend: trends.late
                };
            case 'leave':
                return {
                    bars: [
                        { key: 'sick', name: 'Sakit', color: '#3b82f6', gradient: 'url(#sickGradient)' },
                        { key: 'annual', name: 'Tahunan', color: '#10b981', gradient: 'url(#annualGradient)' },
                        { key: 'other', name: 'Libur', color: '#8b5cf6', gradient: 'url(#otherGradient)' }
                    ],
                    type: 'bar' as const,
                    unit: 'hari',
                    icon: Calendar,
                    total: leaveData.reduce((sum, item) => sum + item.annual, 0).toLocaleString(),
                    trend: trends.leave
                };
        }
    }, [activeTab, trends]);

    // Render chart based on type
    const renderChart = () => {

        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={currentData}
                    margin={{
                        top: 20,
                        right: 10,
                        left: 0,
                        bottom: 20
                    }}
                    barSize={window.innerWidth < 640 ? 20 : 30}
                >
                    <defs>
                        <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.5} />
                        </linearGradient>
                        <linearGradient id="bonusGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.5} />
                        </linearGradient>
                        <linearGradient id="deductionsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.5} />
                        </linearGradient>
                        <linearGradient id="lateGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.5} />
                        </linearGradient>
                        <linearGradient id="earlyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.5} />
                        </linearGradient>
                        <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#64748b" stopOpacity={0.5} />
                        </linearGradient>
                        <linearGradient id="sickGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5} />
                        </linearGradient>
                        <linearGradient id="annualGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.5} />
                        </linearGradient>
                        <linearGradient id="otherGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.5} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="2 2"
                        stroke="#e5e7eb"
                        strokeOpacity={0.3}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fill: '#6b7280',
                            fontSize: window.innerWidth < 640 ? 10 : 12,
                            fontWeight: 600
                        }}
                        interval={0}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fill: '#6b7280',
                            fontSize: window.innerWidth < 640 ? 10 : 12
                        }}
                        width={window.innerWidth < 640 ? 30 : 40}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    />
                    <Legend
                        content={<ResponsiveLegend />}
                        wrapperStyle={{
                            paddingTop: '10px',
                            paddingBottom: '10px'
                        }}
                    />
                    {chartConfig.bars?.map((bar, index) => (
                        <Bar
                            key={bar.key}
                            dataKey={bar.key}
                            name={bar.name}
                            fill={bar.gradient}
                            radius={[4, 4, 0, 0]}
                            animationBegin={index * 200}
                            animationDuration={1200}
                            animationEasing="ease-out"
                        >
                            {currentData.map((entry, i) => (
                                <Cell
                                    key={`cell-${i}`}
                                    fill={bar.gradient}
                                    className="hover:opacity-80 transition-opacity"
                                />
                            ))}
                            {window.innerWidth >= 768 && (
                                <LabelList
                                    dataKey={bar.key}
                                    position="top"
                                    fill="#374151"
                                    fontSize={window.innerWidth < 640 ? 9 : 11}
                                    fontWeight={600}
                                    formatter={(value: unknown) => String(value)}
                                    offset={5}
                                />
                            )}
                        </Bar>
                    ))}
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mx-2 sm:mx-0">
            {/* Header dengan Tabs */}
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            Analytics Dashboard
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            6 Bulan Terakhir (Jul - Dec 2024)
                        </p>
                    </div>

                    {/* Mobile Stats Card */}
                    <div className="lg:hidden">
                        <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total {activeTab === 'salary' ? 'Gaji' : activeTab === 'attendance' ? 'Keterlambatan' : 'Cuti'}</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                        {activeTab === 'salary' ? `${chartConfig.total}jt` : chartConfig.total}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {chartConfig.trend > 0 ? (
                                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <TrendingDown className="w-5 h-5 text-rose-500" />
                                    )}
                                    <span className={`text-xs font-semibold ${chartConfig.trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {chartConfig.trend > 0 ? '+' : ''}{chartConfig.trend}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs - Responsive */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl p-1">
                        {[
                            { id: 'salary', label: 'Gaji', icon: TrendingUp },
                            { id: 'attendance', label: 'Absensi', icon: Clock },
                            { id: 'leave', label: 'Cuti', icon: Calendar }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'salary' | 'attendance' | 'leave')}
                                    className={`
                                        flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-md sm:rounded-lg transition-all duration-300 text-xs sm:text-sm
                                        ${isActive
                                            ? 'bg-white dark:bg-gray-900 shadow sm:shadow-lg text-sky-600 dark:text-sky-400 font-semibold'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400'
                                        }
                                    `}
                                >
                                    <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                                    <span>{tab.label}</span>
                                    {isActive && (
                                        <div className="hidden sm:block ml-2 w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="p-3 sm:p-4 md:p-6">
                {/* Summary Cards - Desktop Only */}
                <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-purple-500/10 dark:from-sky-500/5 dark:via-blue-500/5 dark:to-purple-500/5 rounded-xl p-4 sm:p-5 border border-sky-100/50 dark:border-sky-800/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Bulan Ini</p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                                    {activeTab === 'salary' ? `${salaryData[5]?.salary}jt` :
                                        activeTab === 'attendance' ? attendanceData[5]?.late :
                                            leaveData[5]?.annual}
                                </p>
                            </div>
                            <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500">
                                {(() => {
                                    const Icon = chartConfig.icon;
                                    return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />;
                                })()}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-4">
                            <div className={`
                                flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold
                                ${chartConfig.trend > 0
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                }
                            `}>
                                {chartConfig.trend > 0 ? (
                                    <>
                                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span>+{chartConfig.trend}%</span>
                                    </>
                                ) : (
                                    <>
                                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span>{chartConfig.trend}%</span>
                                    </>
                                )}
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">vs bulan lalu</span>
                        </div>
                    </div>

                    {/* Mini Stats */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-5">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">Analisis Trend</h3>
                        <div className="space-y-2 sm:space-y-3">
                            {activeTab === 'salary' && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Rata-rata Gaji</span>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                            {(salaryData.reduce((sum, item) => sum + item.salary, 0) / salaryData.length).toFixed(1)}jt
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Bonus</span>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                            {salaryData.reduce((sum, item) => sum + item.bonus, 0)}jt
                                        </span>
                                    </div>
                                </>
                            )}
                            {activeTab === 'attendance' && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Rata-rata Telat</span>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                            {(attendanceData.reduce((sum, item) => sum + item.late, 0) / attendanceData.length).toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Perbaikan</span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                                            {trends.late}%
                                        </span>
                                    </div>
                                </>
                            )}
                            {activeTab === 'leave' && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Rata-rata Cuti</span>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                            {(leaveData.reduce((sum, item) => sum + item.annual, 0) / leaveData.length).toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Cuti Sakit</span>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                            {leaveData.reduce((sum, item) => sum + item.sick, 0)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">Metrik Utama</h3>
                        <div className="space-y-2 sm:space-y-3">
                            {chartConfig.bars?.map((bar) => (
                                <div key={bar.key} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div
                                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                                            style={{
                                                background: `linear-gradient(135deg, ${bar.color} 0%, ${bar.color}80 100%)`
                                            }}
                                        />
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {bar.name}
                                        </span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base whitespace-nowrap ml-2">
                                        {currentData.reduce((sum, item) => sum + (item as unknown as Record<string, number>)[bar.key], 0)}
                                        {activeTab === 'salary' ? 'jt' : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Chart */}
                <div className="bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/30 dark:to-transparent rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-100 dark:border-gray-800">
                    <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
                        {renderChart()}
                    </div>
                </div>

                {/* Bottom Stats - Mobile Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
                    <div className="bg-gradient-to-r from-sky-500/5 to-blue-500/5 dark:from-sky-500/3 dark:to-blue-500/3 rounded-lg sm:rounded-xl p-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-sky-100 dark:bg-sky-900/30">
                                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Karyawan</p>
                                <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">128</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-500/5 to-green-500/5 dark:from-emerald-500/3 dark:to-green-500/3 rounded-lg sm:rounded-xl p-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Produktivitas</p>
                                <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">+24.5%</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-gradient-to-r from-purple-500/5 to-pink-500/5 dark:from-purple-500/3 dark:to-pink-500/3 rounded-lg sm:rounded-xl p-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Avg. Cuti</p>
                                <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">4.2 hr</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}