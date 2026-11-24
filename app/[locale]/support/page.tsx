import type { Metadata } from 'next';
import { MessageCircle } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { Divider } from '@/components/primitives/Divider';
import { Accordion } from '@/components/layout/Accordion';
import { Icon } from '@/components/primitives/Icon';
import { Link } from '@/i18n/navigation';
import { whatsappLink } from '@/lib/commerce/business';
import { pageMetadata } from '@/lib/seo/meta';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return pageMetadata({ locale, path: '/support', title: t('supportTitle'), description: t('supportDescription') });
}

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('support');
  const tLayout = await getTranslations('layout');
  const tFooter = await getTranslations('layout.footer');
  const tPolicies = await getTranslations('policies');

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-6" style={{ maxWidth: '720px' }}>
        <div>
          <SectionMarker />
          <h1 className="home-section-title">{t('title')}</h1>
        </div>
        <p className="field-message">{t('intro')}</p>

        <div className="flex flex-wrap gap-3">
          <Link href="/support/shipping" className="btn focus-ring btn-secondary btn-md">
            {tFooter('shipping')}
          </Link>
          <Link href="/support/returns" className="btn focus-ring btn-secondary btn-md">
            {tFooter('returns')}
          </Link>
          <Link href="/support/care-guide" className="btn focus-ring btn-secondary btn-md">
            {tFooter('careGuide')}
          </Link>
        </div>

        <Divider />

        <Accordion
          items={[
            {
              id: 'colour-promise',
              title: t('colourPromiseHeading'),
              content: (
                <div className="flex flex-col gap-3">
                  <p className="field-message">{t('colourPromiseBody')}</p>
                  <Link href="/policies/colour" className="text-link">
                    {tPolicies('colourLink')}
                  </Link>
                </div>
              ),
            },
            {
              id: 'jacket-stitching',
              title: t('jacketStitchingHeading'),
              content: <p className="field-message">{t('jacketStitchingBody')}</p>,
            },
          ]}
        />

        <Divider />

        <div className="flex flex-col gap-3">
          <h2 className="checkout-step-title">{t('contactHeading')}</h2>
          <p className="field-message">{t('contactBody')}</p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn focus-ring btn-primary btn-md"
            style={{ alignSelf: 'flex-start' }}
          >
            <Icon icon={MessageCircle} size="inline" />
            {tLayout('whatsapp')}
          </a>
        </div>
      </div>
    </div>
  );
}
