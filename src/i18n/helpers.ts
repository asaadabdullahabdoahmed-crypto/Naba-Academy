import { Locale, Direction } from './config';
import { LOCALE_DIRECTIONS } from './config';

/**
 * Get the reading and layout direction for a given locale
 */
export function getDirection(locale: Locale): Direction {
  return LOCALE_DIRECTIONS[locale] || 'ltr';
}

/**
 * Format a Date object, ISO string, or timestamp according to the specified locale
 */
export function formatDate(
  date: Date | string | number,
  locale: Locale = 'ar',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) {
      return String(date);
    }
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', defaultOptions).format(d);
  } catch {
    return String(date);
  }
}

/**
 * Format a Date in short numeric representation (YYYY-MM-DD or locale standard)
 */
export function formatDateShort(
  date: Date | string | number,
  locale: Locale = 'ar'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format a number using Intl.NumberFormat
 */
export function formatNumber(
  value: number,
  locale: Locale = 'ar',
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', options).format(value);
  } catch {
    return String(value);
  }
}

/**
 * Format currency amount (defaults to Saudi Riyals SAR / ر.س)
 */
export function formatCurrency(
  amount: number,
  locale: Locale = 'ar',
  currency: string = 'SAR'
): string {
  try {
    if (currency === 'SAR') {
      const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
      return locale === 'ar' ? `${formatted} ر.س` : `${formatted} SAR`;
    }

    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/**
 * Format percentage (e.g. 0.984 -> 98.4% or 98.4 ٪)
 */
export function formatPercent(
  value: number,
  locale: Locale = 'ar',
  maximumFractionDigits: number = 1
): string {
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'percent',
      maximumFractionDigits,
    }).format(value);
  } catch {
    return `${value * 100}%`;
  }
}

/**
 * Preserve canonical business and academic identifiers without modification
 * e.g., CS101, NABA-2026-000123, INV-2026-0891, CERT-2026-CS881
 */
export function preserveCanonicalId(id: string | number): string {
  return String(id);
}

/**
 * Resolves bilingual localized fields on mock/demo domain entities
 * e.g., getLocalized(item, 'title', isAr) -> item.titleAr or item.titleEn
 */
export function getLocalized<T extends object>(
  item: T,
  field: string,
  isAr: boolean
): string {
  if (!item) return '';
  const record = item as Record<string, unknown>;
  const arField = `${field}Ar`;
  const enField = `${field}En`;
  if (isAr) {
    const val = record[arField] ?? record[field] ?? record[enField] ?? '';
    return typeof val === 'string' ? val : String(val);
  }
  const val = record[enField] ?? record[field] ?? record[arField] ?? '';
  return typeof val === 'string' ? val : String(val);
}

/**
 * Resolves status label from dictionary with fallback
 */
export function getStatusLabel(status: string, d?: { status?: Record<string, string> }): string {
  if (!status) return '';
  const s = status.toLowerCase();
  if (d && d.status && s in d.status) {
    return d.status[s];
  }
  return status;
}
