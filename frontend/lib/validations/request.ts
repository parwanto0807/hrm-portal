// lib/validations/request.ts
import * as z from 'zod';

export const requestFormSchema = z.object({
    type: z.enum(['CUTI', 'IJIN', 'PULANG_CEPAT', 'DINAS_LUAR', 'SAKIT']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().nullish().or(z.literal('')),
    reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
    attachments: z.string().nullish().or(z.literal(''))
});

export type RequestFormValues = z.infer<typeof requestFormSchema>;
