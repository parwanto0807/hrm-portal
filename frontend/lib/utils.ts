import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';

  return format(d, 'dd-MMM-yyyy', { locale: id }).toUpperCase();
}
