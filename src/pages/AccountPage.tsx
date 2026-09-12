import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  Phone,
  LogOut,
  Check,
  Inbox,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  RefreshCw,
  PenTool,
  Shield,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { Button } from '../components/shared/Button';
import { LinkButton } from '../components/shared/LinkButton';
import { authService } from '../services/authService';
import type { OtpChallenge } from '../types';

export function AccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const pushToast = useUiStore((s) => s.pushToast);

  const [nickname, setNickname] = useState(user?.nickname || user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // OTP Verification Widget State
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [verifyPhoneInput, setVerifyPhoneInput] = useState(user?.phone || '');
  const [otpChallenge, setOtpChallenge] = useState<OtpChallenge | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Fetch real profile from DB on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingProfile(true);
      const res = await authService.me();
      if (mounted && res.success && res.data) {
        updateUser(res.data);
        setNickname(res.data.nickname || res.data.displayName || res.data.username || '');
        setPhone(res.data.phone || '');
        setVerifyPhoneInput(res.data.phone || '');
      }
      if (mounted) setLoadingProfile(false);
    })();
    return () => {
      mounted = false;
    };
  }, [updateUser]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setSaving(true);
    const res = await authService.updateProfile({
      nickname: nickname.trim(),
      displayName: nickname.trim(),
      phone: phone.trim() || undefined,
    });
    setSaving(false);

    if (res.success) {
      updateUser(res.data);
      setSaved(true);
      pushToast('success', t('account.nicknameSaved', 'Profile updated successfully'));
      setTimeout(() => setSaved(false), 2500);
    } else {
      pushToast('error', res.message || 'Failed to update profile');
    }
  };

  // Request OTP code for logged-in user phone verification
  const handleRequestPhoneOtp = async () => {
    const targetPhone = verifyPhoneInput.trim() || phone.trim();
    if (!targetPhone) {
      pushToast('error', 'Please enter a valid phone number');
      return;
    }

    setOtpLoading(true);
    const res = await authService.requestPhoneVerify(targetPhone);
    setOtpLoading(false);

    if (res.success) {
      setOtpChallenge(res.data);
      setOtpCountdown(res.data.canResendInSeconds || 60);
      setIsVerifyingPhone(true);
      pushToast('info', 'Verification code generated for your phone');
    } else {
      pushToast('error', res.message || 'Could not send verification code');
    }
  };

  // Verify OTP code and mark phone as verified
  const handleConfirmPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpChallenge || otpCode.trim().length !== 6) {
      pushToast('error', 'Please enter the 6-digit code');
      return; 
    }

    setOtpLoading(true);
    const res = await authService.verifyPhone(otpChallenge.requestId, otpCode.trim());
    setOtpLoading(false);

    if (res.success) {
      updateUser({ ...res.data, phoneVerified: true });
      setIsVerifyingPhone(false);
      setOtpChallenge(null);
      setOtpCode('');
      pushToast('success', 'Phone number successfully verified! Any letters sent to you are now in your inbox.');
    } else {
      pushToast('error', res.message || 'Incorrect or expired code');
    }
  };

  const handleSignOut = () => {
    logout();
    pushToast('info', t('account.signedOut', 'You have been signed out'));
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 font-solaiman">
      <div className="rounded-3xl border border-parchment/15 bg-ink-2 p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-parchment/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 text-gold border border-gold/30 shadow-inner">
              <UserIcon className="h-8 w-8" />
              {user?.phoneVerified && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-ink shadow">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl text-parchment">
                  {user?.nickname || user?.displayName || user?.username || t('account.defaultName', 'Traveler')}
                </h1>
                {user?.role && ['ADMIN', 'SYSTEM_ADMIN', 'MODERATOR'].includes(user.role) && (
                  <span className="rounded-full bg-gold/15 border border-gold/30 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-gold uppercase">
                    {user.role}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-parchment/60 mt-1">
                <span className="font-mono">@{user?.username || 'user'}</span>
                {user?.createdAt && (
                  <span className="flex items-center gap-1 text-parchment/40">
                    <Calendar className="h-3 w-3" />
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LinkButton to="/write" variant="primary" size="sm" className="shadow-md">
              <PenTool className="h-3.5 w-3.5 mr-1.5" />
              Compose Letter
            </LinkButton>
            <LinkButton to="/inbox" variant="secondary" size="sm">
              <Inbox className="h-3.5 w-3.5 mr-1.5" />
              Inbox
            </LinkButton>
          </div>
        </div>

        {/* Phone Verification Banner / Widget */}
        <div className="rounded-2xl border border-parchment/10 bg-ink p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border ${
                user?.phoneVerified
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {user?.phoneVerified ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-parchment">
                    Phone Number Verification / ফোন নম্বর যাচাই
                  </h3>
                  {user?.phoneVerified ? (
                    <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                      Unverified
                    </span>
                  )}
                </div>
                <p className="text-xs text-parchment/60 mt-0.5">
                  {user?.phoneVerified
                    ? `Verified mobile: ${user?.phone || '01XX-XXX-XXX'}. You can automatically receive Speed Post & digital letters.`
                    : 'Verify your phone to automatically claim wax-sealed letters and Speed Post messages addressed to you.'}
                </p>
              </div>
            </div>

            {!user?.phoneVerified && !isVerifyingPhone && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsVerifyingPhone(true)}
                className="whitespace-nowrap border-gold/30 text-gold hover:bg-gold/10"
              >
                <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                Verify Phone with OTP
              </Button>
            )}
          </div>

          {/* Inline OTP Verification Flow for Logged-In User */}
          {isVerifyingPhone && !user?.phoneVerified && (
            <div className="mt-4 pt-4 border-t border-parchment/10 space-y-4">
              {!otpChallenge ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-parchment/70">
                      Bangladeshi Phone Number (01XXXXXXXXX)
                    </label>
                    <input
                      type="tel"
                      value={verifyPhoneInput}
                      onChange={(e) => setVerifyPhoneInput(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full rounded-lg border border-parchment/15 bg-ink-2 px-3.5 py-2 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleRequestPhoneOtp}
                      disabled={otpLoading || verifyPhoneInput.trim().length < 10}
                    >
                      {otpLoading ? 'Generating…' : 'Send OTP'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsVerifyingPhone(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmPhoneOtp} className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-parchment/70">
                        Enter 4-Digit OTP ({otpChallenge.maskedPhone || otpChallenge.phone})
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="------"
                        className="w-full rounded-lg border border-parchment/15 bg-ink-2 px-3.5 py-2 text-center text-base tracking-[0.4em] text-parchment outline-none focus:border-gold font-mono"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={otpLoading || otpCode.length !== 6}
                      >
                        {otpLoading ? 'Verifying…' : 'Verify & Link'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setOtpChallenge(null);
                          setOtpCode('');
                        }}
                      >
                        Back
                      </Button>
                    </div>
                  </div>

                  {otpChallenge.devHintCode && (
                    <div className="flex items-center gap-2 rounded-lg bg-gold/10 border border-gold/30 px-3 py-2 text-xs text-parchment/80">
                      <Sparkles className="h-4 w-4 text-gold flex-shrink-0" />
                      <span>
                        Testing OTP Code: <strong className="text-gold font-mono text-sm">{otpChallenge.devHintCode}</strong>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-parchment/50 pt-1">
                    <span>Code valid for 5 minutes</span>
                    <button
                      type="button"
                      onClick={handleRequestPhoneOtp}
                      disabled={otpCountdown > 0 || otpLoading}
                      className="flex items-center gap-1 text-gold hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`h-3 w-3 ${otpLoading ? 'animate-spin' : ''}`} />
                      {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <h2 className="text-base font-semibold text-parchment border-b border-parchment/10 pb-2">
            Profile Information / ব্যক্তিগত তথ্য
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-parchment/70">
                Username (Immutable)
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full rounded-lg border border-parchment/10 bg-ink/50 px-3.5 py-2.5 text-sm text-parchment/50 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-parchment/70">
                {t('account.nicknameLabel', 'Display Name / ডাকনাম')}
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Dreamer or কবি"
                className="w-full rounded-lg border border-parchment/15 bg-ink px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-medium text-parchment/70">
                Bangladeshi Phone Number
              </label>
              {user?.phoneVerified && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setVerifyPhoneInput(e.target.value);
                }}
                placeholder="017XXXXXXXX"
                className="w-full rounded-lg border border-parchment/15 bg-ink px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold font-mono transition-colors"
              />
              <Phone className="absolute right-3.5 top-3 h-4 w-4 text-parchment/30 pointer-events-none" />
            </div>
            <p className="mt-1 text-[11px] text-parchment/45">
              Used to deliver Speed Post notifications and discover received letters.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" disabled={saving || loadingProfile}>
              {saved ? (
                <span className="flex items-center gap-1.5 text-ink font-semibold">
                  <Check className="h-4 w-4" /> Saved
                </span>
              ) : saving ? (
                'Saving…'
              ) : (
                t('common.save', 'Save Changes')
              )}
            </Button>
          </div>
        </form>

        {/* Quick Links & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-parchment/10 pt-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {user?.role && ['ADMIN', 'SYSTEM_ADMIN', 'MODERATOR'].includes(user.role) && (
              <LinkButton to="/admin" variant="secondary" size="sm" className="w-full sm:w-auto">
                <Shield className="h-4 w-4 mr-1.5 text-gold" />
                Admin Dashboard
              </LinkButton>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full sm:w-auto text-seal hover:bg-seal/10 hover:text-seal"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            {t('account.signOut', 'Sign Out')}
          </Button>
        </div>
      </div>
    </div>
  );
}

