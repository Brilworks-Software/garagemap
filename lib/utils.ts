import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { colors } from "./colors"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get color value for inline styles
 * Usage: style={{ color: getColor('primary.blue') }}
 */
export function getColor(path: string): string {
  const keys = path.split('.')
  let value: any = colors
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      console.warn(`Color path "${path}" not found`)
      return '#000000'
    }
  }
  
  return typeof value === 'string' ? value : '#000000'
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "N/A";
  return `$${amount.toFixed(2)}`;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A";
  try {
    const dateObj = date instanceof Date 
      ? date 
      : (date as { toDate?: () => Date; seconds?: number }).toDate?.() 
      || new Date((date as { seconds: number }).seconds * 1000);
    return dateObj.toLocaleDateString();
  } catch {
    return "N/A";
  }
}
