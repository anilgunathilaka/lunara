'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';

export interface AnnouncementBarProps {
  /** Short facts, one shown at a time. */
  items: string[];
  labels: { region: string; previous: string; next: string };
}

/**
 * The strip above the header (docs/2-ui.md §7.2): one fact at a time,
 * sliding sideways, with arrows either side. It advances on its own every
 * --motion-announcement-interval — the timer is a CSS animation on an
 * invisible element, so the interval lives in tokens, not in code. It
 * waits while the pointer is over it or anything in it has focus, and stops
 * for good once the customer uses an arrow (WCAG 2.2.2). Under
 * prefers-reduced-motion it never moves on its own.
 */
export function AnnouncementBar({ items, labels }: AnnouncementBarProps) {
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const count = items.length;
  if (count === 0) return null;

  const go = (step: number) => {
    setStopped(true);
    setIndex((i) => (i + step + count) % count);
  };

  return (
    <div className="site-announcement" role="region" aria-roledescription="carousel" aria-label={labels.region}>
      {count > 1 && (
        <button type="button" className="site-announcement-arrow focus-ring" onClick={() => go(-1)} aria-label={labels.previous}>
          <Icon icon={ChevronLeft} size="inline" />
        </button>
      )}
      <div className="site-announcement-window">
        <ul className="site-announcement-track" style={{ transform: `translateX(${index * -100}%)` }}>
          {items.map((item, i) => (
            <li key={item} className="site-announcement-item" aria-hidden={i !== index}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      {count > 1 && (
        <button type="button" className="site-announcement-arrow focus-ring" onClick={() => go(1)} aria-label={labels.next}>
          <Icon icon={ChevronRight} size="inline" />
        </button>
      )}
      {count > 1 && !stopped && (
        <span
          key={index}
          className="site-announcement-timer"
          aria-hidden="true"
          onAnimationEnd={() => setIndex((i) => (i + 1) % count)}
        />
      )}
    </div>
  );
}
