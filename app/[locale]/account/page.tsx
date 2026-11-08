import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { SignOutButton } from '@/components/account/SignOutButton';
import { listCustomerOrders, requireCustomerPage } from '@/lib/account/customer';
import { formatDate } from '@/lib/format/date';
import { formatPriceLKR } from '@/lib/pricing/format';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Account home: orders and tracking (docs/1-ux.md §1 ACCOUNT; docs/4-architecture.md §3.6). */
export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const customer = await requireCustomerPage(locale, `/${locale}/account`);
  const [orders, t, tStatus] = await Promise.all([
    listCustomerOrders(customer),
    getTranslations('account'),
    getTranslations('commerce.orderStatus'),
  ]);

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-5" style={{ maxWidth: '560px' }}>
        <div>
          <SectionMarker />
          <h1 className="home-section-title">{t('ordersHeading')}</h1>
          <p className="field-message">{t('signedInAs', { email: customer.email })}</p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="field-message">{t('noOrders')}</p>
            <Link href="/shop" className="btn focus-ring btn-primary btn-md" style={{ alignSelf: 'flex-start' }}>
              {t('startShopping')}
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col">
            {orders.map((order) => (
              <li key={order.number}>
                <Link href={`/account/orders/${order.number}`} className="account-order focus-ring">
                  <span className="flex flex-col">
                    <strong>{order.number}</strong>
                    <span className="order-timeline-time">
                      {formatDate(order.createdAt, locale)} · {t('itemCount', { count: order._count.lines })}
                    </span>
                  </span>
                  <span className="flex flex-col account-order-end">
                    <span>{tStatus(order.status)}</span>
                    <span className="order-timeline-time">{formatPriceLKR(order.total)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div>
          <SignOutButton label={t('signOut')} />
        </div>
      </div>
    </div>
  );
}
