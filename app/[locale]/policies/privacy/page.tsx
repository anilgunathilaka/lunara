import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';

/**
 * No approved privacy-policy legal text exists yet (content/policies/ is
 * empty — CLAUDE.md: policy text is never machine-translated or invented,
 * only approved translations are used). This page states that honestly
 * rather than fabricating legal copy.
 */
export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('policies');

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-4" style={{ maxWidth: '640px' }}>
        <SectionMarker />
        <h1 className="home-section-title">{t('privacyTitle')}</h1>
        <p className="field-message">{t('pending')}</p>
      </div>
    </div>
  );
}
