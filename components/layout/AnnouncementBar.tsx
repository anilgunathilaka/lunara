'use client';

import { Fragment, useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';

export interface AnnouncementBarProps {
  /** Short facts, run end to end. */
  items: string[];
  labels: { region: string; pause: string; play: string };
}

/** Each copy repeats the facts so one copy is wider than the widest screen. */
const REPEATS = 3;

/**
 * The utility bar above the header (docs/2-ui.md §7.2): the facts run
 * continuously from right to left, separated by the Lunara emblem. Two
 * identical copies sit side by side and the pair slides by exactly one copy
 * per --motion-marquee, so the loop never shows a seam.
 *
 * The whole bar is one button that pauses and resumes it (WCAG 2.2.2); it
 * also waits while the pointer is over it. Screen readers get the facts
 * once, as a plain list, not the moving copies. Under
 * prefers-reduced-motion it stands still.
 */
export function AnnouncementBar({ items, labels }: AnnouncementBarProps) {
  const [paused, setPaused] = useState(false);
  if (items.length === 0) return null;

  const copy = (key: number) => (
    <span key={key} className="site-announcement-copy">
      {Array.from({ length: REPEATS }, (_, r) =>
        items.map((item, i) => (
          <Fragment key={`${r}-${i}`}>
            <span className="site-announcement-text">{item}</span>
            <Image src="/brand/lunara-emblem.webp" alt="" width={128} height={128} className="site-announcement-mark" unoptimized />
          </Fragment>
        )),
      )}
    </span>
  );

  return (
    <div className="site-announcement" role="region" aria-label={labels.region}>
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button
        type="button"
        className="site-announcement-toggle focus-ring"
        aria-pressed={paused}
        aria-label={paused ? labels.play : labels.pause}
        onClick={() => setPaused((p) => !p)}
      >
        <span className={paused ? 'site-announcement-track is-paused' : 'site-announcement-track'} aria-hidden="true">
          {copy(0)}
          {copy(1)}
        </span>
        <span className="site-announcement-state" aria-hidden="true">
          <Icon icon={paused ? Play : Pause} size="inline" />
        </span>
      </button>
    </div>
  );
}
