import type { Metadata } from 'next';
import { fontVariableClassName } from '@/lib/fonts';
import '../globals.css';

/**
 * Temporary landing page (founder decision 2026-11-14): its own root layout,
 * outside the shop's [locale] layout, so it needs no database, menu or
 * translations to load. Shown on lunarasarees.com while COMING_SOON is on
 * (middleware.ts). Not indexed: search engines should index the real shop.
 */
export const metadata: Metadata = {
  title: 'Lunara Sarees — Coming soon',
  description: 'Lunara Sarees: cotton sarees with unstitched jacket material. Our online shop opens soon.',
  robots: { index: false, follow: false },
};

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariableClassName}>
      <body>{children}</body>
    </html>
  );
}
