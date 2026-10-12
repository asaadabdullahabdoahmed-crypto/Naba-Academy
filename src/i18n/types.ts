import { Locale, Direction } from './config';
import { ar, Dictionary } from './dictionaries/ar';

export type { Locale, Direction, Dictionary };

export type RecursiveKeyOf<TObj extends Record<string, any>> = {
  [TKey in keyof TObj & string]: TObj[TKey] extends Record<string, any>
    ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`;
}[keyof TObj & string];

export type TranslationKey = RecursiveKeyOf<Dictionary>;

export interface I18nContextValue {
  locale: Locale;
  isAr: boolean;
  dir: Direction;
  d: Dictionary;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatPercent: (value: number, decimals?: number) => string;
  setLocale?: (newLocale: Locale) => void;
}
