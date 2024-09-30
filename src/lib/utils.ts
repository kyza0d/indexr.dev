import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// src/lib/utils.ts

/**
 * Formats a date string or Date object into a localized string representation.
 * 
 * @param date - The date to format (string or Date object)
 * @param options - Optional configuration for date formatting
 * @returns A formatted date string
 */
export function formatDate(
  date: string | Date,
  options: {
    locale?: string;
    format?: 'short' | 'medium' | 'long' | 'full';
    includeTime?: boolean;
  } = {}
): string {
  const {
    locale = 'en-US',
    format = 'medium',
    includeTime = false,
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatDate:', date);
    return 'Invalid Date';
  }

  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    dateStyle: format,
    timeStyle: includeTime ? format : undefined,
  };

  const formatter = new Intl.DateTimeFormat(locale, dateFormatOptions);
  return formatter.format(dateObj);
}
