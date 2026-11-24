'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ProfileTabKey = 'details' | 'orders' | 'history' | 'favourites';

export interface ProfileTabsProps {
  tabs: { key: ProfileTabKey; label: string; panel: ReactNode }[];
  /** Opened first: from ?tab=, else Track my orders (founder decision 2026-11-24). */
  initial: ProfileTabKey;
}

/**
 * The profile's four sections as tabs (founder decision 2026-11-24). WAI-ARIA
 * tabs: arrow keys, Home and End move between them; only the chosen tab is in
 * the Tab order. The address bar follows (?tab=), so a reload or a shared link
 * opens the same tab. Every panel is rendered on the server; the others are
 * only hidden.
 */
export function ProfileTabs({ tabs, initial }: ProfileTabsProps) {
  const [current, setCurrent] = useState<ProfileTabKey>(initial);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const choose = (key: ProfileTabKey, focus = false) => {
    setCurrent(key);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', key);
    url.searchParams.delete('profile');
    window.history.replaceState(null, '', url);
    if (focus) refs.current[tabs.findIndex((t) => t.key === key)]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = tabs.length - 1;
    const to =
      event.key === 'ArrowRight' ? (index === last ? 0 : index + 1) : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1) : event.key === 'Home' ? 0 : event.key === 'End' ? last : null;
    if (to === null) return;
    event.preventDefault();
    choose(tabs[to]!.key, true);
  };

  return (
    <div className="profile-tabs">
      <div role="tablist" className="profile-tablist">
        {tabs.map((tab, index) => {
          const selected = tab.key === current;
          return (
            <button
              key={tab.key}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`profile-tab-${tab.key}`}
              aria-controls={`profile-panel-${tab.key}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className={cn('profile-tab focus-ring', selected && 'is-selected')}
              onClick={() => choose(tab.key)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`profile-panel-${tab.key}`}
          aria-labelledby={`profile-tab-${tab.key}`}
          hidden={tab.key !== current}
          tabIndex={0}
          className="profile-panel"
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
