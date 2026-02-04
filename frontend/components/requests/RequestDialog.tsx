// components/requests/RequestDialog.tsx
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    Loader2,
    Calendar,
    FileText,
    FileUp,
    CheckCircle2,
    Briefcase,
    Clock,
    Plane
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { api } from '@/lib/api';
import { requestFormSchema, RequestFormValues } from '@/lib/validations/request';

interface RequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function RequestDialog({ open, onOpenChange, onSuccess }: RequestDialogProps) {
    const queryClient = useQueryClient();

    const form = useForm<RequestFormValues>({
        resolver: zodResolver(requestFormSchema),
        defaultValues: {
            type: 'IJIN',
            startDate: '',
            endDate: '',
            reason: '',
            attachments: ''
        }
    });

    const onSubmit = async (values: RequestFormValues) => {
        try {
            await api.post('/requests', values);
            toast.success('Request submitted successfully');
            queryClient.invalidateQueries({ queryKey: ['requests', 'my'] });
            onSuccess();
            onOpenChange(false);
            form.reset();
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit request');
        }
    };

    const today = new Date().toLocaleDateString('en-CA');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-[95vw] rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 overflow-hidden">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent uppercase tracking-tight">
                        Buat Pengajuan Baru
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tipe Pengajuan</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold">
                                                <SelectValue placeholder="Pilih Tipe" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CUTI" className="font-bold flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-500 inline mr-2" /> Cuti (Leave)
                                            </SelectItem>
                                            <SelectItem value="IJIN" className="font-bold flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 inline mr-2" /> Ijin (Permission)
                                            </SelectItem>
                                            <SelectItem value="PULANG_CEPAT" className="font-bold flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-orange-500 inline mr-2" /> Pulang Cepat (Early Leave)
                                            </SelectItem>
                                            <SelectItem value="DINAS_LUAR" className="font-bold flex items-center gap-2">
                                                <Plane className="h-4 w-4 text-purple-500 inline mr-2" /> Dinas Luar (Business Trip)
                                            </SelectItem>
                                            <SelectItem value="SAKIT" className="font-bold flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-red-500 inline mr-2" /> Sakit (Sick Leave)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Dari Tanggal</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                min={today}
                                                className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold text-xs"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Sampai (Opsional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                value={field.value || ''}
                                                min={form.getValues('startDate') || today}
                                                className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold text-xs"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Alasan / Keterangan</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Berikan alasan atau detail pengajuan Anda..."
                                            {...field}
                                            className="min-h-[100px] bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-medium text-sm resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="font-bold hover:bg-slate-100 dark:hover:bg-slate-900"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl shadow-lg shadow-blue-500/20"
                            >
                                {form.formState.isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <FileUp className="h-4 w-4 mr-2" />
                                )}
                                Kirim Pengajuan
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
