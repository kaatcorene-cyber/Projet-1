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
  const amt = Number(amount);
  if (amt === 3000) return 'Cloud Node Alpha';
  if (amt === 7000) return 'Cloud Node Beta';
  if (amt === 15000) return 'Serveur IA Standard';
  if (amt === 31000) return 'Serveur IA Premium';
  if (amt === 63000) return 'Cluster Data Pro';
  if (amt === 125000) return 'Cluster Data Max';
  if (amt === 249000) return 'Supercalculateur V1';
  if (amt === 497000) return 'Quantum Node V2';
  return 'Serveur Tech';
};
