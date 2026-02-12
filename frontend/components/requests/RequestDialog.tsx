// components/requests/RequestDialog.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RequestForm } from './RequestForm';

interface RequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function RequestDialog({ open, onOpenChange, onSuccess }: RequestDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-[95vw] rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 overflow-hidden">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent uppercase tracking-tight">
                        Buat Pengajuan Baru
                    </DialogTitle>
                </DialogHeader>

                <RequestForm
                    onSuccess={() => {
                        onSuccess();
                        onOpenChange(false);
                    }}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
