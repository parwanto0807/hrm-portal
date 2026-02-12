"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit2, Eye } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AttendanceActionsProps {
    record: any;
    onEdit: (record: any) => void;
    onView?: (record: any) => void;
}

export const AttendanceActions = ({ record, onEdit, onView }: AttendanceActionsProps) => {
    return (
        <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={200}>
                {/* View Details Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-full transition-all"
                            onClick={() => onView?.(record)}
                        >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">Lihat Detail Log</p>
                    </TooltipContent>
                </Tooltip>

                {/* Edit Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-full transition-all"
                            onClick={() => onEdit(record)}
                        >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit Record</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">Edit Absensi</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};
