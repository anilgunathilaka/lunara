import { defineRouting } from 'next-intl/routing';

/**
 * Sinhala, Tamil and English are equal (docs/1-ux.md §1.3 principle 7,
 * PRD FR-08, NFR-10). English is the default only because this is the
 * starting locale for development — no language is presented as primary
 * in the shipped product.
 */
export const routing = defineRouting({
  locales: ['en', 'si', 'ta'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // English-only for now (lib/features.ts languageSelector): / always opens
  // in English, whatever the browser's language or an earlier choice.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
