'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Brings the outcome message into view after an action. A form low on the
 * page (the cost form, delete) returns to the same page, which can keep its
 * scroll position, so the message at the top would otherwise go unseen.
 * Instant, not animated: nothing to honour for reduced motion.
 */
export function FlashReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'center' });
  }, []);
  return <div ref={ref}>{children}</div>;
}
