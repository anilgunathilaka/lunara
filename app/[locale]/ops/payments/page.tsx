import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { transitionOrderAction } from '@/lib/ops/actions';
import { paymentQueue } from '@/lib/ops/queries';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatPriceLKR } from '@/lib/pricing/format';
import { formatAge, formatDateTime } from '../shared';

/**
 * Bank transfers awaiting payment, oldest first (docs/4-architecture.md
 * §3.5). The order number is the transfer reference; matching against the
 * bank statement is manual in Phase 1.
 */
export default async function OpsPaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/payments`);
  const [orders, t, tCol, tStep] = await Promise.all([
    paymentQueue(),
    getTranslations('ops'),
    getTranslations('ops.columns'),
    getTranslations('ops.transition'),
  ]);

  if (orders.length === 0) return <p className="field-message">{t('noOrders')}</p>;

  return (
    <div className="ops-table-wrap">
      <table className="ops-table">
        <thead>
          <tr>
            <th scope="col">{tCol('number')}</th>
            <th scope="col">{tCol('total')}</th>
            <th scope="col">{tCol('customer')}</th>
            <th scope="col">{tCol('phone')}</th>
            <th scope="col">{tCol('date')}</th>
            <th scope="col">{tCol('waiting')}</th>
            <th scope="col">
              <span className="sr-only">{tStep('confirmPayment')}</span>
            </th>
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
              <td>{formatPriceLKR(order.total)}</td>
              <td>{order.customerName}</td>
              <td>{order.phone}</td>
              <td>{formatDateTime(order.createdAt, locale)}</td>
              <td>{formatAge(order.createdAt)}</td>
              <td>
                <form action={transitionOrderAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="number" value={order.number} />
                  <input type="hidden" name="to" value="confirmed" />
                  <Button type="submit" size="sm">
                    {tStep('confirmPayment')}
                  </Button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
