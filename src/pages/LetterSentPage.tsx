import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, Loader2 } from 'lucide-react';
import { letterService } from '../services/letterService';
import { useUiStore } from '../store/uiStore';
import { LinkButton } from '../components/shared/LinkButton';
import type { Letter } from '../types';

export function LetterSentPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const pushToast = useUiStore((s) => s.pushToast);
  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);
  const [initiatingPayment, setInitiatingPayment] = useState(false);

  useEffect(() => {
    if (!id) return;
    letterService.getLetterById(id).then((res) => {
      if (res.success) setLetter(res.data);
      setLoading(false);
    });
  }, [id]);

  async function handleRetryPayment() {
    if (!letter) return;
    setInitiatingPayment(true);
    const payRes = await letterService.initiatePayment(letter.id);
    setInitiatingPayment(false);
    if (!payRes.success) {
      pushToast('error', payRes.message || t('errors.paymentInitFailed', { defaultValue: 'Failed to initiate payment.' }));
      return;
    }
    window.location.href = payRes.data;
  }

  if (loading) {
    return <div className="px-5 py-24 text-center text-parchment/50">{t('common.loading')}</div>;
  }

  if (!letter) {
    return (
      <div className="px-5 py-24 text-center">
        <p className="text-parchment/60">{t('envelope.notFoundTitle')}</p>
        <Link to="/write" className="mt-4 inline-block text-gold underline">
          {t('envelope.writeYourOwn')}
        </Link>
      </div>
    );
  }

  const isPendingPayment = letter.paymentStatus === 'UNPAID';

  const bodyKey =
    letter.deliveryType === 'DIGITAL'
      ? 'digitalBody'
      : letter.deliveryType === 'SMS_SPEED_POST'
        ? 'smsBody'
        : 'physicalBody';

  const letterUrl = `${window.location.origin}/letter/${letter.id}`;

  function handleCopyLink() {
    void navigator.clipboard.writeText(letterUrl);
    pushToast('success', t('envelopeSuccess.linkCopied', { defaultValue: 'Link copied to clipboard!' }));
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-20 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className={`flex h-16 w-16 items-center justify-center rounded-full ${
          isPendingPayment ? 'bg-amber-500' : 'bg-seal'
        }`}
      >
        {isPendingPayment ? (
          <AlertTriangle className="h-8 w-8 text-parchment" strokeWidth={2} />
        ) : (
          <Check className="h-8 w-8 text-parchment" strokeWidth={2.5} />
        )}
      </motion.div>

      <h1 className="mt-6 font-display text-3xl text-parchment">
        {isPendingPayment
          ? t('envelopeSuccess.awaitingPaymentTitle', { defaultValue: 'Payment Required' })
          : t('envelopeSuccess.title')}
      </h1>

      <p className="mt-3 max-w-sm text-sm leading-relaxed text-parchment/60">
        {isPendingPayment
          ? t('envelopeSuccess.awaitingPaymentBody', {
              defaultValue:
                'Your letter has been saved. Complete payment to dispatch it for delivery.',
            })
          : t(`envelopeSuccess.${bodyKey}`, { recipient: letter.recipientName })}
      </p>

      {isPendingPayment && (
        <button
          type="button"
          onClick={() => void handleRetryPayment()}
          disabled={initiatingPayment}
          className="mt-6 flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-ink shadow-md transition hover:bg-gold/90 disabled:opacity-60"
        >
          {initiatingPayment && <Loader2 className="h-4 w-4 animate-spin" />}
          {initiatingPayment
            ? t('payment.processing')
            : t('payment.payNow', { defaultValue: 'Pay Now via SSLCommerz' })}
        </button>
      )}

      <p className="mt-4 text-xs text-parchment/35">
        {t('envelopeSuccess.trackingNote', { id: letter.id.slice(0, 8) })}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {!isPendingPayment && letter.deliveryType === 'DIGITAL' && (
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-ink shadow transition hover:bg-gold/90"
          >
            {t('envelopeSuccess.copyLink', { defaultValue: 'Copy Link' })}
          </button>
        )}
        {!isPendingPayment && (
          <LinkButton to={`/letter/${letter.id}`} variant="secondary">
            {t('envelopeSuccess.previewOpening')}
          </LinkButton>
        )}
        <LinkButton to="/write" variant="outline-light">
          {t('envelopeSuccess.writeAnother')}
        </LinkButton>
      </div>
    </div>
  );
}
