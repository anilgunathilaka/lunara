import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { PolicyText } from '@/components/content/PolicyText';
import { COLOUR_DISCLAIMER_EN } from '@/content/policies/colour.en';

/**
 * Product Colour & Image Disclaimer — the founder's approved English text
 * (content/policies/, 2026-11-24). Policy text is never machine-translated
 * (CLAUDE.md): until approved Sinhala and Tamil translations exist, those
 * pages show the English text, marked as English, with a short note.
 */
export default async function ColourDisclaimerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('policies');

  return (
    <div className="home-section">
      <div className="home-section-inner policy-page">
        <SectionMarker />
        {locale !== 'en' && <p className="field-message">{t('englishOnly')}</p>}
        <div lang="en">
          <PolicyText source={COLOUR_DISCLAIMER_EN} />
        </div>
      </div>
    </div>
  );
}
