import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount?: any) => {
  // Acepta number, string, or objetos Decimal-like (prisma Decimal)
  let value = 0;
  if (amount === null || amount === undefined) {
    value = 0;
  } else if (typeof amount === 'number' && Number.isFinite(amount)) {
    value = amount;
  } else if (typeof amount === 'string') {
    const n = Number(amount);
    value = Number.isFinite(n) ? n : 0;
  } else if (typeof amount === 'object') {
    // Prisma Decimal often tiene toNumber o toString
    try {
      if (typeof amount.toNumber === 'function') {
        const n = amount.toNumber();
        value = Number.isFinite(n) ? n : 0;
      } else if (typeof amount.toString === 'function') {
        const n = Number(amount.toString());
        value = Number.isFinite(n) ? n : 0;
      } else {
        value = 0;
      }
    } catch (e) {
      value = 0;
    }
  } else {
    value = 0;
  }

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value);
};