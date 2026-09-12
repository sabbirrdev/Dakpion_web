import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { letterService } from '../../services/letterService';
import type { OtpChallenge, ServiceResponse } from '../../types';

interface OtpModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: (phone: string, result?: unknown) => void;
  onRequestOtp?: (phone: string) => Promise<ServiceResponse<OtpChallenge>>;
  onVerifyOtp?: (requestId: string, code: string) => Promise<ServiceResponse<unknown>>;
  title?: string;
  subtitle?: string;
}

export function OtpModal({
  open,
  onClose,
  onVerified,
  onRequestOtp,
  onVerifyOtp,
  title,
  subtitle,
}: OtpModalProps) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!challenge) {
      setCountdown(0);
      return;
    }
    const initialSeconds =
      typeof challenge.canResendInSeconds === 'number'
        ? challenge.canResendInSeconds
        : 60;
    setCountdown(initialSeconds);
  }, [challenge]);

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const reset = () => {
    setPhone('');
    setChallenge(null);
    setCode('');
    setError(null);
    setCountdown(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSendCode = async () => {
    setError(null);
    setLoading(true);
    const reqFn = onRequestOtp || letterService.requestOtp;
    const res = await reqFn(phone);
    setLoading(false);
    if (!res.success) {
      setError(res.code === 'RATE_LIMITED' ? t('otp.rateLimited', 'Too many requests. Please wait before retrying.') : res.message);
      return;
    }
    setChallenge(res.data);
  };

  const handleResendCode = async () => {
    if (countdown > 0 || resending || !phone) return;
    setError(null);
    setResending(true);
    const reqFn = onRequestOtp || letterService.requestOtp;
    const res = await reqFn(phone);
    setResending(false);
    if (!res.success) {
      setError(res.message);
      return;
    }
    setChallenge(res.data);
  };

  const handleVerify = async () => {
    if (!challenge) return;
    setError(null);
    setLoading(true);
    const verifyFn = onVerifyOtp || letterService.verifyOtp;
    const res = await verifyFn(challenge.requestId, code);
    setLoading(false);
    if (!res.success) {
      setError(t('otp.invalidCode', 'Invalid or expired code. Please try again.'));
      return;
    }
    const verifiedPhone = challenge.phone;
    const resultData = res.data;
    reset();
    onVerified(verifiedPhone, resultData);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title || t('otp.title', 'Verify Phone Number')}
      subtitle={
        challenge?.maskedPhone
          ? `${t('otp.subtitleSentTo', 'We sent a code to')} ${challenge.maskedPhone}`
          : subtitle || t('otp.subtitle', 'We will send a 4-digit verification code')
      }
    >
      {!challenge ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal/80">
              {t('otp.phoneLabel', 'Phone Number')}
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('otp.phonePlaceholder', '01XXXXXXXXX')}
              className="w-full rounded-lg border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-seal"
            />
          </div>
          {error && <p className="text-sm text-seal">{error}</p>}
          <Button
            className="w-full"
            onClick={handleSendCode}
            loading={loading}
            disabled={phone.trim().length < 10}
          >
            {t('otp.sendCode', 'Send Code')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal/80">
              {t('otp.codeLabel', 'Enter 4-Digit Code')}
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="----"
              className="w-full rounded-lg border border-charcoal/15 bg-white px-3.5 py-2.5 text-center text-lg tracking-[0.5em] outline-none focus:border-seal font-mono"
            />
          </div>

          {challenge.devHintCode && (
            <p className="rounded-lg bg-gold/10 border border-gold/30 px-3 py-2 text-xs text-charcoal/80">
              {t('otp.devHint', 'Testing Code')}: <strong className="text-charcoal font-mono text-sm">{challenge.devHintCode}</strong>
            </p>
          )}

          {error && <p className="text-sm text-seal">{error}</p>}

          <Button className="w-full" onClick={handleVerify} loading={loading} disabled={code.length !== 4}>
            {t('otp.verifyButton', 'Verify & Continue')}
          </Button>

          <div className="flex items-center justify-between text-xs text-charcoal/60 pt-1">
            <button
              type="button"
              onClick={reset}
              className="hover:text-charcoal underline"
            >
              {t('otp.changeNumber', 'Change number')}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={countdown > 0 || resending}
              className="flex items-center gap-1 hover:text-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
              {countdown > 0 ? (
                <span>{t('otp.resendIn', 'Resend in')} {countdown}s</span>
              ) : (
                <span>{t('otp.resendNow', 'Resend SMS')}</span>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
