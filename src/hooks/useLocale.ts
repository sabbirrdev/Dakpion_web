import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { LocaleCode } from '../types';

/**
 * Central place for locale-aware document side effects (lang attribute,
 * font-family switching via a data attribute the CSS keys off). Bengali and
 * Latin scripts want different type stacks, so we flag it on <html>.
 */
export function useLocale() {
  const { i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage ?? i18n.language ?? 'bn') as LocaleCode;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.script = locale === 'bn' ? 'bengali' : 'latin';
  }, [locale]);

  const setLocale = useCallback(
    (next: LocaleCode) => {
      i18n.changeLanguage(next);
    },
    [i18n],
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'bn' ? 'en' : 'bn');
  }, [locale, setLocale]);

  return { locale, setLocale, toggleLocale };
}

/** Pulls the right language out of a `{ en, bn }` localized-text object. */
export function usePicker() {
  const { locale } = useLocale();
  return <T extends { en: string; bn: string }>(text: T) => text[locale];
}
