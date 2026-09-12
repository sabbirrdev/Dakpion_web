import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LinkButton } from '../components/shared/LinkButton';

type PaymentResultType = 'success' | 'fail' | 'cancel';

interface PaymentResultPageProps {
  result: PaymentResultType;
}

export function PaymentResultPage({ result }: PaymentResultPageProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [letterId, setLetterId] = useState<string | null>(null);

  useEffect(() => {
    // SSLCommerz passes val_id, tran_id etc — we stored order_id = letter UUID
    const orderId = searchParams.get('order_id') || searchParams.get('tran_id');
    if (orderId) setLetterId(orderId);
  }, [searchParams]);

  const config = {
    success: {
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500',
      titleKey: 'payment.successTitle',
      bodyKey: 'payment.successBody',
    },
    fail: {
      icon: XCircle,
      color: 'text-seal',
      bg: 'bg-seal',
      titleKey: 'payment.failTitle',
      bodyKey: 'payment.failBody',
    },
    cancel: {
      icon: AlertCircle,
      color: 'text-amber-400',
      bg: 'bg-amber-500',
      titleKey: 'payment.cancelTitle',
      bodyKey: 'payment.cancelBody',
    },
  }[result];

  const Icon = config.icon;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-20 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className={`flex h-16 w-16 items-center justify-center rounded-full ${config.bg}`}
      >
        <Icon className="h-8 w-8 text-parchment" strokeWidth={2} />
      </motion.div>

      <h1 className="mt-6 font-display text-3xl text-parchment">
        {t(config.titleKey, { defaultValue: result === 'success' ? 'Payment Successful' : result === 'fail' ? 'Payment Failed' : 'Payment Cancelled' })}
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-parchment/60">
        {t(config.bodyKey, {
          defaultValue:
            result === 'success'
              ? 'Your letter has been confirmed and will be delivered soon.'
              : result === 'fail'
                ? 'Your payment could not be processed. Please try again.'
                : 'You cancelled the payment. Your letter is saved — you can complete payment later.',
        })}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {letterId && result !== 'success' && (
          <LinkButton to={`/sent/${letterId}`} variant="secondary">
            {t('payment.viewLetter', { defaultValue: 'View Letter' })}
          </LinkButton>
        )}
        {letterId && result === 'success' && (
          <LinkButton to={`/sent/${letterId}`} variant="secondary">
            {t('envelopeSuccess.previewOpening')}
          </LinkButton>
        )}
        <LinkButton to="/write" variant="outline-light">
          {t('envelopeSuccess.writeAnother')}
        </LinkButton>
        <Link to="/inbox" className="text-sm text-gold underline">
          {t('nav.inbox')}
        </Link>
      </div>
    </div>
  );
}
