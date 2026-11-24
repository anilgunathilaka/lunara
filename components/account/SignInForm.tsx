'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/primitives/Input';
import { Button } from '@/components/primitives/Button';
import { authClient } from '@/lib/auth/auth-client';
import { claimOrderAction } from '@/lib/account/actions';
import { cn } from '@/lib/utils';

export interface SignInFormProps {
  /** Same-site path to open after sign-in (already open-redirect checked). */
  next: string;
  /** Pre-filled from the order after purchase (docs/1-ux.md §3.4: "pre-filled, as a convenience"). */
  initialEmail?: string;
  /** Replaces the default intro line. */
  intro?: string;
  /** After sign-in, link this guest order to the account (lib/account/actions.ts). */
  claim?: { number: string; token: string };
  /** Show the two steps (email, code) above the form: the sign-in page. */
  showSteps?: boolean;
}

/** Seconds before another code can be requested. */
const RESEND_AFTER = 30;

/**
 * Passwordless sign-in: email → 6-digit code (lib/auth/auth.ts). Used by
 * staff, and by customers after purchase (never before — CLAUDE.md).
 */
export function SignInForm({ next, initialEmail = '', intro, claim, showSteps = false }: SignInFormProps) {
  const t = useTranslations('auth.signIn');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [wait, setWait] = useState(0);

  // Counts down the wait before "Send a new code" is offered again.
  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  async function requestCode(address: string): Promise<boolean> {
    const { error: failure } = await authClient.emailOtp.sendVerificationOtp({ email: address, type: 'sign-in' });
    if (failure) return false;
    setWait(RESEND_AFTER);
    return true;
  }

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    const address = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setError(t('invalidEmail'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (await requestCode(address)) {
        setEmail(address);
        setNotice(null);
        setStep('code');
      } else setError(t('sendFailed'));
    } catch {
      setError(t('sendFailed'));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setError(null);
    try {
      const ok = await requestCode(email);
      setNotice(ok ? t('resent') : null);
      if (ok) setCode('');
      else setError(t('sendFailed'));
    } catch {
      setError(t('sendFailed'));
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error: failure } = await authClient.signIn.emailOtp({ email, otp: code.trim() });
      if (failure) {
        setError(t('invalidCode'));
        return;
      }
      if (claim) {
        const result = await claimOrderAction(claim);
        if (!result.ok) {
          setError(t('claimFailed'));
          return;
        }
      }
      // Full navigation so server components see the new session cookie.
      window.location.assign(next);
    } catch {
      setError(t('invalidCode'));
    } finally {
      setBusy(false);
    }
  }

  const steps = showSteps && (
    <ol className="signin-steps" aria-label={t('stepsLabel')}>
      <li className={cn('signin-step', step === 'email' ? 'is-current' : 'is-done')} aria-current={step === 'email' ? 'step' : undefined}>
        <span className="signin-step-dot" aria-hidden="true">
          1
        </span>
        {t('stepEmail')}
      </li>
      <li className={cn('signin-step', step === 'code' && 'is-current')} aria-current={step === 'code' ? 'step' : undefined}>
        <span className="signin-step-dot" aria-hidden="true">
          2
        </span>
        {t('stepCode')}
      </li>
    </ol>
  );

  return step === 'email' ? (
    <form className="flex flex-col gap-4" onSubmit={sendCode} noValidate>
      {steps}
      <p className="field-message">{intro ?? t('intro')}</p>
      <Input
        label={t('emailLabel')}
        type="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error ?? undefined}
        required
      />
      <Button type="submit" fullWidth loading={busy} disabled={busy}>
        {t('sendCode')}
      </Button>
    </form>
  ) : (
    <form className="flex flex-col gap-4" onSubmit={verify} noValidate>
      {steps}
      <p className="field-message" role="status">
        {notice ?? t('codeSent', { email })}
      </p>
      <Input
        label={t('codeLabel')}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        error={error ?? undefined}
        className="signin-code"
        autoFocus
        required
      />
      <Button type="submit" fullWidth loading={busy} disabled={busy || code.length !== 6}>
        {t('verify')}
      </Button>
      <div className="signin-code-actions">
        <Button variant="tertiary" disabled={busy || wait > 0} onClick={resend}>
          {wait > 0 ? t('resendIn', { seconds: wait }) : t('resend')}
        </Button>
        <Button
          variant="tertiary"
          onClick={() => {
            setStep('email');
            setCode('');
            setError(null);
            setNotice(null);
          }}
        >
          {t('useDifferentEmail')}
        </Button>
      </div>
    </form>
  );
}
