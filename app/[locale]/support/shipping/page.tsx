import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { PolicyText } from '@/components/content/PolicyText';
import { SHIPPING_POLICY_EN } from '@/content/policies/shipping.en';
import { pageMetadata } from '@/lib/seo/meta';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return pageMetadata({ locale, path: '/support/shipping', title: t('shippingTitle'), description: t('shippingDescription') });
}

/**
 * Shipping & Delivery Policy — the founder's approved English text
 * (content/policies/, 2026-11-23). Policy text is never machine-translated
 * (CLAUDE.md): until approved Sinhala and Tamil translations exist, those
 * pages show the English text, marked as English, with a short note saying so.
 */
export default async function ShippingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('policies');

  return (
    <div className="home-section">
      <div className="home-section-inner policy-page">
        <SectionMarker />
        {locale !== 'en' && <p className="field-message">{t('englishOnly')}</p>}
        <div lang="en">
          <PolicyText source={SHIPPING_POLICY_EN} />
        </div>
      </div>
    </div>
  );
}
