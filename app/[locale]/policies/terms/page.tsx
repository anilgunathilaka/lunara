import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { PolicyText } from '@/components/content/PolicyText';
import { TERMS_EN } from '@/content/policies/terms.en';

/**
 * Terms & Conditions — the founder's approved English text (content/policies/,
 * 2026-11-23). Policy text is never machine-translated (CLAUDE.md): until
 * approved Sinhala and Tamil translations exist, those pages show the
 * English text, marked as English, with a short note saying so.
 */
export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('policies');

  return (
    <div className="home-section">
      <div className="home-section-inner policy-page">
        <SectionMarker />
        {locale !== 'en' && <p className="field-message">{t('englishOnly')}</p>}
        <div lang="en">
          <PolicyText source={TERMS_EN} />
        </div>
      </div>
    </div>
  );
}
