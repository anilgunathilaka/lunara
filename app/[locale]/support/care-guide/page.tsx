import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';

export default async function CareGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('support');
  const tAccordion = await getTranslations('layout.accordion');

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-4" style={{ maxWidth: '640px' }}>
        <SectionMarker />
        <h1 className="home-section-title">{t('careGuidePageTitle')}</h1>
        <p className="field-message">{tAccordion('careContent')}</p>
      </div>
    </div>
  );
}
