import { Cormorant_Garamond, Inter, Noto_Sans_Sinhala, Noto_Sans_Tamil } from 'next/font/google';

/**
 * Font loaders per docs/2-ui.md §3.1.
 *
 * Each exposes a CSS variable consumed by the semantic tokens in
 * lib/tokens.css (--font-display, --font-body, --font-sinhala,
 * --font-tamil) — components never reference these loader variables
 * directly, only the semantic token.
 */

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Sinhala script coverage, weights matched to Inter (docs/2-ui.md §3.1).
export const notoSansSinhala = Noto_Sans_Sinhala({
  subsets: ['sinhala'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-sinhala',
  display: 'swap',
});

// Tamil script coverage, weights matched to Inter (docs/2-ui.md §3.1).
export const notoSansTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-tamil',
  display: 'swap',
});

export const fontVariableClassName = [
  cormorantGaramond.variable,
  inter.variable,
  notoSansSinhala.variable,
  notoSansTamil.variable,
].join(' ');
