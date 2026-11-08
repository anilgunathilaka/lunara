import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/primitives/Button';
import { updateJacketPricesAction, updateMatrixPriceAction } from '@/lib/ops/actions';
import { priceTables } from '@/lib/ops/queries';
import { requireStaffPage } from '@/lib/ops/staff';
import { OpsFlash, type OpsSearchParams } from '../shared';

/**
 * PRICE_MATRIX and jacket material prices (docs/4-architecture.md §3.3,
 * §3.5). The one place prices change; every change is audited.
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
  const [{ designs, materials, jackets }, query, t, tPrices, tCol, tStock] = await Promise.all([
    priceTables(),
    searchParams,
    getTranslations('ops'),
    getTranslations('ops.prices'),
    getTranslations('ops.columns'),
    getTranslations('ops.stock'),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <OpsFlash searchParams={query} />
      <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
        {t('pricesNote')}
      </p>

      <section className="flex flex-col gap-3" aria-labelledby="matrix-heading">
        <h2 id="matrix-heading" className="checkout-step-title">
          {tPrices('matrixHeading')}
        </h2>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{tCol('design')}</th>
                {materials.map((m) => (
                  <th key={m.id} scope="col">
                    {m.name} (LKR)
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
                        {cell && (
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
                            <Button type="submit" size="sm" variant="secondary">
                              {tStock('save')}
                            </Button>
                          </form>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="jacket-heading">
        <h2 id="jacket-heading" className="checkout-step-title">
          {tPrices('jacketHeading')}
        </h2>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{tCol('jacketMaterial')}</th>
                <th scope="col">
                  {tPrices('pairingAddOn')} / {tPrices('standalone')} (LKR)
                </th>
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
                        aria-label={`${jacket.name} — ${tPrices('pairingAddOn')}`}
                      />
                      <input
                        className="input ops-number-input"
                        name="standalonePrice"
                        type="number"
                        min={1}
                        step={1}
                        required
                        defaultValue={jacket.standalonePrice}
                        aria-label={`${jacket.name} — ${tPrices('standalone')}`}
                      />
                      <Button type="submit" size="sm" variant="secondary">
                        {tStock('save')}
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
