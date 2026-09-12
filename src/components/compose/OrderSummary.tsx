import { useTranslation } from 'react-i18next';
import { Button } from '../shared/Button';
import type { AudioTrack, DeliveryOption, ThemeDefinition } from '../../types';
import { usePicker } from '../../hooks/useLocale';

interface OrderSummaryProps {
  theme?: ThemeDefinition;
  audio?: AudioTrack;
  delivery?: DeliveryOption;
  onSubmit: () => void;
  submitting: boolean;
}

export function OrderSummary({ theme, audio, delivery, onSubmit, submitting }: OrderSummaryProps) {
  const { t } = useTranslation();
  const pick = usePicker();

  const themeCost = theme?.tier === 'PREMIUM' ? theme.price : 0;
  const audioCost = audio?.isPremium ? (audio.price ?? 15) : 0;
  const deliveryCost = delivery?.price ?? 0;
  const total = themeCost + audioCost + deliveryCost;

  return (
    <div className="rounded-2xl border border-parchment/10 bg-ink-2 p-6">
      <h3 className="font-display text-lg text-parchment">{t('compose.orderSummaryTitle')}</h3>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between text-parchment/60">
          <dt>
            {t('compose.themeCost')} · {theme ? pick(theme.name) : '—'}
          </dt>
          <dd className="text-parchment">{themeCost === 0 ? t('common.free') : `৳${themeCost}`}</dd>
        </div>
        <div className="flex justify-between text-parchment/60">
          <dt>
            {t('compose.audioCost')} · {audio ? pick(audio.name) : '—'}
          </dt>
          <dd className="text-parchment">{audioCost === 0 ? t('common.free') : `৳${audioCost}`}</dd>
        </div>
        <div className="flex justify-between text-parchment/60">
          <dt>
            {t('compose.deliveryCost')} · {delivery ? pick(delivery.name) : '—'}
          </dt>
          <dd className="text-parchment">{deliveryCost === 0 ? t('common.free') : `৳${deliveryCost}`}</dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-parchment/10 pt-4">
        <span className="text-sm font-medium text-parchment">{t('compose.totalCost')}</span>
        <span className="font-display text-xl text-gold">৳{total}</span>
      </div>
      <Button className="mt-5 w-full" size="lg" onClick={onSubmit} loading={submitting}>
        {total === 0 ? t('compose.submitButtonFree') : t('compose.submitButton')}
      </Button>
      <p className="mt-3 text-center text-xs text-parchment/35">{t('compose.draftSavedNote')}</p>
    </div>
  );
}
