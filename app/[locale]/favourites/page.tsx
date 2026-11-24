import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { FavouritesGrid } from '@/components/account/FavouritesGrid';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Favourite sarees for everyone, signed in or not (founder decision
 * 2026-11-24). Guests' hearts live in their browser; no sign-in is asked for.
 */
export default async function FavouritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('favourites');

  return (
    <div className="home-section">
      <div className="home-section-inner profile-page">
        <div>
          <SectionMarker />
          <h1 className="home-section-title">{t('heading')}</h1>
          <p className="field-message">{t('intro')}</p>
        </div>
        <FavouritesGrid />
      </div>
    </div>
  );
}
