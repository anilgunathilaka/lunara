/**
 * Switches for features that are built but not offered yet.
 *
 * designYourOwn: off while the 3D Osariya model is being produced
 * (docs/4-architecture.md §5.0; founder decision 2026-11-09). Every link to
 * it is hidden; the page itself still works at /design-your-own for testing.
 */
export const FEATURES = {
  designYourOwn: false,
} as const;
