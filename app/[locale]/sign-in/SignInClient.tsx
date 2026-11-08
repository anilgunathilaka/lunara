'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/primitives/Input';
import { Button } from '@/components/primitives/Button';
import { authClient } from '@/lib/auth/auth-client';

/**
 * Passwordless sign-in: email → 6-digit code (lib/auth/auth.ts). Used by
 * staff now and by customers after purchase (never before — CLAUDE.md).
 */
export function SignInClient({ next }: { next: string }) {
  const t = useTranslations('auth.signIn');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const { error: failure } = await authClient.emailOtp.sendVerificationOtp({ email: address, type: 'sign-in' });
      if (failure) setError(t('sendFailed'));
      else {
        setEmail(address);
        setStep('code');
      }
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
      // Full navigation so server components see the new session cookie.
      window.location.assign(next);
    } catch {
      setError(t('invalidCode'));
    } finally {
      setBusy(false);
    }
  }

  return step === 'email' ? (
    <form className="flex flex-col gap-4" onSubmit={sendCode} noValidate>
      <p className="field-message">{t('intro')}</p>
      <Input
        label={t('emailLabel')}
        type="email"
        autoComplete="email"
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
      <p className="field-message" role="status">
        {t('codeSent', { email })}
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
        required
      />
      <Button type="submit" fullWidth loading={busy} disabled={busy || code.length !== 6}>
        {t('verify')}
      </Button>
      <Button
        variant="tertiary"
        onClick={() => {
          setStep('email');
          setCode('');
          setError(null);
        }}
      >
        {t('useDifferentEmail')}
      </Button>
    </form>
  );
}
