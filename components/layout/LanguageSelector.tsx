'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/primitives/Icon';

export interface LanguageSelectorProps {
  /** Each locale's OWN name, e.g. { en: 'English', si: 'සිංහල', ta: 'தமிழ்' }. */
  labels: Record<(typeof routing.locales)[number], string>;
  className?: string;
}

/**
 * docs/1-ux.md §1 ("Selection persists across sessions, never resets on
 * navigation"). Persistence itself is next-intl middleware's NEXT_LOCALE
 * cookie, set automatically whenever a locale-prefixed route is visited —
 * this component only needs to navigate to the same page under the new
 * locale.
 */
export function LanguageSelector({ labels, className }: LanguageSelectorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeLocale = useLocale() as AppLocale;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    function handleScroll() {
      setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [open]);

  function selectLocale(locale: AppLocale) {
    setOpen(false);
    if (locale === activeLocale) return;
    router.replace(pathname, { locale });
  }

  return (
    <div ref={rootRef} className={cn('language-selector', className)}>
      <button
        type="button"
        className="language-trigger focus-ring"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label="Language"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="language-trigger-label">{labels[activeLocale]}</span>
        <Icon
          icon={ChevronDown}
          className={cn('language-trigger-icon', open && 'language-trigger-icon-open')}
        />
      </button>

      {open ? (
        <ul id={listId} className="language-menu" role="listbox" aria-label="Language">
          {routing.locales.map((locale) => {
            const selected = locale === activeLocale;
            return (
              <li key={locale} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn('language-option', selected && 'language-option-active')}
                  onClick={() => selectLocale(locale)}
                >
                  {labels[locale]}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
