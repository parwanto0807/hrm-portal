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

interface DepartmentFilterProps {
    value: string;
    onValueChange: (value: string) => void;
}

export const DepartmentFilter = ({ value, onValueChange }: DepartmentFilterProps) => {
    const { data: departments, isLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const { data } = await api.get('/org/departments');
            return data.data || [];
        }
    });

    return (
        <Select value={value} onValueChange={onValueChange} disabled={isLoading}>
            <SelectTrigger className="w-full md:w-[200px] bg-slate-50 border-slate-200">
                <SelectValue placeholder={isLoading ? "Syncing..." : "All Departments"} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map((dept: any) => (
                    <SelectItem key={dept.kdDept} value={dept.kdDept}>
                        {dept.nmDept}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
