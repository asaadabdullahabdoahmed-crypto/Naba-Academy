import { ar } from './ar';
import { en } from './en';
import { Locale } from '../config';
import { Dictionary } from '../types';

export * from '../helpers';
export * from '../config';
export * from '../types';
export * from '../useTranslation';
export { ar, en };

export const dictionaries: Record<Locale, Dictionary> = {
  ar,
  en,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.ar;
}
