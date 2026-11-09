import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { costOverview } from '@/lib/ops/costs';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatPriceLKR } from '@/lib/pricing/format';

/** Unit cost and margin of everything on sale (docs/4-architecture.md §3.11). Staff-only. */
export default async function OpsCostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/costs`);
  const [data, t] = await Promise.all([costOverview(), getTranslations('ops.costs')]);

  const money = (value: number | null) => (value === null ? <span className="ops-status-low">{t('notEnteredShort')}</span> : formatPriceLKR(value));
  const margin = (m: { profit: number; percent: number } | null) =>
    m === null ? (
      '—'
    ) : (
      <span className={m.profit < 0 ? 'ops-status-out' : undefined}>
        {formatPriceLKR(m.profit)} · {t('percent', { percent: m.percent })}
      </span>
    );

  return (
    <div className="flex flex-col gap-6">
      <p className="field-message" style={{ maxWidth: '68ch' }}>
        {t('intro')}
      </p>
      {data.missing > 0 && (
        <p className="field-message ops-status-low" role="status">
          {t('missing', { count: data.missing })}
        </p>
      )}

      <section className="flex flex-col gap-3" aria-labelledby="cost-sarees">
        <h2 id="cost-sarees" className="checkout-step-title">
          {t('sareesHeading')}
        </h2>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('product')}</th>
                <th scope="col">{t('setPrice')}</th>
                <th scope="col">{t('sareeCost')}</th>
                <th scope="col">{t('jacketCost')}</th>
                <th scope="col">{t('unitCost')}</th>
                <th scope="col">{t('profit')}</th>
              </tr>
            </thead>
            <tbody>
              {data.sarees.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/ops/products/${row.id}#cost`} className="focus-ring">
                      <strong>{row.name}</strong>
                    </Link>
                    <br />
                    <span className="ops-muted">
                      {row.detail} · {row.jacket}
                    </span>
                  </td>
                  <td>{formatPriceLKR(row.price)}</td>
                  <td>{money(row.sareeCost)}</td>
                  <td>
                    <Link href={`/ops/products/jackets/${row.jacketId}#cost`} className="focus-ring">
                      {money(row.jacketCost)}
                    </Link>
                  </td>
                  <td>{row.cost === null ? '—' : formatPriceLKR(row.cost)}</td>
                  <td>{margin(row.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="cost-jackets">
        <h2 id="cost-jackets" className="checkout-step-title">
          {t('jacketsHeading')}
        </h2>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('product')}</th>
                <th scope="col">{t('priceAlone')}</th>
                <th scope="col">{t('unitCost')}</th>
                <th scope="col">{t('profit')}</th>
              </tr>
            </thead>
            <tbody>
              {data.jackets.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/ops/products/jackets/${row.id}#cost`} className="focus-ring">
                      <strong>{row.name}</strong>
                    </Link>
                    <br />
                    <span className="ops-muted">{row.sku}</span>
                  </td>
                  <td>{formatPriceLKR(row.price)}</td>
                  <td>{money(row.cost)}</td>
                  <td>{margin(row.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
