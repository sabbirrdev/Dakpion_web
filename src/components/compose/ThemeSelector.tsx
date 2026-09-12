import { useTranslation } from 'react-i18next';
import { Check, Lock } from 'lucide-react';
import type { ThemeDefinition } from '../../types';
import { usePicker } from '../../hooks/useLocale';
import { useComposeStore } from '../../store/composeStore';

interface ThemeSelectorProps {
  themes: ThemeDefinition[];
  loading: boolean;
}

export function ThemeSelector({ themes, loading }: ThemeSelectorProps) {
  const { t } = useTranslation();
  const pick = usePicker();
  const { themeId, setField } = useComposeStore();

  return (
    <div>
      <h3 className="font-display text-lg text-parchment">{t('compose.themeSectionTitle')}</h3>
      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-ink-2" />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {themes.map((theme) => {
            const isActive = theme.id === themeId;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setField('themeId', theme.id)}
                className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
                  isActive ? 'border-gold ring-1 ring-gold' : 'border-parchment/10 hover:border-parchment/30'
                }`}
                style={{ backgroundColor: theme.palette.paperBg }}
              >
                <div className="flex items-start justify-between">
                  <span
                    className="h-4 w-4 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.palette.seal }}
                  />
                  {theme.tier === 'PREMIUM' ? (
                    <Lock className="h-3.5 w-3.5 opacity-40" style={{ color: theme.palette.ink }} />
                  ) : isActive ? (
                    <Check className="h-3.5 w-3.5 text-gold" />
                  ) : null}
                </div>
                <p className="mt-3 text-sm font-medium" style={{ color: theme.palette.ink }}>
                  {pick(theme.name)}
                </p>
                <p className="mt-0.5 text-[11px] opacity-60" style={{ color: theme.palette.ink }}>
                  {theme.tier === 'FREE' ? t('common.free') : `৳${theme.price}`}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
