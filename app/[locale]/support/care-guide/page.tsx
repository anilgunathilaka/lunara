import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { PolicyText } from '@/components/content/PolicyText';
import { COTTON_CARE_EN } from '@/content/care/cotton.en';

/**
 * Cotton Care Guide — the founder's approved English text (content/care/,
 * 2026-11-24). Care text is never machine-translated (CLAUDE.md): until
 * approved Sinhala and Tamil translations exist, those pages show the
 * English text, marked as English, with a short note saying so.
 */
export default async function CareGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('support');

  return (
    <div className="home-section">
      <div className="home-section-inner policy-page">
        <SectionMarker />
        {locale !== 'en' && <p className="field-message">{t('careEnglishOnly')}</p>}
        <div lang="en">
          <PolicyText source={COTTON_CARE_EN} />
        </div>
      </div>
    </div>
  );
}
