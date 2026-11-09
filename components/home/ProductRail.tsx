'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';
import { Link } from '@/i18n/navigation';

export interface ProductRailProps {
  heading: string;
  viewAll: { href: string; label: string };
  labels: { previous: string; next: string };
  /** One element per card; each becomes a snap point. */
  children: ReactNode[];
}

/**
 * A row of product cards that scrolls sideways (docs/2-ui.md §7.4): four
 * across on wide screens, one and a bit on phones so the next card shows.
 * Arrows move it by one card; swipe and trackpad scroll work natively.
 * The photographs move only because the customer moves the row.
 */
export function ProductRail({ heading, viewAll, labels, children }: ProductRailProps) {
  const track = useRef<HTMLUListElement>(null);

  const step = (direction: 1 | -1) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="product-rail">
      <div className="product-rail-head">
        <h2 className="section-title">{heading}</h2>
        <div className="product-rail-controls">
          <Link href={viewAll.href} className="text-link">
            {viewAll.label}
          </Link>
          <button type="button" className="rail-arrow focus-ring" onClick={() => step(-1)} aria-label={labels.previous}>
            <Icon icon={ArrowLeft} size="inline" />
          </button>
          <button type="button" className="rail-arrow focus-ring" onClick={() => step(1)} aria-label={labels.next}>
            <Icon icon={ArrowRight} size="inline" />
          </button>
        </div>
      </div>
      <ul ref={track} className="product-rail-track">
        {children.map((child, i) => (
          <li key={i} className="product-rail-item">
            {child}
          </li>
        ))}
      </ul>
    </div>
  );
}
