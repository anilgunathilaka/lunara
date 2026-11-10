/**
 * Founder-supplied hero banners, shown before the featured sarees in the
 * home hero card (docs/2-ui.md §7.2). Served as-is from the public R2
 * bucket: already a compressed WebP sized for the card, so it skips the
 * image optimiser.
 */
export interface HeroBanner {
  src: string;
  /** Message key (home.hero.banners.*) for the alt text, in all three languages. */
  altKey: string;
  /** Where the subject sits, so a narrow crop (4:5 on phones) keeps it in frame. */
  focus: 'start' | 'center' | 'end';
}

export const HERO_BANNERS: HeroBanner[] = [
  {
    src: 'https://pub-e7079fa5cefa4352ab1d1bdb90ef39d3.r2.dev/images/hero-banner-1.webp',
    altKey: 'banner1Alt',
    focus: 'end',
  },
  {
    src: 'https://pub-e7079fa5cefa4352ab1d1bdb90ef39d3.r2.dev/images/hero-banner-2.webp',
    altKey: 'banner2Alt',
    focus: 'end',
  },
  {
    src: 'https://pub-e7079fa5cefa4352ab1d1bdb90ef39d3.r2.dev/images/hero-banner-3.webp',
    altKey: 'banner3Alt',
    focus: 'start',
  },
  {
    src: 'https://pub-e7079fa5cefa4352ab1d1bdb90ef39d3.r2.dev/images/hero-banner-4.webp',
    altKey: 'banner4Alt',
    focus: 'end',
  },
];
