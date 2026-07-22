import fr from './fr';
import en from './en';
import type { Translations, Lang, NestedKeyOf } from './types';

const translations: Record<Lang, Translations> = { fr, en };

type TranslationKey = NestedKeyOf<Translations>;

export function t(key: TranslationKey, lang: Lang = 'fr'): string {
  const keys = key.split('.');
  let value: unknown = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      console.warn(`[i18n] Missing translation key: "${key}" for language "${lang}"`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`[i18n] Translation key "${key}" is not a string for language "${lang}"`);
    return key;
  }

  return value;
}

export type { Translations, Lang, TranslationKey };
