/**
 * Switches for features that are built but not offered yet.
 *
 * designYourOwn: off while the 3D Osariya model is being produced
 * (docs/4-architecture.md §5.0; founder decision 2026-11-09). Every link to
 * it is hidden; the page itself still works at /design-your-own for testing.
 *
 * languageSelector: off for now (founder decision 2026-11-09). The site
 * opens in English and the choice of language is hidden everywhere; the
 * Sinhala and Tamil pages still work at /si and /ta, and every message stays
 * translated, so switching this back on restores all three at once.
 */
export const FEATURES = {
  designYourOwn: false,
  languageSelector: false,
} as const;
