import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { updateJacketPricesAction, updateMatrixPriceAction, updateSareePriceAction } from '@/lib/ops/actions';
import { priceTables } from '@/lib/ops/queries';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatPriceLKR } from '@/lib/pricing/format';
import { OpsFlash, type OpsSearchParams } from '../shared';

/**
 * Prices (docs/4-architecture.md §3.5), the one place prices change; every
 * change is audited. Laid out for clarity (docs/2-ui.md §7.7): each saree on
 * sale with its own price (PRD v4.2), the jacket price added to it and the
 * total the customer pays; then jacket prices; then the starting prices that
 * only fill in a new saree's price.
 */
export default async function OpsPricesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/prices`);
  const [{ designs, materials, jackets, customerPrices, sareesByJacket }, query, tPrices, tCol, tStock] = await Promise.all([
    priceTables(),
    searchParams,
    getTranslations('ops.prices'),
    getTranslations('ops.columns'),
    getTranslations('ops.stock'),
  ]);

  return (
    <div className="flex flex-col gap-7">
      <OpsFlash searchParams={query} />
      <p className="ops-lead">{tPrices('howItWorks')}</p>

      {/* 1. Each saree's own price and what the customer pays. */}
      <section className="flex flex-col gap-3" aria-labelledby="customer-heading">
        <h2 id="customer-heading" className="checkout-step-title">
          {tPrices('customerHeading')}
        </h2>
        {customerPrices.length === 0 ? (
          <p className="field-message ops-muted">{tPrices('noSarees')}</p>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th scope="col">{tPrices('saree')}</th>
                  <th scope="col">{tPrices('sareePart')}</th>
                  <th scope="col" className="ops-num">
                    {tPrices('jacketPart')}
                  </th>
                  <th scope="col" className="ops-num">
                    {tPrices('customerPays')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {customerPrices.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">
                      <Link href={`/ops/products/${row.id}`} className="focus-ring">
                        {row.code ? `${row.code} · ` : ''}
                        {row.name}
                      </Link>
                    </th>
                    <td>
                      <form action={updateSareePriceAction} className="ops-inline-form">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={row.id} />
                        <input
                          className="input ops-number-input"
                          name="price"
                          type="number"
                          min={1}
                          step={1}
                          required
                          defaultValue={row.sareePrice}
                          aria-label={`${row.name} — ${tPrices('sareePart')}`}
                        />
                        <Button type="submit" size="sm" variant="secondary">
                          {tStock('save')}
                        </Button>
                      </form>
                    </td>
                    <td className="ops-num">
                      {formatPriceLKR(row.jacketPrice)}
                      <span className="ops-cell-note">{row.jacketName}</span>
                    </td>
                    <td className="ops-num ops-strong">{formatPriceLKR(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="field-message ops-muted">{tPrices('ownPriceNote')}</p>
      </section>

      {/* 2. Jacket prices: one per jacket material, added to every saree with it. */}
      <section className="flex flex-col gap-3" aria-labelledby="jacket-heading">
        <h2 id="jacket-heading" className="checkout-step-title">
          {tPrices('jacketHeading')}
        </h2>
        <p className="field-message ops-muted">{tPrices('jacketNote')}</p>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{tCol('jacketMaterial')}</th>
                <th scope="col">{tPrices('jacketPrice')}</th>
              </tr>
            </thead>
            <tbody>
              {jackets.map((jacket) => (
                <tr key={jacket.id}>
                  <th scope="row">{jacket.name}</th>
                  <td>
                    <form action={updateJacketPricesAction} className="ops-inline-form">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={jacket.id} />
                      <input
                        className="input ops-number-input"
                        name="pairingAddOn"
                        type="number"
                        min={0}
                        step={1}
                        required
                        defaultValue={jacket.pairingAddOn}
                        aria-label={`${jacket.name} — ${tPrices('jacketPrice')}`}
                      />
                      <Button type="submit" size="sm" variant="secondary">
                        {tStock('save')}
                      </Button>
                      <span className="ops-cell-note">{tPrices('reaches', { count: sareesByJacket[jacket.id] ?? 0 })}</span>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Starting prices: only fill in the price of a new saree (PRD v4.2). */}
      <details className="ops-other-actions">
        <summary className="focus-ring">{tPrices('matrixHeading')}</summary>
        <div className="flex flex-col gap-3">
          <p className="field-message ops-muted">{tPrices('matrixNote')}</p>
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th scope="col">{tCol('design')}</th>
                  {materials.map((m) => (
                    <th key={m.id} scope="col">
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {designs.map((design) => (
                  <tr key={design.id}>
                    <th scope="row">{design.name}</th>
                    {materials.map((material) => {
                      const cell = design.prices.find((p) => p.materialId === material.id);
                      return (
                        <td key={material.id}>
                          {cell ? (
                            <form action={updateMatrixPriceAction} className="ops-inline-form">
                              <input type="hidden" name="locale" value={locale} />
                              <input type="hidden" name="designId" value={design.id} />
                              <input type="hidden" name="materialId" value={material.id} />
                              <input
                                className="input ops-number-input"
                                name="price"
                                type="number"
                                min={1}
                                step={1}
                                required
                                defaultValue={cell.price}
                                aria-label={`${design.name} — ${material.name}`}
                              />
                              <Button type="submit" size="sm" variant="tertiary">
                                {tStock('save')}
                              </Button>
                            </form>
                          ) : (
                            <span className="ops-muted">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  );
}
