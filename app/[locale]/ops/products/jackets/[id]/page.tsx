import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { jacketStatusAction, updateJacketAction } from '@/lib/ops/product-actions';
import { jacketForEdit } from '@/lib/ops/products';
import { requireStaffPage } from '@/lib/ops/staff';
import { OpsFlash, type OpsSearchParams } from '../../../shared';
import { CostForm } from '../../CostForm';

/** Edit, archive, restore or delete one jacket colour (docs/4-architecture.md §3.10). */
export default async function OpsEditJacketPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/products/jackets/${id}`);
  const [found, query, t] = await Promise.all([jacketForEdit(id), searchParams, getTranslations('ops.products')]);
  if (!found) notFound();
  const { row, sold } = found;

  return (
    <div className="flex flex-col gap-4">
      <Link href="/ops/products" className="focus-ring field-message">
        ← {t('backToProducts')}
      </Link>
      <h2 className="checkout-step-title">
        {row.material.name} · {row.colourName} · {row.active ? t('live') : t('archived')}
      </h2>
      <p className="field-message ops-muted">
        {row.sku} · {t('usedIn', { count: row._count.listings })}
      </p>
      <OpsFlash searchParams={query} />

      <form action={updateJacketAction} className="ops-form">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={row.id} />
        <fieldset>
          <legend>{t('colour')}</legend>
          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="colourName">
                {t('colourName')}
              </label>
              <input id="colourName" name="colourName" className="input" required maxLength={40} defaultValue={row.colourName} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="colourHex">
                {t('colour')}
              </label>
              <input id="colourHex" name="colourHex" type="color" className="input ops-colour-input" required defaultValue={row.colourHex} />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>{t('priceLegend')}</legend>
          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="standalonePrice">
                {t('priceAlone')}
              </label>
              <input id="standalonePrice" name="standalonePrice" type="number" min={1} step={1} className="input ops-number-input" required defaultValue={row.material.standalonePrice} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="pairingAddOn">
                {t('pairingAddOn')}
              </label>
              <input id="pairingAddOn" name="pairingAddOn" type="number" min={0} step={1} className="input ops-number-input" required defaultValue={row.material.pairingAddOn} />
            </div>
          </div>
          <p className="field-message">{t('jacketPriceNote', { material: row.material.name })}</p>
        </fieldset>
        <fieldset>
          <legend>{t('stockLegend')}</legend>
          <p className="field-message">
            {t('inStockNow', { count: row.stock.quantity })}{' '}
            <Link href="/ops/stock" className="focus-ring">
              {t('adjustStock')}
            </Link>
          </p>
          <label className="field-label" htmlFor="threshold">
            {t('lowAt')}
          </label>
          <input id="threshold" name="threshold" type="number" min={0} step={1} className="input ops-number-input" required defaultValue={row.stock.threshold} />
        </fieldset>
        <div className="ops-inline-form">
          <Button type="submit">{t('save')}</Button>
          <Link href="/ops/photos" className="btn focus-ring btn-secondary btn-md">
            {t('managePhotos')}
          </Link>
        </div>
      </form>

      <CostForm locale={locale} kind="jacket" id={row.id} cost={row.stock.cost} price={row.material.standalonePrice} priceLabel={t('priceAlone')} />

      <fieldset className="ops-form ops-danger-zone">
        <legend>{t('statusLegend')}</legend>
        <p className="field-message">{row.active ? t('archiveJacketNote') : t('restoreNote')}</p>
        <form action={jacketStatusAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="op" value={row.active ? 'archive' : 'restore'} />
          <Button type="submit" variant="secondary">
            {row.active ? t('archive') : t('restore')}
          </Button>
        </form>
        {sold === 0 && row._count.listings === 0 ? (
          <form action={jacketStatusAction}>
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
          <p className="field-message ops-muted">{sold > 0 ? t('cannotDelete', { count: sold }) : t('cannotDeleteUsed')}</p>
        )}
      </fieldset>
    </div>
  );
}
