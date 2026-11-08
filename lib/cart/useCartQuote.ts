'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { quoteCartAction } from '@/lib/commerce/actions';
import type { OfferedPaymentMethod } from '@/lib/commerce/cart-ref';
import type { CartQuote, QuotedLine } from '@/lib/commerce/quote';
import type { CartLineItem } from './CartContext';

interface QuoteState {
  /** The request signature this state answers. */
  signature: string;
  quote: CartQuote | null;
  failed: boolean;
}

/**
 * Asks the server to price the cart (docs/4-architecture.md §3.4). Re-runs
 * whenever lines, quantities, district or payment method change. The
 * client renders the result; it never computes a price itself.
 *
 * `loading` is derived (the latest answer is for an older request), so no
 * state is set synchronously inside the effect.
 */
export function useCartQuote(
  items: CartLineItem[],
  options: { district?: string; paymentMethod?: OfferedPaymentMethod; enabled?: boolean } = {},
) {
  const { district, paymentMethod, enabled = true } = options;
  const [state, setState] = useState<QuoteState>({ signature: '', quote: null, failed: false });
  const [attempt, setAttempt] = useState(0);
  const latest = useRef('');

  const lines = items.map((i) => ({ key: i.id, ref: i.ref, quantity: i.quantity }));
  const signature = JSON.stringify([lines, district || null, paymentMethod ?? null, attempt]);
  const active = enabled && items.length > 0;

  useEffect(() => {
    if (!active) return;
    latest.current = signature;
    const [requestLines, requestDistrict, requestPayment] = JSON.parse(signature) as [
      typeof lines,
      string | null,
      OfferedPaymentMethod | null,
    ];
    quoteCartAction({
      lines: requestLines,
      district: requestDistrict ?? undefined,
      paymentMethod: requestPayment ?? undefined,
    })
      .then((result) => {
        if (latest.current !== signature) return; // superseded by a newer request
        setState(result.ok ? { signature, quote: result.quote, failed: false } : { signature, quote: null, failed: true });
      })
      .catch(() => {
        if (latest.current === signature) setState((prev) => ({ ...prev, signature, failed: true }));
      });
  }, [signature, active]);

  const answered = state.signature === signature;
  const loading = active && !answered;
  const failed = answered && state.failed;

  /** Replace the quote with one returned by order placement. */
  const setQuote = useCallback(
    (quote: CartQuote) => setState({ signature, quote, failed: false }),
    [signature],
  );

  const refresh = useCallback(() => setAttempt((n) => n + 1), []);

  const lineFor = useCallback(
    (key: string): QuotedLine | undefined => state.quote?.lines.find((line) => line.key === key),
    [state.quote],
  );

  return { quote: state.quote, setQuote, loading, failed, refresh, lineFor };
}
