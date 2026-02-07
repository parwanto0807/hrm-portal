"use client";

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface SectionFilterProps {
    kdDept: string;
    value: string;
    onValueChange: (value: string) => void;
}

export const SectionFilter = ({ kdDept, value, onValueChange }: SectionFilterProps) => {
    const { data: sections, isLoading } = useQuery({
        queryKey: ['sections', kdDept],
        queryFn: async () => {
            if (!kdDept || kdDept === 'all') return [];
            const { data } = await api.get('/org/sections', {
                params: { kdDept }
            });
            return data.data || [];
        },
        enabled: kdDept !== 'all' && kdDept !== ''
    });

    return (
        <Select
            value={value}
            onValueChange={onValueChange}
            disabled={isLoading || kdDept === 'all' || kdDept === ''}
        >
            <SelectTrigger className="w-full md:w-[200px] bg-slate-50 border-slate-200">
                <SelectValue placeholder={isLoading ? "Loading..." : "All Sections"} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections?.map((sie: any) => (
                    <SelectItem key={sie.kdSeksie} value={sie.kdSeksie}>
                        {sie.nmSeksie}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
