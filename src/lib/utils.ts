import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseSafeDate(dateStr: string | Date | undefined | null): number {
  if (!dateStr) return Date.now();
  if (typeof dateStr === 'number') return dateStr;
  if (dateStr instanceof Date) {
    const t = dateStr.getTime();
    return isNaN(t) ? Date.now() : t;
  }
  
  let d = new Date(dateStr);
  let t = d.getTime();
  
  if (isNaN(t)) {
    const safeStr = String(dateStr).replace(' ', 'T') + 'Z';
    d = new Date(safeStr);
    t = d.getTime();
  }
  
  return isNaN(t) ? Date.now() : t;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
}
