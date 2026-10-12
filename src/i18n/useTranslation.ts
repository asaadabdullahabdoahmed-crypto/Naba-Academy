import { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { I18nContext } from './I18nProvider';
import { Locale, DEFAULT_LOCALE } from './config';
import { getDirection, formatDate as formatDt, formatNumber as formatNum, formatCurrency as formatCurr, formatPercent as formatPct } from './helpers';
import { dictionaries, getDictionary } from './dictionaries/index';
import { I18nContextValue } from './types';

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

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  const params = useParams<{ locale?: string }>();

  // If already inside an I18nProvider, return provider value
  if (context) {
    return context;
  }

  // Fallback standalone mode (e.g. if used outside provider)
  const inferredLocale: Locale = params.locale === 'en' ? 'en' : DEFAULT_LOCALE;
  const isAr = inferredLocale === 'ar';
  const dir = getDirection(inferredLocale);
  const d = getDictionary(inferredLocale);

  const t = (key: string, interpolateParams?: Record<string, string | number>): string => {
    let text = resolvePath(d, key);
    if (!text && inferredLocale !== 'ar') {
      text = resolvePath(dictionaries.ar, key);
    }
    if (!text) {
      return key;
    }
    if (interpolateParams) {
      Object.entries(interpolateParams).forEach(([paramKey, paramVal]) => {
        const regex = new RegExp(`\\{\\{?${paramKey}\\}?\\}`, 'g');
        text = text!.replace(regex, String(paramVal));
      });
    }
    return text;
  };

  return {
    locale: inferredLocale,
    isAr,
    dir,
    d,
    t,
    formatDate: (date, options) => formatDt(date, inferredLocale, options),
    formatNumber: (val, options) => formatNum(val, inferredLocale, options),
    formatCurrency: (amount, curr) => formatCurr(amount, inferredLocale, curr),
    formatPercent: (val, decimals) => formatPct(val, inferredLocale, decimals),
  };
}
