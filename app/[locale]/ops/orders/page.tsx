import type { OrderStatus } from '@prisma/client';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { isDistrictId } from '@/lib/commerce/delivery';
import { listOrders } from '@/lib/ops/queries';
import { requireStaffPage } from '@/lib/ops/staff';
import { ORDER_STATUSES } from '@/lib/ops/transitions';
import { formatPriceLKR } from '@/lib/pricing/format';
import { formatDateTime, type OpsSearchParams } from '../shared';

/** Orders by status, newest first (docs/4-architecture.md §3.5). */
export default async function OpsOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/orders`);
  const query = await searchParams;
  const status = ORDER_STATUSES.find((s) => s === query.status) as OrderStatus | undefined;

  const [orders, t, tCol, tStatus, tPayment, tDistricts] = await Promise.all([
    listOrders(status),
    getTranslations('ops'),
    getTranslations('ops.columns'),
    getTranslations('commerce.orderStatus'),
    getTranslations('commerce.payment'),
    getTranslations('districts'),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <nav className="ops-nav" aria-label={tCol('status')}>
        <Link href="/ops/orders" className="ops-nav-link focus-ring" aria-current={!status ? 'page' : undefined}>
          {t('all')}
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={{ pathname: '/ops/orders', query: { status: s } }}
            className="ops-nav-link focus-ring"
            aria-current={status === s ? 'page' : undefined}
          >
            {tStatus(s)}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="field-message">{t('noOrders')}</p>
      ) : (
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{tCol('number')}</th>
                <th scope="col">{tCol('date')}</th>
                <th scope="col">{tCol('customer')}</th>
                <th scope="col">{tCol('district')}</th>
                <th scope="col">{tCol('total')}</th>
                <th scope="col">{tCol('payment')}</th>
                <th scope="col">{tCol('status')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.number}>
                  <td>
                    <Link href={`/ops/orders/${order.number}`} className="focus-ring">
                      {order.number}
                    </Link>
                  </td>
                  <td>{formatDateTime(order.createdAt, locale)}</td>
                  <td>{order.customerName}</td>
                  <td>{isDistrictId(order.district) ? tDistricts(order.district) : order.district}</td>
                  <td>{formatPriceLKR(order.total)}</td>
                  <td>{order.paymentMethod === 'cod' ? tPayment('cod') : tPayment('bankTransfer')}</td>
                  <td>{tStatus(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
