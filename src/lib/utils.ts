import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
}

export function generateUserId(uuid: string | undefined) {
  if (!uuid) return '000000';
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash).toString().substring(0, 6).padStart(6, '0');
}

export const getPlanName = (amount: number) => {
  switch (amount) {
    case 2000: return '🍓 Jus de Fraise';
    case 5000: return '🍉 Jus de Pastèque';
    case 8000: return '🥝 Jus de Kiwi';
    case 15000: return '🍇 Vin de Raisin';
    case 35000: return '🍒 Vin de Cerise';
    case 80000: return '🍋 Jus de Citron';
    case 200000: return '🍏 Jus de Pomme Verte';
    case 500000: return '🍌 Jus de Banane';
    default: return 'PACK INVESTISSEMENT';
  }
};
