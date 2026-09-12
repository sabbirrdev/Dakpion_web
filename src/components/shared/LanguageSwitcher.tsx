import clsx from 'clsx';
import { useLocale } from '../../hooks/useLocale';

export function LanguageSwitcher({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const { locale, setLocale } = useLocale();

  const base =
    variant === 'dark'
      ? 'border-parchment/25 text-parchment/70'
      : 'border-charcoal/20 text-charcoal/70';
  const active = variant === 'dark' ? 'bg-parchment text-ink' : 'bg-charcoal text-parchment';

  return (
    <div className={clsx('inline-flex items-center rounded-full border p-0.5 text-xs font-medium', base)}>
      <button
        type="button"
        onClick={() => setLocale('bn')}
        aria-pressed={locale === 'bn'}
        className={clsx('rounded-full px-2.5 py-1 transition-colors', locale === 'bn' && active)}
      >
        বাংলা
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        className={clsx('rounded-full px-2.5 py-1 transition-colors', locale === 'en' && active)}
      >
        EN
      </button>
    </div>
  );
}
