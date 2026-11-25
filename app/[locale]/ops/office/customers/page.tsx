import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { officeCustomerList, officeNames } from '@/lib/ops/office';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatPriceLKR } from '@/lib/pricing/format';
import type { OpsSearchParams } from '../../shared';

/**
 * Everyone who has bought in the office, with what they still owe
 * (docs/4-architecture.md §3.13), filterable by the office they work at.
 */
export default async function OpsOfficeCustomersPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: OpsSearchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/office/customers`);
  const query = await searchParams;
  const offices = await officeNames();
  // Only an office that exists is a filter; anything else shows everyone.
  const office = offices.find((o) => o.toLowerCase() === String(query.office ?? '').trim().toLowerCase());
  const [customers, t] = await Promise.all([officeCustomerList(office), getTranslations('ops.office')]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/ops/office" className="focus-ring field-message">
        ← {t('back')}
      </Link>
      <h2 className="checkout-step-title">{t('customers')}</h2>
      {offices.length > 0 && (
        <form method="get" className="ops-inline-form" role="search" aria-label={t('officeFilter')}>
          <label className="field-label" htmlFor="office-filter">
            {t('office')}
          </label>
          <select id="office-filter" name="office" className="input" defaultValue={office ?? ''}>
            <option value="">{t('allOffices')}</option>
            {offices.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary" size="sm">
            {t('applyFilter')}
          </Button>
        </form>
      )}
      {customers.length === 0 ? (
        <p className="field-message">{office ? t('noCustomersAtOffice', { office }) : t('noCustomers')}</p>
      ) : (
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('name')}</th>
                <th scope="col">{t('phone')}</th>
                <th scope="col">{t('office')}</th>
                <th scope="col">{t('salesHeading')}</th>
                <th scope="col">{t('outstanding')}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/ops/office/customers/${c.id}`} className="focus-ring">
                      <strong>{c.name}</strong>
                    </Link>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.office ?? '—'}</td>
                  <td>{c.sales}</td>
                  <td className={c.overdue > 0 ? 'ops-status-out' : undefined}>
                    {formatPriceLKR(c.outstanding)}
                    {c.overdue > 0 ? ` · ${t('overdueAmount', { amount: formatPriceLKR(c.overdue) })}` : ''}
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
