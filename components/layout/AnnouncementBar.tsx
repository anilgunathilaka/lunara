'use client';

import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface AnnouncementItem {
  label: string;
  /** Where the fact is explained. */
  href: string;
}

export interface AnnouncementBarProps {
  items: AnnouncementItem[];
  labels: { region: string; pause: string; play: string };
}

/**
 * The utility bar above the header (docs/2-ui.md §7.2; founder decision
 * 2026-11-09, after killstar.com): one fact at a time, centred in light
 * white type on --lun-plum-deep, each a link to where it is explained. The
 * facts cross-fade (--motion-announcement-fade) every
 * --motion-announcement-interval and loop. The timer is a CSS animation on
 * an invisible element, so both durations live in tokens, not in code.
 *
 * It waits while the pointer is over it or anything in it has focus; a
 * quiet pause button at the right edge stops it for good (WCAG 2.2.2).
 * Under prefers-reduced-motion it never moves on its own.
 */
export function AnnouncementBar({ items, labels }: AnnouncementBarProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  if (count === 0) return null;

  return (
    <div className="site-announcement" role="region" aria-roledescription="carousel" aria-label={labels.region}>
      <div className="site-announcement-slides">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={cn('site-announcement-slide', i === index && 'is-active')}
            aria-hidden={i !== index}
            inert={i !== index}
          >
            <Link href={item.href} className="site-announcement-link focus-ring">
              {item.label}
            </Link>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="site-announcement-state focus-ring"
            aria-pressed={paused}
            aria-label={paused ? labels.play : labels.pause}
            onClick={() => setPaused((p) => !p)}
          >
            <Icon icon={paused ? Play : Pause} size="inline" />
          </button>
          {!paused && (
            <span
              key={index}
              className="site-announcement-timer"
              aria-hidden="true"
              onAnimationEnd={() => setIndex((i) => (i + 1) % count)}
            />
          )}
        </>
      )}
    </div>
  );
}
