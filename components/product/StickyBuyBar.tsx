'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface StickyBuyBarProps {
  /** id of the element holding the page's own Add to cart button. */
  targetId: string;
  thumbnail: { src: string; alt: string };
  name: string;
  /** The price as the server rendered it (PRICE_MATRIX): never computed here. */
  price: ReactNode;
  addToCartLabel: string;
  disabled?: boolean;
}

/**
 * Sticky add-to-cart bar (docs/2-ui.md §7.5; founder decision 2026-11-13,
 * after eshandlooms.com): once the page's own Add to cart button has scrolled
 * up out of view, a white bar slides up from the bottom of the screen with
 * the photograph, the name, the price and the button; it slides away again
 * when the button comes back. Its button presses the page's own, so there is
 * one add-to-cart path and one confirmation. On phones it sits above the
 * bottom bar.
 */
export function StickyBuyBar({ targetId, thumbnail, name, price, addToCartLabel, disabled }: StickyBuyBarProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      // Shown only once the button is above the screen, not before reaching it.
      if (entry) setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  function add() {
    document.getElementById(targetId)?.querySelector('button')?.click();
  }

  return (
    <div className={cn('pdp-sticky', shown && 'is-shown')} aria-hidden={!shown} inert={!shown}>
      <div className="pdp-sticky-inner">
        <div className="pdp-sticky-item">
          <span className="pdp-sticky-thumb">
            <Image src={thumbnail.src} alt="" fill sizes="48px" />
          </span>
          <span className="pdp-sticky-text">
            <span className="pdp-sticky-name">{name}</span>
            {price}
          </span>
        </div>
        <button type="button" className="pdp-sticky-add focus-ring" onClick={add} disabled={disabled}>
          {addToCartLabel}
        </button>
      </div>
    </div>
  );
}
