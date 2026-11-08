import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { SaveOrderPanel } from '@/components/account/SaveOrderPanel';
import { OrderRecord } from '@/components/commerce/OrderRecord';
import { getCustomer } from '@/lib/account/customer';
import { whatsappLink } from '@/lib/commerce/business';
import { getGuestOrder } from '@/lib/commerce/orders';

// Holds personal details: never indexed, never cached.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Order record for a guest (docs/1-ux.md §3.4 [6]; docs/4-architecture.md
 * §3.4, §3.6). Reached from checkout with ?order=…&t=…; the token is checked
 * against its stored hash, so the number alone reveals nothing. Also the
 * guest's tracking page, and where an account is offered, after purchase.
 */
export default async function CheckoutConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string | string[]; t?: string | string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const number = typeof query.order === 'string' ? query.order : '';
  const token = typeof query.t === 'string' ? query.t : '';

  const [t, tCheckout, tAccount] = await Promise.all([
    getTranslations('commerce.confirmed'),
    getTranslations('commerce.checkout'),
    getTranslations('account'),
  ]);

  const [order, customer] = await Promise.all([number && token ? getGuestOrder(number, token) : null, getCustomer()]);

  if (!order) {
    return (
      <div className="home-section">
        <div className="home-section-inner flex flex-col gap-4" style={{ maxWidth: '560px' }}>
          <SectionMarker />
          <p className="field-message">{t('notFound')}</p>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn focus-ring btn-secondary btn-md">
            {t('contactWhatsApp')}
          </a>
        </div>
      </div>
    );
  }

  const accountOrderPath = `/account/orders/${order.number}`;
  const linkedToViewer = customer !== null && order.userId === customer.id;

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-5" style={{ maxWidth: '560px' }}>
        <div>
          <SectionMarker />
          <h1 className="home-section-title">
            {order.status === 'payment_pending' ? t('pendingHeading') : tCheckout('confirmedHeading')}
          </h1>
        </div>

        <OrderRecord order={order} />

        <p className="field-message">{t('body', { phone: order.phone })}</p>

        {linkedToViewer ? (
          <Link href={accountOrderPath} className="btn focus-ring btn-secondary btn-md" style={{ alignSelf: 'flex-start' }}>
            {tAccount('saveOrder.viewInAccount')}
          </Link>
        ) : order.userId === null ? (
          <SaveOrderPanel
            number={order.number}
            token={token}
            accountOrderHref={`/${locale}${accountOrderPath}`}
            orderEmail={order.email}
            signedInEmail={customer?.email ?? null}
          />
        ) : null}

        <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
          {t('bookmark')}
        </p>
        <Link href="/" className="btn focus-ring btn-primary btn-md" style={{ alignSelf: 'flex-start' }}>
          {tCheckout('backHome')}
        </Link>
      </div>
    </div>
  );
}
