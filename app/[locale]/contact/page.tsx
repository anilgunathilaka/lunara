import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { Icon } from '@/components/primitives/Icon';
import { Link } from '@/i18n/navigation';
import { whatsappLink } from '@/lib/commerce/business';

// The same contact details the policies publish (content/policies/terms.en.ts §17).
const PHONE_DISPLAY = '+94 70 214 4064';
const PHONE_HREF = 'tel:+94702144064';
const EMAIL = 'hello@lunarasarees.com';

/**
 * Contact us (founder decision 2026-11-24): WhatsApp first (the fastest
 * answer), then phone, email and where we are; then the help pages.
 */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const tFooter = await getTranslations('layout.footer');

  return (
    <div className="home-section">
      <div className="home-section-inner policy-page">
        <SectionMarker />
        <div className="policy-text">
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
        </div>

        <ul className="contact-list">
          <li className="contact-item">
            <Icon icon={MessageCircle} />
            <div>
              <p className="contact-label">{t('whatsappLabel')}</p>
              <p className="contact-note">{t('whatsappNote')}</p>
              <a href={whatsappLink()} className="solid-pill solid-pill-plum focus-ring" target="_blank" rel="noopener noreferrer">
                {t('whatsappButton')}
              </a>
            </div>
          </li>
          <li className="contact-item">
            <Icon icon={Phone} />
            <div>
              <p className="contact-label">{t('phoneLabel')}</p>
              <a href={PHONE_HREF} className="text-link focus-ring">
                {PHONE_DISPLAY}
              </a>
            </div>
          </li>
          <li className="contact-item">
            <Icon icon={Mail} />
            <div>
              <p className="contact-label">{t('emailLabel')}</p>
              <a href={`mailto:${EMAIL}`} className="text-link focus-ring">
                {EMAIL}
              </a>
            </div>
          </li>
          <li className="contact-item">
            <Icon icon={MapPin} />
            <div>
              <p className="contact-label">{t('locationLabel')}</p>
              <p className="contact-note">{t('location')}</p>
            </div>
          </li>
        </ul>

        <div className="policy-text">
          <h2>{t('helpHeading')}</h2>
          <p>{t('helpBody')}</p>
        </div>
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
      </div>
    </div>
  );
}
