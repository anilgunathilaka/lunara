import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { Link } from '@/i18n/navigation';
import { pageMetadata } from '@/lib/seo/meta';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return pageMetadata({ locale, path: '/about', title: t('aboutTitle'), description: t('aboutDescription') });
}

/**
 * About us — the founder's text of 2026-11-24, in all three languages
 * (messages/*.json "about"). The policy names in it link to those pages.
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  const rich = {
    b: (chunks: ReactNode) => <strong>{chunks}</strong>,
    shipping: (chunks: ReactNode) => (
      <Link href="/support/shipping" className="focus-ring">
        {chunks}
      </Link>
    ),
    returns: (chunks: ReactNode) => (
      <Link href="/support/returns" className="focus-ring">
        {chunks}
      </Link>
    ),
    colour: (chunks: ReactNode) => (
      <Link href="/policies/colour" className="focus-ring">
        {chunks}
      </Link>
    ),
  };
  const points = ['ordering', 'delivery', 'dispatch', 'payments', 'care'] as const;

  return (
    <div className="home-section">
      <div className="home-section-inner policy-page">
        <SectionMarker />
        <div className="policy-text">
          <h1>{t('title')}</h1>

          <h2>{t('artHeading')}</h2>
          <p>{t.rich('art1', rich)}</p>
          <p>{t('art2')}</p>

          <h2>{t('collectionsHeading')}</h2>
          <p>{t('collections1')}</p>
          <p>{t('collections2')}</p>

          <h2>{t('yoursHeading')}</h2>
          <p>{t('yours1')}</p>
          <p>{t('yours2')}</p>
          <p>{t('yours3')}</p>

          <h2>{t('shoppingHeading')}</h2>
          <p>{t('shopping1')}</p>
          <ul>
            {points.map((key) => (
              <li key={key}>
                <strong>{t(`point.${key}Label`)}</strong> {t(`point.${key}`)}
              </li>
            ))}
          </ul>
          <p>{t.rich('shopping2', rich)}</p>

          <h2>{t('honestHeading')}</h2>
          <p>{t('honest1')}</p>
          <p>{t('honest2')}</p>
          <p>{t('honest3')}</p>
          <p>{t.rich('honest4', rich)}</p>

          <h2>{t('experienceHeading')}</h2>
          <p>{t('experience1')}</p>
          <p>{t('experience2')}</p>
          <p>
            <strong>{t('closing')}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/shop" className="solid-pill solid-pill-plum focus-ring">
            {t('shopNow')}
          </Link>
          <Link href="/contact" className="btn focus-ring btn-secondary btn-md">
            {t('contactUs')}
          </Link>
        </div>
      </div>
    </div>
  );
}
