import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/primitives/Button';
import { adjustStockAction, setThresholdAction } from '@/lib/ops/actions';
import { stockRows } from '@/lib/ops/queries';
import { requireStaffPage } from '@/lib/ops/staff';
import { OpsFlash, type OpsSearchParams } from '../shared';

/**
 * STOCK_ITEM, the single source of availability (docs/4-architecture.md
 * §3.2, §3.5). Adjustments are relative and audited; never an overwrite.
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
  const [rows, query, tCol, tStock, tLevel] = await Promise.all([
    stockRows(),
    searchParams,
    getTranslations('ops.columns'),
    getTranslations('ops.stock'),
    getTranslations('product.stock'),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <OpsFlash searchParams={query} />
      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th scope="col">{tCol('item')}</th>
              <th scope="col">{tCol('sku')}</th>
              <th scope="col">{tCol('inStock')}</th>
              <th scope="col">{tStock('adjust')}</th>
              <th scope="col">{tCol('lowAt')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sku}>
                <td>{row.name}</td>
                <td>{row.sku}</td>
                <td className={row.state === 'out' ? 'ops-status-out' : row.state === 'low' ? 'ops-status-low' : undefined}>
                  {row.quantity}
                  {row.state === 'out' ? ` · ${tLevel('outOfStock')}` : row.state === 'low' ? ` · ${tLevel('lowStock')}` : ''}
                </td>
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
