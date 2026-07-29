'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';
import { formatAmount } from '@/lib/pricing/format';

// docs/3-components.md §4.2b — "visible for a few seconds, then fades".
// A JS timer value, not a CSS transition duration, so a local constant
// rather than a lib/tokens.css entry.
const VISIBLE_MS = 4000;

export type PriceChangeCause = 'design' | 'material' | 'jacket';

export interface PriceAttributionProps {
  price: number;
  previousPrice?: number;
  cause?: PriceChangeCause;
  /** e.g. "Super Cotton". */
  causeLabel?: string;
}

/**
 * docs/3-components.md §4.2b (UX-C10a). Inline beside the price, never a
 * toast. Renders nothing when there's no prior price to compare against.
 *
 * IMPORTANT for callers: render this with `key={\`${cause}-${price}\`}` (or
 * similar) so a genuinely new price change remounts it with fresh
 * visibility, instead of the component trying to detect "is this a new
 * change" internally during render.
 */
export function PriceAttribution({ price, previousPrice, cause, causeLabel }: PriceAttributionProps) {
  const delta = previousPrice != null ? price - previousPrice : 0;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (delta === 0) return;
    const timer = setTimeout(() => setDismissed(true), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [delta]);

  if (dismissed || delta === 0 || !cause || !causeLabel) return null;

  const sign = delta > 0 ? '+' : '−';

  return (
    <span className="price-attribution" role="status">
      <Icon icon={delta > 0 ? ArrowUp : ArrowDown} size="inline" />
      {causeLabel} {sign}
      {formatAmount(Math.abs(delta))}
    </span>
  );
}
