import { getTranslations } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';

export default async function ShippingPage() {
  const t = await getTranslations('support');
  const tAccordion = await getTranslations('layout.accordion');

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-4" style={{ maxWidth: '640px' }}>
        <SectionMarker />
        <h1 className="home-section-title">{t('shippingPageTitle')}</h1>
        <p className="field-message">{tAccordion('shippingContent')}</p>
      </div>
    </div>
  );
}
