import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { MAX_INSTALMENTS, OFFICE_ITEM_ROWS, addMonths, todayInSriLanka } from '@/lib/office/plan';
import { createOfficeSaleAction } from '@/lib/ops/office-actions';
import { officeItemOptions } from '@/lib/ops/office';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatPriceLKR } from '@/lib/pricing/format';
import { OpsFlash, type OpsSearchParams } from '../../shared';

/**
 * Record a sale made in the office (docs/4-architecture.md §3.13). Items
 * are chosen from the live catalogue at shop prices; the server prices the
 * sale, takes the stock and saves the instalment plan.
 */
export default async function OpsNewOfficeSalePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: OpsSearchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/office/new`);
  const [options, query, t] = await Promise.all([officeItemOptions(), searchParams, getTranslations('ops.office')]);
  const today = todayInSriLanka();
  const option = (o: { value: string; name: string; price: number; available: number }) => (
    <option key={o.value} value={o.value} disabled={o.available <= 0}>
      {o.name} · {formatPriceLKR(o.price)} · {t('inStock', { count: o.available })}
    </option>
  );

  return (
    <div className="flex flex-col gap-4">
      <Link href="/ops/office" className="focus-ring field-message">
        ← {t('back')}
      </Link>
      <h2 className="checkout-step-title">{t('newSale')}</h2>
      <OpsFlash searchParams={query} />

      <form action={createOfficeSaleAction} className="ops-form">
        <input type="hidden" name="locale" value={locale} />

        <fieldset>
          <legend>{t('customer')}</legend>
          <p className="field-message">{t('customerNote')}</p>
          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="customerName">
                {t('name')}
              </label>
              <input id="customerName" name="customerName" className="input" required minLength={2} maxLength={120} autoComplete="off" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="phone">
                {t('phone')}
              </label>
              <input id="phone" name="phone" type="tel" inputMode="tel" className="input" required maxLength={20} placeholder="07X XXX XXXX" autoComplete="off" />
            </div>
          </div>
          <label className="field-label" htmlFor="address">
            {t('address')}
          </label>
          <input id="address" name="address" className="input" maxLength={500} autoComplete="off" />
          <label className="field-label" htmlFor="customerNote">
            {t('customerNoteField')}
          </label>
          <input id="customerNote" name="customerNote" className="input" maxLength={300} />
        </fieldset>

        <fieldset>
          <legend>{t('items')}</legend>
          <p className="field-message">{t('itemsNote')}</p>
          {Array.from({ length: OFFICE_ITEM_ROWS }, (_, i) => (
            <div key={i} className="ops-form-row">
              <div className="flex flex-col gap-1">
                <label className="field-label" htmlFor={`item_${i}`}>
                  {t('itemN', { n: i + 1 })}
                </label>
                <select id={`item_${i}`} name={`item_${i}`} className="input" defaultValue="" required={i === 0}>
                  <option value="">{i === 0 ? t('choose') : t('none_')}</option>
                  <optgroup label={t('sarees')}>{options.sarees.map(option)}</optgroup>
                  <optgroup label={t('jacketsAlone')}>{options.jackets.map(option)}</optgroup>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="field-label" htmlFor={`qty_${i}`}>
                  {t('quantity')}
                </label>
                <input id={`qty_${i}`} name={`qty_${i}`} type="number" min={1} max={20} step={1} defaultValue={1} className="input ops-number-input" />
              </div>
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend>{t('priceLegend')}</legend>
          <p className="field-message">{t('priceNote')}</p>
          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="discount">
                {t('discount')}
              </label>
              <input id="discount" name="discount" type="number" min={0} step={1} defaultValue={0} className="input ops-number-input" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="discountReason">
                {t('discountReason')}
              </label>
              <input id="discountReason" name="discountReason" className="input" maxLength={200} placeholder={t('discountReasonHint')} />
            </div>
          </div>
          <label className="field-label" htmlFor="soldOn">
            {t('soldOn')}
          </label>
          <input id="soldOn" name="soldOn" type="date" className="input" required defaultValue={today} max={today} />
          <label className="field-label" htmlFor="note">
            {t('saleNote')}
          </label>
          <input id="note" name="note" className="input" maxLength={500} />
        </fieldset>

        <fieldset>
          <legend>{t('planLegend')}</legend>
          <label className="field-label" htmlFor="instalments">
            {t('instalmentCount')}
          </label>
          <select id="instalments" name="instalments" className="input" defaultValue="3">
            {Array.from({ length: MAX_INSTALMENTS }, (_, i) => (
              <option key={i} value={i + 1}>
                {t('instalmentsN', { count: i + 1 })}
              </option>
            ))}
          </select>
          <p className="field-message">{t('planNote')}</p>
          {Array.from({ length: MAX_INSTALMENTS }, (_, i) => (
            <div key={i} className="ops-form-row">
              <div className="flex flex-col gap-1">
                <label className="field-label" htmlFor={`due_${i + 1}`}>
                  {t('dueN', { n: i + 1 })}
                </label>
                <input id={`due_${i + 1}`} name={`due_${i + 1}`} type="date" className="input" defaultValue={addMonths(today, i)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="field-label" htmlFor={`amount_${i + 1}`}>
                  {t('amountN', { n: i + 1 })}
                </label>
                <input id={`amount_${i + 1}`} name={`amount_${i + 1}`} type="number" min={1} step={1} className="input ops-number-input" placeholder={t('auto')} />
              </div>
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend>{t('firstPaymentLegend')}</legend>
          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="firstPayment">
                {t('amountPaidToday')}
              </label>
              <input id="firstPayment" name="firstPayment" type="number" min={0} step={1} defaultValue={0} className="input ops-number-input" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="firstMethod">
                {t('method')}
              </label>
              <select id="firstMethod" name="firstMethod" className="input" defaultValue="cash">
                {(['cash', 'bank_transfer', 'card', 'other'] as const).map((m) => (
                  <option key={m} value={m}>
                    {t(`methods.${m}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="firstReference">
                {t('reference')}
              </label>
              <input id="firstReference" name="firstReference" className="input" maxLength={100} />
            </div>
          </div>
        </fieldset>

        <div>
          <Button type="submit">{t('saveSale')}</Button>
        </div>
      </form>
    </div>
  );
}
