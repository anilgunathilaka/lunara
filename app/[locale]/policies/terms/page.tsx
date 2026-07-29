import { getTranslations } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';

/** See app/[locale]/policies/privacy/page.tsx — same rationale for not fabricating legal text. */
export default async function TermsOfServicePage() {
  const t = await getTranslations('policies');

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-4" style={{ maxWidth: '640px' }}>
        <SectionMarker />
        <h1 className="home-section-title">{t('termsTitle')}</h1>
        <p className="field-message">{t('pending')}</p>
      </div>
    </div>
  );
}
