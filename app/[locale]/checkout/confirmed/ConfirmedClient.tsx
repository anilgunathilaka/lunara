'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { SectionMarker } from '@/components/brand/SectionMarker';

export interface ConfirmedClientProps {
  heading: string;
  orderNumberLabel: string;
  body: string;
  unstitchedReminder: string;
  backHomeLabel: string;
}

interface LastOrder {
  orderNumber: string;
  total: number;
  itemCount: number;
  district: string;
}

/**
 * Client component because the order snapshot lives in sessionStorage —
 * there is no real order/session service yet (docs/4-architecture.md §2).
 * A visitor landing here without having just checked out sees the heading
 * and body copy without an order number, rather than a broken page.
 */
export function ConfirmedClient({ heading, orderNumberLabel, body, unstitchedReminder, backHomeLabel }: ConfirmedClientProps) {
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    // Effect-based rather than a lazy initializer for the same reason as
    // lib/cart/CartContext.tsx: the server has no sessionStorage, so
    // reading it synchronously during the initial render would mismatch
    // what the server sent.
    try {
      const raw = window.sessionStorage.getItem('lunara.lastOrder');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      // No session order available — render without the order number.
    }
  }, []);

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-4" style={{ maxWidth: '560px' }}>
        <SectionMarker />
        <h1 className="home-section-title">{heading}</h1>
        {order && (
          <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
            {orderNumberLabel}: <strong>{order.orderNumber}</strong>
          </p>
        )}
        <p className="field-message">{body}</p>
        <p className="jacket-block-unstitched">{unstitchedReminder}</p>
        <Link href="/" className="btn focus-ring btn-primary btn-md" style={{ alignSelf: 'flex-start' }}>
          {backHomeLabel}
        </Link>
      </div>
    </div>
  );
}
