'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/primitives/Button';
import { claimOrderAction } from '@/lib/account/actions';
import { SignInForm } from './SignInForm';

export interface SaveOrderPanelProps {
  number: string;
  token: string;
  /** Where the order lives once saved: /{locale}/account/orders/{number}. */
  accountOrderHref: string;
  /** The order's email, to pre-fill (docs/1-ux.md §3.4). */
  orderEmail: string | null;
  /** Signed in already: one tap links the order, no code needed. */
  signedInEmail: string | null;
}

/**
 * The post-purchase account offer (PRD FR-33): shown only after an order
 * exists, optional, and never in the way of the order record above it.
 */
export function SaveOrderPanel({ number, token, accountOrderHref, orderEmail, signedInEmail }: SaveOrderPanelProps) {
  const t = useTranslations('account.saveOrder');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    setBusy(true);
    setError(null);
    try {
      const result = await claimOrderAction({ number, token });
      if (result.ok) window.location.assign(accountOrderHref);
      else setError(t('failed'));
    } catch {
      setError(t('failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="account-offer flex flex-col gap-3" aria-labelledby="save-order-heading">
      <h2 id="save-order-heading" className="checkout-step-title">
        {t('heading')}
      </h2>
      {signedInEmail ? (
        <>
          <p className="field-message">{t('signedInBody', { email: signedInEmail })}</p>
          {error && (
            <p className="field-message-error" role="alert">
              {error}
            </p>
          )}
          <Button onClick={claim} loading={busy} disabled={busy}>
            {t('addToAccount')}
          </Button>
        </>
      ) : (
        <SignInForm next={accountOrderHref} initialEmail={orderEmail ?? ''} intro={t('body')} claim={{ number, token }} />
      )}
    </section>
  );
}
