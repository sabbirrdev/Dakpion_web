import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WritingPad } from '../components/compose/WritingPad';
import { ThemeSelector } from '../components/compose/ThemeSelector';
import { AudioSelector } from '../components/compose/AudioSelector';
import { DeliverySelector } from '../components/compose/DeliverySelector';
import { OrderSummary } from '../components/compose/OrderSummary';
import { OtpModal } from '../components/compose/OtpModal';
import { catalogService } from '../services/catalogService';
import { letterService } from '../services/letterService';
import { useComposeStore } from '../store/composeStore';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useLocale } from '../hooks/useLocale';
import type { AudioTrack, DeliveryOption, ThemeDefinition } from '../types';

type ValidationErrors = Partial<
  Record<'nickname' | 'recipientName' | 'content' | 'recipientPhone' | 'address', string>
>;

export function ComposePage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const pushToast = useUiStore((s) => s.pushToast);
  const user = useAuthStore((s) => s.user);

  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [otpOpen, setOtpOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const store = useComposeStore();

  useEffect(() => {
    Promise.all([
      catalogService.getThemes(),
      catalogService.getAudioTracks(),
      catalogService.getDeliveryOptions(),
    ]).then(([themeRes, audioRes, deliveryRes]) => {
      if (themeRes.success) setThemes(themeRes.data);
      if (audioRes.success) setTracks(audioRes.data);
      if (deliveryRes.success) {
        setDeliveryOptions(deliveryRes.data);
      }
      setCatalogLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTheme = themes.find((th) => th.id === store.themeId);
  const activeAudio = tracks.find((tr) => tr.id === store.audioId);
  const activeDelivery = deliveryOptions.find((d) => d.type === store.deliveryType);

  function validate(): boolean {
    const next: ValidationErrors = {};
    if (!store.senderNickname.trim()) next.nickname = t('compose.validation.nicknameRequired');
    if (!store.recipientName.trim()) next.recipientName = t('compose.validation.recipientNameRequired');

    const plainText = store.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!plainText) next.content = t('compose.validation.contentRequired');
    else if (plainText.length < 10) next.content = t('compose.validation.contentTooShort');

    const needsPhone = store.deliveryType === 'SMS_SPEED_POST' || store.deliveryType === 'PHYSICAL';
    if (needsPhone && !store.recipientPhone.trim()) {
      next.recipientPhone = t('compose.validation.recipientPhoneRequired');
    }
    if (store.deliveryType === 'PHYSICAL' && !store.shippingAddress?.fullAddress?.trim()) {
      next.address = t('compose.validation.addressRequired');
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmitClick() {
    if (!validate()) return;
    // If user is already authenticated with phone, proceed directly
    if (user?.phone) {
      void finalizeSubmission(user.phone);
      return;
    }
    setOtpOpen(true);
  }

  function handleVerified(phone: string) {
    setOtpOpen(false);
    void finalizeSubmission(phone);
  }

  /**
   * Flow:
   * 1. Submit the letter → get back the saved Letter with its id.
   * 2. If paymentStatus === 'UNPAID' (SMS_SPEED_POST or PHYSICAL), initiate SSLCommerz and
   *    redirect the browser to the gateway URL.
   * 3. Otherwise navigate to the sent confirmation page.
   */
  async function finalizeSubmission(phone: string) {
    setSubmitting(true);

    const res = await letterService.submitLetter({
      senderNickname: store.senderNickname,
      senderPhone: phone,
      recipientName: store.recipientName,
      recipientPhone: store.recipientPhone || undefined,
      content: store.content,
      themeId: store.themeId,
      audioId: store.audioId,
      deliveryType: store.deliveryType,
      shippingAddress: store.shippingAddress ?? undefined,
      language: locale,
    });

    if (!res.success) {
      setSubmitting(false);
      pushToast('error', res.message || t('errors.generic'));
      return;
    }

    const letter = res.data;
    store.reset();

    // Payment required — redirect to SSLCommerz gateway
    if (letter.paymentStatus === 'UNPAID') {
      const payRes = await letterService.initiatePayment(letter.id);
      setSubmitting(false);
      if (!payRes.success) {
        pushToast('error', payRes.message || t('errors.paymentInitFailed'));
        // Redirect to sent page anyway so user can retry payment later
        navigate(`/sent/${letter.id}`);
        return;
      }
      // Full-page redirect to SSLCommerz
      window.location.href = payRes.data;
      return;
    }

    setSubmitting(false);
    navigate(`/sent/${letter.id}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          <WritingPad activeTheme={activeTheme} errors={errors} />
          <ThemeSelector themes={themes} loading={catalogLoading} />
          <AudioSelector tracks={tracks} loading={catalogLoading} />
          <DeliverySelector options={deliveryOptions} loading={catalogLoading} errors={errors} />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            theme={activeTheme}
            audio={activeAudio}
            delivery={activeDelivery}
            onSubmit={handleSubmitClick}
            submitting={submitting}
          />
        </div>
      </div>

      <OtpModal open={otpOpen} onClose={() => setOtpOpen(false)} onVerified={handleVerified} />
    </div>
  );
}
