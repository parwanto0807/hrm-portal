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

interface PositionFilterProps {
    kdSeksie: string;
    value: string;
    onValueChange: (value: string) => void;
}

export const PositionFilter = ({ kdSeksie, value, onValueChange }: PositionFilterProps) => {
    const { data: positions, isLoading } = useQuery({
        queryKey: ['positions'],
        queryFn: async () => {
            const { data } = await api.get('/positions');
            return data.data || [];
        }
    });

    return (
        <Select
            value={value}
            onValueChange={onValueChange}
            disabled={isLoading}
        >
            <SelectTrigger className="w-full md:w-[200px] bg-slate-50 border-slate-200">
                <SelectValue placeholder={isLoading ? "Syncing..." : "All Positions"} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions?.map((pos: any) => (
                    <SelectItem key={pos.kdJab} value={pos.kdJab}>
                        {pos.nmJab}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
