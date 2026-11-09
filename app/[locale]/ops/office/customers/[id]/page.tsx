import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { updateOfficeCustomerAction } from '@/lib/ops/office-actions';
import { officeCustomerDetail } from '@/lib/ops/office';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatDate } from '@/lib/format/date';
import { formatPriceLKR } from '@/lib/pricing/format';
import { OpsFlash, type OpsSearchParams } from '../../../shared';

/** One office customer: details and every sale with its balance (docs/4-architecture.md §3.13). */
export default async function OpsOfficeCustomerPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: OpsSearchParams }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/office/customers/${id}`);
  const [found, query, t] = await Promise.all([officeCustomerDetail(id), searchParams, getTranslations('ops.office')]);
  if (!found) notFound();
  const { customer, sales, totals } = found;

  return (
    <div className="flex flex-col gap-4">
      <Link href="/ops/office/customers" className="focus-ring field-message">
        ← {t('customers')}
      </Link>
      <h2 className="checkout-step-title">{customer.name}</h2>
      <OpsFlash searchParams={query} />

      <dl className="ops-cost-summary">
        <div>
          <dt>{t('bought')}</dt>
          <dd>{formatPriceLKR(totals.bought)}</dd>
        </div>
        <div>
          <dt>{t('paid')}</dt>
          <dd>{formatPriceLKR(totals.paid)}</dd>
        </div>
        <div>
          <dt>{t('outstanding')}</dt>
          <dd>{formatPriceLKR(totals.outstanding)}</dd>
        </div>
      </dl>

      <section className="flex flex-col gap-2" aria-labelledby="sales">
        <h3 id="sales" className="checkout-step-title">
          {t('salesHeading')}
        </h3>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('sale')}</th>
                <th scope="col">{t('total')}</th>
                <th scope="col">{t('paid')}</th>
                <th scope="col">{t('outstanding')}</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(({ sale, balance }) => (
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
                  <td>{formatPriceLKR(sale.total)}</td>
                  <td>{formatPriceLKR(balance.paid)}</td>
                  <td className={balance.overdue > 0 ? 'ops-status-out' : undefined}>{sale.status === 'cancelled' ? '—' : formatPriceLKR(Math.max(0, balance.outstanding))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <form action={updateOfficeCustomerAction} className="ops-form">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={customer.id} />
        <fieldset>
          <legend>{t('customerDetails')}</legend>
          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="name">
                {t('name')}
              </label>
              <input id="name" name="name" className="input" required minLength={2} maxLength={120} defaultValue={customer.name} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="phone">
                {t('phone')}
              </label>
              <input id="phone" name="phone" type="tel" inputMode="tel" className="input" required maxLength={20} defaultValue={customer.phone} />
            </div>
          </div>
          <label className="field-label" htmlFor="address">
            {t('address')}
          </label>
          <input id="address" name="address" className="input" maxLength={500} defaultValue={customer.address ?? ''} />
          <label className="field-label" htmlFor="note">
            {t('customerNoteField')}
          </label>
          <input id="note" name="note" className="input" maxLength={300} defaultValue={customer.note ?? ''} />
        </fieldset>
        <div>
          <Button type="submit" variant="secondary">
            {t('saveCustomer')}
          </Button>
        </div>
      </form>
    </div>
  );
}
