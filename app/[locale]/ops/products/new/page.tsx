import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { createProductAction } from '@/lib/ops/product-actions';
import { productFormOptions } from '@/lib/ops/products';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatPriceLKR } from '@/lib/pricing/format';
import { formatProductCode } from '@/lib/catalogue/product-code';
import { OpsFlash, type OpsSearchParams } from '../../shared';

/** Add a saree product (docs/4-architecture.md §3.10). A plain form: works without JavaScript. */
export default async function OpsNewProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/products/new`);
  const [options, query, t] = await Promise.all([productFormOptions(), searchParams, getTranslations('ops.products')]);
  const priced = options.designs.filter((d) => options.materials.some((m) => options.prices[`${d.id}|${m.id}`]));

  return (
    <div className="flex flex-col gap-4">
      <Link href="/ops/products" className="focus-ring field-message">
        ← {t('backToProducts')}
      </Link>
      <h2 className="checkout-step-title">{t('addSaree')}</h2>
      <OpsFlash searchParams={query} />

      <form action={createProductAction} className="ops-form">
        <input type="hidden" name="locale" value={locale} />

        <fieldset>
          <legend>{t('sareeLegend')}</legend>
          <label className="field-label" htmlFor="name">
            {t('productName')}
          </label>
          <input id="name" name="name" className="input" required minLength={2} maxLength={80} placeholder={t('productNameHint')} />

          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="designId">
                {t('design')}
              </label>
              <select id="designId" name="designId" className="input" required defaultValue="">
                <option value="" disabled>
                  {t('choose')}
                </option>
                {options.designs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.active ? '' : ` (${t('archived')})`}
                  </option>
                ))}
                <option value="__new">{t('newDesign')}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="newDesignName">
                {t('newDesignName')}
              </label>
              <input id="newDesignName" name="newDesignName" className="input" maxLength={60} placeholder={t('newDesignHint')} />
            </div>
          </div>

          {/* Saree category (PRD v4.0): sets the product code, e.g. LSC009. */}
          <div className="flex flex-col gap-1">
            <label className="field-label" htmlFor="materialId">
              {t('category')}
            </label>
            <select id="materialId" name="materialId" className="input" required defaultValue="">
              <option value="" disabled>
                {t('choose')}
              </option>
              {options.materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {t('nextCode', { code: formatProductCode(m.codePrefix!, m.nextNumber) })}
                </option>
              ))}
            </select>
            <p className="field-message">
              {t('categoryNote')}{' '}
              <Link href="/ops/products/categories" className="focus-ring">
                {t('manageCategories')}
              </Link>
            </p>
          </div>

          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="colourName">
                {t('colourName')}
              </label>
              <input id="colourName" name="colourName" className="input" required maxLength={40} placeholder={t('colourNameHint')} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="colourHex">
                {t('colour')}
              </label>
              <input id="colourHex" name="colourHex" type="color" className="input ops-colour-input" required />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>{t('priceLegend')}</legend>
          <label className="field-label" htmlFor="price">
            {t('sareePrice')}
          </label>
          <input id="price" name="price" type="number" min={1} step={1} className="input ops-number-input" required />
          <p className="field-message">{t('sareePriceNote')}</p>
          {priced.length > 0 && (
            <details>
              <summary className="field-message">{t('currentPrices')}</summary>
              <ul className="field-message">
                {priced.map((d) => (
                  <li key={d.id}>
                    {d.name}: {options.materials.map((m) => {
                      const p = options.prices[`${d.id}|${m.id}`];
                      return `${m.name} ${p ? formatPriceLKR(p) : '—'}`;
                    }).join(' · ')}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </fieldset>

        <fieldset>
          <legend>{t('jacketLegend')}</legend>
          <label className="field-label" htmlFor="jacketColourwayId">
            {t('pairedJacket')}
          </label>
          <select id="jacketColourwayId" name="jacketColourwayId" className="input" required defaultValue="">
            <option value="" disabled>
              {t('choose')}
            </option>
            {options.jackets.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
          <p className="field-message">
            {t('jacketMissing')}{' '}
            <Link href="/ops/products/jackets/new" className="focus-ring">
              {t('addJacket')}
            </Link>
          </p>
        </fieldset>

        <fieldset>
          <legend>{t('stockLegend')}</legend>
          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="quantity">
                {t('startingQuantity')}
              </label>
              <input id="quantity" name="quantity" type="number" min={0} step={1} defaultValue={0} className="input ops-number-input" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="threshold">
                {t('lowAt')}
              </label>
              <input id="threshold" name="threshold" type="number" min={0} step={1} defaultValue={3} className="input ops-number-input" required />
            </div>
          </div>
          <label className="ops-inline-form">
            <input type="checkbox" name="featured" />
            {t('featured')}
          </label>
        </fieldset>

        <p className="field-message">{t('photosAfter')}</p>
        <div>
          <Button type="submit">{t('create')}</Button>
        </div>
      </form>
    </div>
  );
}
