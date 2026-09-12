import { useTranslation } from 'react-i18next';
import { Link2, MessageSquareText, Truck } from 'lucide-react';
import type { DeliveryOption, DeliveryType } from '../../types';
import { usePicker } from '../../hooks/useLocale';
import { useComposeStore } from '../../store/composeStore';

interface DeliverySelectorProps {
  options: DeliveryOption[];
  loading: boolean;
  errors: Partial<Record<'recipientPhone' | 'address' | 'city', string>>;
}

const ICONS: Record<DeliveryOption['icon'], typeof Link2> = {
  link: Link2,
  sms: MessageSquareText,
  courier: Truck,
};

export function DeliverySelector({ options, loading, errors }: DeliverySelectorProps) {
  const { t } = useTranslation();
  const pick = usePicker();
  const {
    deliveryType,
    recipientPhone,
    shippingAddress,
    setField,
  } = useComposeStore();

  const needsPhone = deliveryType === 'SMS_SPEED_POST' || deliveryType === 'PHYSICAL';
  const needsAddress = deliveryType === 'PHYSICAL';

  return (
    <div>
      <h3 className="font-display text-lg text-parchment">{t('compose.deliverySectionTitle')}</h3>
      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-ink-2" />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {options.map((opt) => {
            const Icon = ICONS[opt.icon];
            const isSelected = opt.type === deliveryType;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setField('deliveryType', opt.type as DeliveryType)}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                  isSelected ? 'border-gold bg-ink-2' : 'border-parchment/10 bg-ink-2/50 hover:border-parchment/25'
                }`}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-parchment">{pick(opt.name)}</span>
                    <span className="text-sm text-parchment/60">
                      {opt.price === 0 ? t('common.free') : `৳${opt.price}`}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-parchment/45">{pick(opt.description)}</span>
                  <span className="mt-1 block text-[11px] text-gold/70">{pick(opt.etaLabel)}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {needsPhone && (
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-parchment/70">
            {t('compose.recipientPhoneLabel')}
          </label>
          <input
            value={recipientPhone}
            onChange={(e) => setField('recipientPhone', e.target.value)}
            placeholder={t('compose.recipientPhonePlaceholder')}
            className="w-full rounded-lg border border-parchment/15 bg-ink-2 px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
          />
          <p className="mt-1 text-xs text-parchment/35">{t('compose.recipientPhoneHint')}</p>
          {errors.recipientPhone && <p className="mt-1 text-xs text-seal">{errors.recipientPhone}</p>}
        </div>
      )}

      {needsAddress && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-parchment/70">
              {t('compose.shippingAddressLabel')}
            </label>
            <input
              value={shippingAddress?.fullAddress ?? ''}
              onChange={(e) =>
                setField('shippingAddress', {
                  fullAddress: e.target.value,
                  city: shippingAddress?.city ?? '',
                  phone: recipientPhone,
                })
              }
              placeholder={t('compose.shippingAddressPlaceholder')}
              className="w-full rounded-lg border border-parchment/15 bg-ink-2 px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-parchment/70">
              {t('compose.shippingCityLabel')}
            </label>
            <input
              value={shippingAddress?.city ?? ''}
              onChange={(e) =>
                setField('shippingAddress', {
                  fullAddress: shippingAddress?.fullAddress ?? '',
                  city: e.target.value,
                  phone: recipientPhone,
                })
              }
              placeholder={t('compose.shippingCityPlaceholder')}
              className="w-full rounded-lg border border-parchment/15 bg-ink-2 px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
            />
          </div>
          {errors.address && <p className="text-xs text-seal sm:col-span-2">{errors.address}</p>}
        </div>
      )}
    </div>
  );
}
