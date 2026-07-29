'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

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
  const activeLocale = useLocale();

  return (
    <div className={cn('language-selector', className)} role="group" aria-label="Language">
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          aria-pressed={locale === activeLocale}
          className={cn('language-option', locale === activeLocale && 'language-option-active')}
          onClick={() => router.replace(pathname, { locale })}
        >
          {labels[locale]}
        </button>
      ))}
    </div>
  );
}
