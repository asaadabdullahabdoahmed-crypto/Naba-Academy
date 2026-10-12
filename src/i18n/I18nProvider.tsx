import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Locale, Direction, DEFAULT_LOCALE } from './config';
import { getDirection, formatDate as formatDt, formatNumber as formatNum, formatCurrency as formatCurr, formatPercent as formatPct } from './helpers';
import { Dictionary, I18nContextValue } from './types';
import { dictionaries, getDictionary } from './dictionaries/index';

export const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  locale: Locale;
  children: React.ReactNode;
}

/**
 * Resolves a dot-delimited key path within an object
 */
function resolvePath(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ locale = DEFAULT_LOCALE, children }) => {
  const isAr = locale === 'ar';
  const dir: Direction = getDirection(locale);
  const d: Dictionary = useMemo(() => getDictionary(locale), [locale]);

  // Synchronize document direction and lang attributes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
      document.documentElement.className = isAr ? 'font-arabic' : 'font-sans';
    }
  }, [locale, dir, isAr]);

  const value: I18nContextValue = useMemo(() => {
    const t = (key: string, params?: Record<string, string | number>): string => {
      let text = resolvePath(d, key);

      // Fallback to Arabic canonical dictionary if not found in current
      if (!text && locale !== 'ar') {
        text = resolvePath(dictionaries.ar, key);
      }

      if (!text) {
        return key;
      }

      // Interpolation for {param} or {{param}}
      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          const regex = new RegExp(`\\{\\{?${paramKey}\\}?\\}`, 'g');
          text = text!.replace(regex, String(paramVal));
        });
      }

      return text;
    };

    return {
      locale,
      isAr,
      dir,
      d,
      t,
      formatDate: (date, options) => formatDt(date, locale, options),
      formatNumber: (val, options) => formatNum(val, locale, options),
      formatCurrency: (amount, curr) => formatCurr(amount, locale, curr),
      formatPercent: (val, decimals) => formatPct(val, locale, decimals),
    };
  }, [locale, isAr, dir, d]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
