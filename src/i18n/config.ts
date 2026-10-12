export type Locale = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export const SUPPORTED_LOCALES: readonly Locale[] = ['ar', 'en'] as const;
export const DEFAULT_LOCALE: Locale = 'ar';

export const LOCALE_DIRECTIONS: Record<Locale, Direction> = {
  ar: 'rtl',
  en: 'ltr',
};

export const LOCALE_NAMES: Record<Locale, { native: string; english: string }> = {
  ar: { native: 'العربية', english: 'Arabic' },
  en: { native: 'English', english: 'English' },
};

export const LOCALE_FONTS: Record<Locale, string> = {
  ar: 'Cairo, Tajawal, system-ui, sans-serif',
  en: 'Plus Jakarta Sans, system-ui, sans-serif',
};
