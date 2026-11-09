import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { productStatusAction, updateProductAction } from '@/lib/ops/product-actions';
import { productFormOptions, productForEdit } from '@/lib/ops/products';
import { requireStaffPage } from '@/lib/ops/staff';
import { OpsFlash, type OpsSearchParams } from '../../shared';
import { CostForm } from '../CostForm';

/** Edit, archive, restore or delete one saree product (docs/4-architecture.md §3.10). */
export default async function OpsEditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/products/${id}`);
  const [found, options, query, t] = await Promise.all([
    productForEdit(id),
    productFormOptions(),
    searchParams,
    getTranslations('ops.products'),
  ]);
  if (!found) notFound();
  const { row, sold } = found;
  const saree = row.sareeColourway;
  const live = row.active && saree.active;
  const jacketChoices = options.jackets.some((j) => j.id === row.jacketColourwayId)
    ? options.jackets
    : [{ id: row.jacketColourwayId, name: `${row.jacketColourwayId} (${t('archived')})` }, ...options.jackets];

  return (
    <div className="flex flex-col gap-4">
      <Link href="/ops/products" className="focus-ring field-message">
        ← {t('backToProducts')}
      </Link>
      <h2 className="checkout-step-title">
        {row.name} · {live ? t('live') : t('archived')}
      </h2>
      <p className="field-message ops-muted">
        {saree.design.name} · {saree.material.name} · {saree.sku}
      </p>
      <OpsFlash searchParams={query} />

      <form action={updateProductAction} className="ops-form">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={row.id} />
        <fieldset>
          <legend>{t('sareeLegend')}</legend>
          <label className="field-label" htmlFor="name">
            {t('productName')}
          </label>
          <input id="name" name="name" className="input" required minLength={2} maxLength={80} defaultValue={row.name} />
          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="colourName">
                {t('colourName')}
              </label>
              <input id="colourName" name="colourName" className="input" required maxLength={40} defaultValue={saree.colourName} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="colourHex">
                {t('colour')}
              </label>
              <input id="colourHex" name="colourHex" type="color" className="input ops-colour-input" required defaultValue={saree.colourHex} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>{t('priceLegend')}</legend>
          <label className="field-label" htmlFor="price">
            {t('sareePriceFor', { design: saree.design.name, cotton: saree.material.name })}
          </label>
          <input id="price" name="price" type="number" min={1} step={1} className="input ops-number-input" required defaultValue={saree.price.price} />
          <p className="field-message">{t('sareePriceNote')}</p>
        </fieldset>

        <fieldset>
          <legend>{t('jacketLegend')}</legend>
          <label className="field-label" htmlFor="jacketColourwayId">
            {t('pairedJacket')}
          </label>
          <select id="jacketColourwayId" name="jacketColourwayId" className="input" required defaultValue={row.jacketColourwayId}>
            {jacketChoices.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset>
          <legend>{t('stockLegend')}</legend>
          <p className="field-message">
            {t('inStockNow', { count: saree.stock.quantity })}{' '}
            <Link href={`/ops/stock/${encodeURIComponent(saree.sku)}`} className="focus-ring">
              {t('adjustStock')}
            </Link>
          </p>
          <label className="field-label" htmlFor="threshold">
            {t('lowAt')}
          </label>
          <input id="threshold" name="threshold" type="number" min={0} step={1} className="input ops-number-input" required defaultValue={saree.stock.threshold} />
          <label className="ops-inline-form">
            <input type="checkbox" name="featured" defaultChecked={row.isFeatured} />
            {t('featured')}
          </label>
        </fieldset>

        <div className="ops-inline-form">
          <Button type="submit">{t('save')}</Button>
          <Link href="/ops/photos" className="btn focus-ring btn-secondary btn-md">
            {t('managePhotos')}
          </Link>
          {live && (
            <Link href={`/shop/${row.id}`} className="btn focus-ring btn-tertiary btn-md">
              {t('viewInShop')}
            </Link>
          )}
        </div>
      </form>

      <CostForm
        locale={locale}
        kind="saree"
        id={row.id}
        cost={saree.stock.cost}
        price={saree.price.price}
        priceLabel={t('sareePriceFor', { design: saree.design.name, cotton: saree.material.name })}
      />

      <fieldset className="ops-form ops-danger-zone">
        <legend>{t('statusLegend')}</legend>
        <p className="field-message">{live ? t('archiveNote') : t('restoreNote')}</p>
        <form action={productStatusAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="op" value={live ? 'archive' : 'restore'} />
          <Button type="submit" variant="secondary">
            {live ? t('archive') : t('restore')}
          </Button>
        </form>
        {sold === 0 ? (
          <form action={productStatusAction}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="op" value="delete" />
            <p className="field-message">{t('deleteNote')}</p>
            <label className="ops-inline-form field-message">
              <input type="checkbox" name="confirm" required />
              {t('deleteConfirm')}
            </label>
            <Button type="submit" variant="tertiary">
              {t('deleteForever')}
            </Button>
          </form>
        ) : (
          <p className="field-message ops-muted">{t('cannotDelete', { count: sold })}</p>
        )}
      </fieldset>
    </div>
  );
}
