"use client";

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    format,
    startOfToday,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    subDays,
    subWeeks
} from 'date-fns';

interface DateRangeSelectProps {
    onRangeChange: (startDate: string, endDate: string, rangeKey: string) => void;
    value: string;
}

export const DateRangeSelect = ({ onRangeChange, value }: DateRangeSelectProps) => {
    const handleValueChange = (rangeKey: string) => {
        const today = new Date();
        let start = today;
        let end = today;

        switch (rangeKey) {
            case 'today':
                start = startOfToday();
                end = today;
                break;
            case 'this-week':
                start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
                end = endOfWeek(today, { weekStartsOn: 1 });
                break;
            case '2-weeks':
                start = subWeeks(today, 2);
                end = today;
                break;
            case '3-weeks':
                start = subWeeks(today, 3);
                end = today;
                break;
            case 'this-month':
                start = startOfMonth(today);
                end = endOfMonth(today);
                break;
            case 'custom':
                return; // Don't change dates, let user pick manually
            default:
                return;
        }

        onRangeChange(
            format(start, 'yyyy-MM-dd'),
            format(end, 'yyyy-MM-dd'),
            rangeKey
        );
    };

    return (
        <Select value={value} onValueChange={handleValueChange}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:bg-white transition-all text-xs font-medium h-10">
                <SelectValue placeholder="Pilih Rentang Waktu" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="this-week">Minggu Ini</SelectItem>
                <SelectItem value="2-weeks">2 Minggu Terakhir</SelectItem>
                <SelectItem value="3-weeks">3 Minggu Terakhir</SelectItem>
                <SelectItem value="this-month">Bulan Ini</SelectItem>
                <SelectItem value="custom">Kustom (Manual)</SelectItem>
            </SelectContent>
        </Select>
    );
};
