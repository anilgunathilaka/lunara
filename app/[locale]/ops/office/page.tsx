import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { OFFICE_FILTERS, officeSaleList, type OfficeFilter } from '@/lib/ops/office';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatDate } from '@/lib/format/date';
import { formatPriceLKR } from '@/lib/pricing/format';
import { OpsFlash, type OpsSearchParams } from '../shared';
import { stateClass } from './shared';

/** Office sales and what is still owed on them (docs/4-architecture.md §3.13). */
export default async function OpsOfficePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: OpsSearchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/office`);
  const query = await searchParams;
  const filter: OfficeFilter = (OFFICE_FILTERS as readonly string[]).includes(String(query.show)) ? (query.show as OfficeFilter) : 'open';
  const [{ rows, totals }, t] = await Promise.all([officeSaleList(filter), getTranslations('ops.office')]);

  return (
    <div className="flex flex-col gap-4">
      <OpsFlash searchParams={query} />
      <div className="ops-inline-form">
        <Link href="/ops/office/new" className="btn focus-ring btn-primary btn-sm">
          {t('newSale')}
        </Link>
        <Link href="/ops/office/customers" className="btn focus-ring btn-secondary btn-sm">
          {t('customers')}
        </Link>
      </div>

      <dl className="ops-cost-summary" aria-label={t('summary')}>
        <div>
          <dt>{t('outstandingTotal')}</dt>
          <dd>
            {formatPriceLKR(totals.outstanding)} · {t('salesCount', { count: totals.openSales })}
          </dd>
        </div>
        <div>
          <dt>{t('overdueTotal')}</dt>
          <dd className={totals.overdue > 0 ? 'ops-status-out' : undefined}>
            {formatPriceLKR(totals.overdue)} · {t('salesCount', { count: totals.overdueSales })}
          </dd>
        </div>
        <div>
          <dt>{t('dueThisWeek')}</dt>
          <dd>{formatPriceLKR(totals.dueThisWeek)}</dd>
        </div>
      </dl>

      <nav className="ops-nav" aria-label={t('filterLabel')}>
        {OFFICE_FILTERS.map((f) => (
          <Link key={f} href={`/ops/office?show=${f}`} className="ops-nav-link focus-ring" aria-current={f === filter ? 'page' : undefined}>
            {t(`filter.${f}`)}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="field-message">{t('none')}</p>
      ) : (
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('sale')}</th>
                <th scope="col">{t('customer')}</th>
                <th scope="col">{t('total')}</th>
                <th scope="col">{t('paid')}</th>
                <th scope="col">{t('outstanding')}</th>
                <th scope="col">{t('nextDue')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ sale, balance }) => (
                <tr key={sale.id}>
                  <td>
                    <Link href={`/ops/office/${sale.number}`} className="focus-ring">
                      <strong>{sale.number}</strong>
                    </Link>
                    <br />
                    <span className="ops-muted">
                      {formatDate(sale.soldOn, locale)}
                      {sale.status === 'cancelled' ? ` · ${t('cancelled')}` : ''}
                    </span>
                  </td>
                  <td>
                    <Link href={`/ops/office/customers/${sale.customer.id}`} className="focus-ring">
                      {sale.customer.name}
                    </Link>
                    <br />
                    <span className="ops-muted">{sale.customer.phone}</span>
                  </td>
                  <td>{formatPriceLKR(sale.total)}</td>
                  <td>{formatPriceLKR(balance.paid)}</td>
                  <td className={balance.overdue > 0 ? 'ops-status-out' : undefined}>{formatPriceLKR(Math.max(0, balance.outstanding))}</td>
                  <td>
                    {sale.status === 'cancelled' ? (
                      '—'
                    ) : balance.next ? (
                      <span className={stateClass(balance.next.state)}>
                        {formatDate(balance.next.dueDate, locale)} · {formatPriceLKR(balance.next.remaining)} · {t(`state.${balance.next.state}`)}
                      </span>
                    ) : (
                      t('fullyPaid')
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
