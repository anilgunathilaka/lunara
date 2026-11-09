import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { officeCustomerList } from '@/lib/ops/office';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatPriceLKR } from '@/lib/pricing/format';

/** Everyone who has bought in the office, with what they still owe (docs/4-architecture.md §3.13). */
export default async function OpsOfficeCustomersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/office/customers`);
  const [customers, t] = await Promise.all([officeCustomerList(), getTranslations('ops.office')]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/ops/office" className="focus-ring field-message">
        ← {t('back')}
      </Link>
      <h2 className="checkout-step-title">{t('customers')}</h2>
      {customers.length === 0 ? (
        <p className="field-message">{t('noCustomers')}</p>
      ) : (
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('name')}</th>
                <th scope="col">{t('phone')}</th>
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
