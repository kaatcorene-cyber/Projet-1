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

export function getDeepLink(url: string): string {
  if (!url) return url;
  try {
    let checkUrl = url;
    if (!checkUrl.startsWith('http') && !checkUrl.startsWith('tg://') && !checkUrl.startsWith('whatsapp://')) {
      checkUrl = 'https://' + checkUrl;
    }
    const parsed = new URL(checkUrl);
    
    if (parsed.hostname === 't.me' || parsed.hostname === 'www.t.me') {
      const path = parsed.pathname.substring(1);
      if (path.startsWith('joinchat/')) {
        return `tg://join?invite=${path.substring(9)}`;
      } else if (path.startsWith('+')) {
         return `tg://join?invite=${path.substring(1)}`;
      } else {
        return `tg://resolve?domain=${path}`;
      }
    }
    return url;
  } catch (e) {
    if (url.includes('t.me/')) {
      const parts = url.split('t.me/');
      if (parts.length > 1) {
        const path = parts[1];
        if (path.startsWith('joinchat/')) return `tg://join?invite=${path.substring(9)}`;
        if (path.startsWith('+')) return `tg://join?invite=${path.substring(1)}`;
        return `tg://resolve?domain=${path}`;
      }
    }
    return url;
  }
}
