import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { JacketPhotoField } from './JacketPhotoField';
import { createJacketAction } from '@/lib/ops/product-actions';
import { productFormOptions } from '@/lib/ops/products';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatPriceLKR } from '@/lib/pricing/format';
import { OpsFlash, type OpsSearchParams } from '../../../shared';

/** Add a jacket colour, optionally with a new jacket material (docs/4-architecture.md §3.10). */
export default async function OpsNewJacketPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/products/jackets/new`);
  const [options, query, t] = await Promise.all([productFormOptions(), searchParams, getTranslations('ops.products')]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/ops/products" className="focus-ring field-message">
        ← {t('backToProducts')}
      </Link>
      <h2 className="checkout-step-title">{t('addJacket')}</h2>
      <OpsFlash searchParams={query} />

      <form action={createJacketAction} className="ops-form">
        <input type="hidden" name="locale" value={locale} />
        <fieldset>
          <legend>{t('jacketMaterial')}</legend>
          <select id="materialId" name="materialId" className="input" required defaultValue="" aria-label={t('jacketMaterial')}>
            <option value="" disabled>
              {t('choose')}
            </option>
            {options.jacketMaterials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {formatPriceLKR(m.standalonePrice)}
              </option>
            ))}
            <option value="__new">{t('newJacketMaterial')}</option>
          </select>
          <p className="field-message">{t('newJacketMaterialNote')}</p>
          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="newMaterialName">
                {t('newMaterialName')}
              </label>
              <input id="newMaterialName" name="newMaterialName" className="input" maxLength={60} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="composition">
                {t('composition')}
              </label>
              <input id="composition" name="composition" className="input" maxLength={120} placeholder={t('compositionHint')} />
            </div>
          </div>
          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="pieceLengthMetres">
                {t('pieceLength')}
              </label>
              <input id="pieceLengthMetres" name="pieceLengthMetres" type="number" min={0.3} max={5} step={0.05} className="input ops-number-input" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="standalonePrice">
                {t('priceAlone')}
              </label>
              <input id="standalonePrice" name="standalonePrice" type="number" min={1} step={1} className="input ops-number-input" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="pairingAddOn">
                {t('pairingAddOn')}
              </label>
              <input id="pairingAddOn" name="pairingAddOn" type="number" min={0} step={1} defaultValue={0} className="input ops-number-input" />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>{t('jacketDesign')}</legend>
          <div className="flex flex-col gap-1">
            <label className="field-label" htmlFor="colourName">
              {t('jacketDesignName')}
            </label>
            <input id="colourName" name="colourName" className="input" required maxLength={40} placeholder={t('jacketDesignNameHint')} />
          </div>
          {/* The jacket is shown by its photograph, not a colour (founder decision 2026-11-14). */}
          <JacketPhotoField label={t('jacketPhoto')} hint={t('jacketPhotoHint')} />
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
        </fieldset>

        <div>
          <Button type="submit">{t('create')}</Button>
        </div>
      </form>
    </div>
  );
}
