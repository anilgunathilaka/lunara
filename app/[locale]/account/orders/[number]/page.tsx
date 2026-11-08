import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { OrderRecord } from '@/components/commerce/OrderRecord';
import { getCustomerOrder, requireCustomerPage } from '@/lib/account/customer';
import { whatsappLink } from '@/lib/commerce/business';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** One order and its progress, for its account holder (docs/4-architecture.md §3.6). */
export default async function AccountOrderPage({ params }: { params: Promise<{ locale: string; number: string }> }) {
  const { locale, number } = await params;
  setRequestLocale(locale);
  const customer = await requireCustomerPage(locale, `/${locale}/account/orders/${number}`);
  const [order, t, tConfirmed] = await Promise.all([
    getCustomerOrder(customer, number),
    getTranslations('account'),
    getTranslations('commerce.confirmed'),
  ]);
  // Not yours and not found look the same: order numbers reveal nothing.
  if (!order) notFound();

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-5" style={{ maxWidth: '560px' }}>
        <div>
          <Link href="/account" className="focus-ring field-message">
            ← {t('ordersHeading')}
          </Link>
          <SectionMarker />
          <h1 className="home-section-title">{t('orderHeading', { number: order.number })}</h1>
        </div>
        <OrderRecord order={order} />
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn focus-ring btn-secondary btn-md" style={{ alignSelf: 'flex-start' }}>
          {tConfirmed('contactWhatsApp')}
        </a>
      </div>
    </div>
  );
}
