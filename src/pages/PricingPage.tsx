import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import { catalogService } from '../services/catalogService';
import { usePicker } from '../hooks/useLocale';
import { LinkButton } from '../components/shared/LinkButton';
import type { PricingPlan } from '../types';

export function PricingPage() {
  const { t } = useTranslation();
  const pick = usePicker();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogService.getPricingPlans().then((res) => {
      if (res.success) setPlans(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <div className="text-center">
        <h1 className="font-display text-4xl text-parchment">{t('pricing.title')}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-parchment/55">{t('pricing.subtitle')}</p>
      </div>

      {loading ? (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl bg-ink-2" />
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={clsx(
                'relative flex flex-col rounded-2xl border p-7',
                plan.highlighted
                  ? 'border-gold bg-ink-2 shadow-[0_20px_50px_-20px_rgba(201,162,39,0.35)]'
                  : 'border-parchment/10 bg-ink-2/50',
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[11px] font-medium text-charcoal">
                  {t('pricing.mostPopular')}
                </span>
              )}
              <h2 className="font-display text-xl text-parchment">{pick(plan.name)}</h2>
              <p className="mt-1 text-sm text-parchment/50">{pick(plan.tagline)}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-3xl text-parchment">৳{plan.price}</span>
                <span className="text-xs text-parchment/40">/ {pick(plan.billingUnit)}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-parchment/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {pick(f)}
                  </li>
                ))}
              </ul>
              <LinkButton
                to="/write"
                variant={plan.highlighted ? 'primary' : 'secondary'}
                className="mt-7 w-full"
              >
                {t('nav.write')}
              </LinkButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
