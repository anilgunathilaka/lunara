import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { adjustStockAction, setThresholdAction } from '@/lib/ops/actions';
import { inventoryRows } from '@/lib/ops/inventory';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatPriceLKR } from '@/lib/pricing/format';
import { OpsFlash, type OpsSearchParams } from '../shared';

/**
 * Inventory in one place (docs/4-architecture.md §3.12): STOCK_ITEM, the
 * single source of availability, with sold counts, value and history.
 * Adjustments are relative, reasoned and recorded; never an overwrite.
 */
export default async function OpsStockPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/stock`);
  const [{ rows, totals }, query, tCol, tStock, tInv, tLevel] = await Promise.all([
    inventoryRows(),
    searchParams,
    getTranslations('ops.columns'),
    getTranslations('ops.stock'),
    getTranslations('ops.inventory'),
    getTranslations('product.stock'),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <OpsFlash searchParams={query} />
      <p className="field-message" style={{ maxWidth: '68ch' }}>
        {tInv('intro')}
      </p>
      <dl className="ops-cost-summary" aria-label={tInv('summary')}>
        <div>
          <dt>{tInv('unitsOnHand')}</dt>
          <dd>{totals.units}</dd>
        </div>
        <div>
          <dt>{tInv('soldOnline')}</dt>
          <dd>{totals.soldOnline}</dd>
        </div>
        <div>
          <dt>{tInv('valueAtCost')}</dt>
          <dd>{formatPriceLKR(totals.costValue)}</dd>
        </div>
        <div>
          <dt>{tInv('valueAtPrice')}</dt>
          <dd>{formatPriceLKR(totals.priceValue)}</dd>
        </div>
      </dl>
      {totals.missingCost > 0 && (
        <p className="field-message ops-status-low" role="status">
          {tInv('missingCost', { count: totals.missingCost })}{' '}
          <Link href="/ops/costs" className="focus-ring">
            {tInv('enterCosts')}
          </Link>
        </p>
      )}

      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th scope="col">{tCol('item')}</th>
              <th scope="col">{tCol('inStock')}</th>
              <th scope="col">{tInv('soldOnline')}</th>
              <th scope="col">{tInv('valueAtCost')}</th>
              <th scope="col">{tInv('valueAtPrice')}</th>
              <th scope="col">{tStock('adjust')}</th>
              <th scope="col">{tCol('lowAt')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sku}>
                <td>
                  <Link href={`/ops/stock/${encodeURIComponent(row.sku)}`} className="focus-ring">
                    <strong>{row.name}</strong>
                  </Link>
                  <br />
                  <span className="ops-muted">
                    {row.sku}
                    {row.active ? '' : ` · ${tInv('archived')}`}
                  </span>
                </td>
                <td className={row.state === 'out' ? 'ops-status-out' : row.state === 'low' ? 'ops-status-low' : undefined}>
                  {row.quantity}
                  {row.state === 'out' ? ` · ${tLevel('outOfStock')}` : row.state === 'low' ? ` · ${tLevel('lowStock')}` : ''}
                </td>
                <td>{row.soldOnline}</td>
                <td>{row.costValue === null ? <span className="ops-status-low">{tInv('noCost')}</span> : formatPriceLKR(row.costValue)}</td>
                <td>{formatPriceLKR(row.priceValue)}</td>
                <td>
                  <form action={adjustStockAction} className="ops-inline-form">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="sku" value={row.sku} />
                    <input
                      className="input ops-number-input"
                      name="delta"
                      type="number"
                      step={1}
                      required
                      aria-label={`${tStock('adjust')} — ${row.name}`}
                      placeholder="±"
                    />
                    <input
                      className="input"
                      name="reason"
                      required
                      minLength={2}
                      aria-label={`${tStock('reason')} — ${row.name}`}
                      placeholder={tStock('adjustHint')}
                    />
                    <Button type="submit" size="sm" variant="secondary">
                      {tStock('save')}
                    </Button>
                  </form>
                </td>
                <td>
                  <form action={setThresholdAction} className="ops-inline-form">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="sku" value={row.sku} />
                    <input
                      className="input ops-number-input"
                      name="threshold"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={row.threshold}
                      aria-label={`${tCol('lowAt')} — ${row.name}`}
                    />
                    <Button type="submit" size="sm" variant="tertiary">
                      {tStock('save')}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
