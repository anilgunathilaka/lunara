import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { adjustStockAction } from '@/lib/ops/actions';
import { inventoryHistory } from '@/lib/ops/inventory';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatDateTime } from '@/lib/format/date';
import { formatPriceLKR } from '@/lib/pricing/format';
import { OpsFlash, type OpsSearchParams } from '../../shared';

/** One item's stock and every movement behind it (docs/4-architecture.md §3.12). */
export default async function OpsStockHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; sku: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale, sku: rawSku } = await params;
  setRequestLocale(locale);
  const sku = decodeURIComponent(rawSku);
  await requireStaffPage(locale, `/${locale}/ops/stock/${encodeURIComponent(sku)}`);
  const [found, query, tCol, tStock, tInv] = await Promise.all([
    inventoryHistory(sku),
    searchParams,
    getTranslations('ops.columns'),
    getTranslations('ops.stock'),
    getTranslations('ops.inventory'),
  ]);
  if (!found) notFound();
  const { row, movements } = found;

  return (
    <div className="flex flex-col gap-4">
      <Link href="/ops/stock" className="focus-ring field-message">
        ← {tInv('back')}
      </Link>
      <h2 className="checkout-step-title">{row.name}</h2>
      <p className="field-message ops-muted">
        {row.sku}
        {row.active ? '' : ` · ${tInv('archived')}`}
        {row.editHref && (
          <>
            {' · '}
            <Link href={row.editHref} className="focus-ring">
              {tInv('editProduct')}
            </Link>
          </>
        )}
      </p>
      <OpsFlash searchParams={query} />

      <dl className="ops-cost-summary">
        <div>
          <dt>{tCol('inStock')}</dt>
          <dd className={row.state === 'out' ? 'ops-status-out' : row.state === 'low' ? 'ops-status-low' : undefined}>{row.quantity}</dd>
        </div>
        <div>
          <dt>{tInv('soldOnline')}</dt>
          <dd>{row.soldOnline}</dd>
        </div>
        <div>
          <dt>{tInv('valueAtCost')}</dt>
          <dd>{row.costValue === null ? tInv('noCost') : formatPriceLKR(row.costValue)}</dd>
        </div>
        <div>
          <dt>{tInv('valueAtPrice')}</dt>
          <dd>{formatPriceLKR(row.priceValue)}</dd>
        </div>
      </dl>

      <form action={adjustStockAction} className="ops-form">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="sku" value={row.sku} />
        <input type="hidden" name="from" value="history" />
        <fieldset>
          <legend>{tStock('adjust')}</legend>
          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="delta">
                {tStock('adjust')}
              </label>
              <input id="delta" className="input ops-number-input" name="delta" type="number" step={1} required placeholder="±" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="reason">
                {tStock('reason')}
              </label>
              <input id="reason" className="input" name="reason" required minLength={2} maxLength={300} placeholder={tStock('adjustHint')} />
            </div>
          </div>
        </fieldset>
        <div>
          <Button type="submit">{tStock('save')}</Button>
        </div>
      </form>

      <section className="flex flex-col gap-3" aria-labelledby="history">
        <h3 id="history" className="checkout-step-title">
          {tInv('history')}
        </h3>
        {movements.length === 0 ? (
          <p className="field-message">{tInv('noHistory')}</p>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th scope="col">{tInv('when')}</th>
                  <th scope="col">{tInv('what')}</th>
                  <th scope="col">{tInv('change')}</th>
                  <th scope="col">{tInv('balance')}</th>
                  <th scope="col">{tInv('reference')}</th>
                  <th scope="col">{tInv('by')}</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{formatDateTime(m.createdAt, locale)}</td>
                    <td>
                      {tInv(`kind.${m.kind}`)}
                      {m.note && (
                        <>
                          <br />
                          <span className="ops-muted">{m.kind === 'opening' ? tInv('openingNote') : m.note}</span>
                        </>
                      )}
                    </td>
                    <td className={m.delta < 0 ? 'ops-status-out' : undefined}>{m.delta > 0 ? `+${m.delta}` : m.delta}</td>
                    <td>{m.balance}</td>
                    <td>
                      {m.reference && (m.kind === 'online_sale' || m.kind === 'online_cancel') ? (
                        <Link href={`/ops/orders/${m.reference}`} className="focus-ring">
                          {m.reference}
                        </Link>
                      ) : (
                        (m.reference ?? '')
                      )}
                    </td>
                    <td>{m.actor === 'customer' ? tInv('customer') : m.actor === 'system' ? tInv('system') : m.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
