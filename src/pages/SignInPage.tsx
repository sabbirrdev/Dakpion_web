import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Feather, Lock, AlertCircle, KeyRound, RefreshCw, ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import type { OtpChallenge } from '../types';

type AuthMode = 'signin' | 'signup' | 'forgot';

export function SignInPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pushToast = useUiStore((s) => s.pushToast);
  const setAuth = useAuthStore((s) => s.setAuth);

  // Initialize mode from URL path or search param
  const initialMode: AuthMode =
    location.pathname.includes('sign-up') || location.pathname.includes('register') || searchParams.get('mode') === 'signup'
      ? 'signup'
      : location.pathname.includes('forgot') || searchParams.get('mode') === 'forgot'
        ? 'forgot'
        : 'signin';

  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Sign In / Sign Up Form Fields
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Forgot Password State
  const [forgotInput, setForgotInput] = useState('');
  const [forgotChallenge, setForgotChallenge] = useState<OtpChallenge | null>(null);
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotCountdown, setForgotCountdown] = useState(0);

  const redirectUrl = searchParams.get('redirect') || '/inbox';

  useEffect(() => {
    if (location.pathname.includes('sign-up') || location.pathname.includes('register')) {
      setMode('signup');
    } else if (location.pathname.includes('forgot')) {
      setMode('forgot');
    }
  }, [location.pathname]);

  // Countdown timer for forgot password
  useEffect(() => {
    if (forgotCountdown <= 0) return;
    const timer = setInterval(() => {
      setForgotCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotCountdown]);

  // Bangladeshi phone number format validation
  const validateBdPhone = (p: string): boolean => {
    if (!p) return true;
    const clean = p.replaceAll(/[^0-9+]/g, '');
    let normalized = clean;
    if (normalized.startsWith('+880')) normalized = '0' + normalized.substring(4);
    else if (normalized.startsWith('880')) normalized = '0' + normalized.substring(3);
    else if (normalized.length === 10 && normalized.startsWith('1')) normalized = '0' + normalized;
    return /^01[3-9]\d{8}$/.test(normalized);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!username.trim() || !password.trim()) return;

    setIsSubmitting(true);
    const res = await authService.signIn({
      username: username.trim(),
      password: password.trim(),
    });
    setIsSubmitting(false);

    if (res.success) {
      setAuth(res.data.token, res.data.user, res.data.refreshToken);
      pushToast('success', t('auth.signInSuccess', 'Welcome back! Your desk is ready.'));

      if (['ADMIN', 'SYSTEM_ADMIN', 'MODERATOR', 'DEVELOPER'].includes(res.data.user.role || res.data.user.appUserType || '')) {
        const dest = redirectUrl === '/inbox' ? '/admin' : redirectUrl;
        navigate(dest, { replace: true });
      } else {
        navigate(redirectUrl, { replace: true });
      }
    } else {
      setValidationError(res.message || 'Invalid username or password');
      pushToast('error', res.message || 'Invalid username or password');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!username.trim()) {
      setValidationError('Username is required');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (phone.trim() && !validateBdPhone(phone.trim())) {
      setValidationError('Invalid Bangladeshi phone number. Format: 01XXXXXXXXX');
      return;
    }

    setIsSubmitting(true);
    const res = await authService.signUp({
      username: username.trim(),
      displayName: displayName.trim() || username.trim(),
      phone: phone.trim() || undefined,
      password: password.trim(),
    });
    setIsSubmitting(false);

    if (res.success) {
      setAuth(res.data.token, res.data.user, res.data.refreshToken);
      pushToast('success', 'Account created successfully! Welcome to DakPion.');
      navigate(redirectUrl, { replace: true });
    } else {
      setValidationError(res.message || 'Registration failed. Please try again.');
      pushToast('error', res.message || 'Registration failed');
    }
  };

  // Forgot Password step 1: request code
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!forgotInput.trim()) {
      setValidationError('Please enter your phone number or username');
      return;
    }

    setIsSubmitting(true);
    const res = await authService.requestForgotPassword(forgotInput.trim());
    setIsSubmitting(false);

    if (res.success) {
      setForgotChallenge(res.data);
      setForgotCountdown(res.data.canResendInSeconds || 60);
      pushToast('info', 'Verification code generated for password reset');
    } else {
      setValidationError(res.message || 'Account not found');
      pushToast('error', res.message || 'Account not found');
    }
  };

  // Forgot Password step 2: verify & reset
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!forgotChallenge) return;
    if (forgotCode.trim().length !== 4) {
      setValidationError('Please enter the 4-digit verification code');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setValidationError('New password must be at least 6 characters');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const res = await authService.resetPassword(
      forgotChallenge.requestId,
      forgotCode.trim(),
      forgotNewPassword.trim(),
    );
    setIsSubmitting(false);

    if (res.success) {
      setAuth(res.data.token, res.data.user, res.data.refreshToken);
      pushToast('success', 'Password reset successfully! Welcome back.');
      navigate(redirectUrl, { replace: true });
    } else {
      setValidationError(res.message || 'Failed to reset password');
      pushToast('error', res.message || 'Failed to reset password');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-5 py-12 bg-ink-vignette font-solaiman">
      <div className="w-full max-w-md rounded-2xl border border-parchment/15 bg-ink-2 p-8 shadow-2xl sm:p-10">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/30">
            {mode === 'forgot' ? <KeyRound className="h-6 w-6" /> : <Feather className="h-6 w-6" />}
          </div>
        </div>

        <h1 className="text-center font-display text-2xl text-parchment">
          {mode === 'signin'
            ? t('auth.adminTitle', 'Sign in to DakPion')
            : mode === 'signup'
              ? 'Create DakPion Account'
              : 'Reset Password / পাসওয়ার্ড রিসেট'}
        </h1>
        <p className="mt-2 text-center text-sm text-parchment/60">
          {mode === 'signin'
            ? t('auth.adminSubtitle', 'Sign in with your username or registered phone.')
            : mode === 'signup'
              ? 'Join DakPion to compose, seal, and send timeless heartfelt letters.'
              : 'Enter your registered phone or username to reset your account password.'}
        </p>

        {/* Tab switch */}
        {mode !== 'forgot' ? (
          <div className="mt-6 flex rounded-xl bg-ink p-1 border border-parchment/10 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setValidationError(null);
              }}
              className={`flex items-center justify-center gap-1.5 flex-1 rounded-lg py-2.5 text-center font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-ink-2 text-gold shadow-sm border border-gold/20'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setValidationError(null);
              }}
              className={`flex items-center justify-center gap-1.5 flex-1 rounded-lg py-2.5 text-center font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-ink-2 text-gold shadow-sm border border-gold/20'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setForgotChallenge(null);
              setValidationError(null);
            }}
            className="mt-4 flex items-center gap-1.5 text-xs text-gold/80 hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </button>
        )}

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-seal/15 border border-seal/30 px-3.5 py-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* MODE 1: SIGN IN */}
        {/* ------------------------------------------------------------------ */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-parchment/70">
                Username or Phone Number
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. 017XXXXXXXX or your username"
                className="w-full rounded-lg border border-parchment/15 bg-ink px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
                required
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-parchment/70">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setValidationError(null);
                  }}
                  className="text-xs text-gold/80 hover:text-gold transition-colors underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-parchment/15 bg-ink px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold pr-10"
                  required
                />
                <Lock className="absolute right-3.5 h-4 w-4 text-parchment/30 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              variant="primary"
              disabled={isSubmitting || !username.trim() || !password.trim()}
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-xs text-parchment/60 hover:text-gold transition-colors"
              >
                Don't have an account? <span className="text-gold underline">Register now</span>
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* MODE 2: SIGN UP */}
        {/* ------------------------------------------------------------------ */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="mt-6 space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-medium text-parchment/70">
                Username <span className="text-seal">*</span>
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. poet_traveler"
                className="w-full rounded-lg border border-parchment/15 bg-ink px-3 py-2 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-parchment/70">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Kazi Nazrul"
                className="w-full rounded-lg border border-parchment/15 bg-ink px-3 py-2 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-parchment/70">
                Bangladeshi Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-lg border border-parchment/15 bg-ink px-3 py-2 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-parchment/70">
                Password (min. 6 characters) <span className="text-seal">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-parchment/15 bg-ink px-3 py-2 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-parchment/70">
                Confirm Password <span className="text-seal">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-parchment/15 bg-ink px-3 py-2 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-3"
              variant="primary"
              disabled={isSubmitting || !username.trim() || password.length < 6}
            >
              {isSubmitting ? 'Creating Account…' : 'Register & Start Writing'}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-xs text-parchment/60 hover:text-gold transition-colors"
              >
                Already have an account? <span className="text-gold underline">Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* MODE 3: FORGOT PASSWORD */}
        {/* ------------------------------------------------------------------ */}
        {mode === 'forgot' && (
          <div className="mt-6">
            {!forgotChallenge ? (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-parchment/70">
                    Registered Phone Number or Username
                  </label>
                  <input
                    type="text"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX or username"
                    className="w-full rounded-lg border border-parchment/15 bg-ink px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="primary"
                  disabled={isSubmitting || !forgotInput.trim()}
                >
                  {isSubmitting ? 'Generating Code…' : 'Send Verification Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleForgotReset} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-parchment/70">
                    4-Digit Verification Code ({forgotChallenge.maskedPhone})
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="----"
                    className="w-full rounded-lg border border-parchment/15 bg-ink px-3.5 py-2.5 text-center text-lg tracking-[0.5em] text-parchment outline-none focus:border-gold font-mono"
                    required
                  />
                </div>

                {forgotChallenge.devHintCode && (
                  <p className="rounded-lg bg-gold/10 border border-gold/30 px-3 py-2 text-xs text-parchment/80">
                    Testing Code: <strong className="text-gold font-mono text-sm">{forgotChallenge.devHintCode}</strong>
                  </p>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-parchment/70">
                    New Password (min. 6 characters)
                  </label>
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-parchment/15 bg-ink px-3.5 py-2 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-parchment/70">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-parchment/15 bg-ink px-3.5 py-2 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="primary"
                  disabled={isSubmitting || forgotCode.length !== 4 || forgotNewPassword.length < 6}
                >
                  {isSubmitting ? 'Resetting Password…' : 'Reset Password & Sign In'}
                </Button>

                <div className="flex items-center justify-between text-xs text-parchment/50 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotChallenge(null)}
                    className="hover:text-gold underline"
                  >
                    Change phone/username
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotRequest}
                    disabled={forgotCountdown > 0 || isSubmitting}
                    className="flex items-center gap-1 hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                    {forgotCountdown > 0 ? (
                      <span>Resend in {forgotCountdown}s</span>
                    ) : (
                      <span>Resend Code</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
