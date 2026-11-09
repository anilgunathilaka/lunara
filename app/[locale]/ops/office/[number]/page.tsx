import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { MAX_INSTALMENTS, addMonths, dayOf } from '@/lib/office/plan';
import { cancelOfficeSaleAction, recordPaymentAction, updatePlanAction, voidPaymentAction } from '@/lib/ops/office-actions';
import { officeSaleDetail } from '@/lib/ops/office';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatDate, formatDateTime } from '@/lib/format/date';
import { formatPriceLKR } from '@/lib/pricing/format';
import { OpsFlash, type OpsSearchParams } from '../../shared';
import { stateClass } from '../shared';

/** One office sale: what was sold, the plan, every payment, and what is still owed (docs/4-architecture.md §3.13). */
export default async function OpsOfficeSalePage({ params, searchParams }: { params: Promise<{ locale: string; number: string }>; searchParams: OpsSearchParams }) {
  const { locale, number } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/office/${number}`);
  const [found, query, t] = await Promise.all([officeSaleDetail(number), searchParams, getTranslations('ops.office')]);
  if (!found) notFound();
  const { sale, balance, today } = found;
  const active = sale.status === 'active';
  const hidden = (
    <>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="number" value={sale.number} />
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <Link href="/ops/office" className="focus-ring field-message">
        ← {t('back')}
      </Link>
      <h2 className="checkout-step-title">
        {sale.number} · {active ? (balance.outstanding <= 0 ? t('fullyPaid') : t('open')) : t('cancelled')}
      </h2>
      <p className="field-message ops-muted">
        {formatDate(sale.soldOn, locale)} · {t('soldBy', { who: sale.soldBy })}
      </p>
      <OpsFlash searchParams={query} />

      <dl className="ops-cost-summary">
        <div>
          <dt>{t('total')}</dt>
          <dd>{formatPriceLKR(sale.total)}</dd>
        </div>
        <div>
          <dt>{t('paid')}</dt>
          <dd>{formatPriceLKR(balance.paid)}</dd>
        </div>
        <div>
          <dt>{t('outstanding')}</dt>
          <dd className={balance.overdue > 0 ? 'ops-status-out' : undefined}>{formatPriceLKR(Math.max(0, balance.outstanding))}</dd>
        </div>
        {balance.overdue > 0 && (
          <div>
            <dt>{t('overdueTotal')}</dt>
            <dd className="ops-status-out">{formatPriceLKR(balance.overdue)}</dd>
          </div>
        )}
      </dl>
      {!active && (
        <p className="field-message ops-status-out" role="status">
          {t('cancelledOn', { when: sale.cancelledAt ? formatDateTime(sale.cancelledAt, locale) : '', who: sale.cancelledBy ?? '', reason: sale.cancelReason ?? '' })}
          {balance.paid > 0 ? ` ${t('refundDue', { amount: formatPriceLKR(balance.paid) })}` : ''}
        </p>
      )}

      <section className="flex flex-col gap-2" aria-labelledby="customer">
        <h3 id="customer" className="checkout-step-title">
          {t('customer')}
        </h3>
        <p className="field-message">
          <Link href={`/ops/office/customers/${sale.customer.id}`} className="focus-ring">
            <strong>{sale.customer.name}</strong>
          </Link>{' '}
          · <a href={`tel:${sale.customer.phone}`}>{sale.customer.phone}</a>
          {sale.customer.address ? ` · ${sale.customer.address}` : ''}
        </p>
      </section>

      <section className="flex flex-col gap-2" aria-labelledby="items">
        <h3 id="items" className="checkout-step-title">
          {t('items')}
        </h3>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('item')}</th>
                <th scope="col">{t('quantity')}</th>
                <th scope="col">{t('unitPrice')}</th>
                <th scope="col">{t('lineTotal')}</th>
              </tr>
            </thead>
            <tbody>
              {sale.lines.map((line) => (
                <tr key={line.id}>
                  <td>
                    {line.title}
                    <br />
                    <span className="ops-muted">{[line.sareeSku, line.jacketSku].filter(Boolean).join(' + ')}</span>
                  </td>
                  <td>{line.quantity}</td>
                  <td>{formatPriceLKR(line.unitPrice)}</td>
                  <td>{formatPriceLKR(line.unitPrice * line.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Every price change is attributed inline, beside the price (CLAUDE.md). */}
        <dl className="ops-cost-summary">
          <div>
            <dt>{t('shopPrice')}</dt>
            <dd>{formatPriceLKR(sale.subtotal)}</dd>
          </div>
          {sale.discount > 0 && (
            <div>
              <dt>{t('discount')}</dt>
              <dd>
                − {formatPriceLKR(sale.discount)} · {sale.discountReason}
              </dd>
            </div>
          )}
          <div>
            <dt>{t('total')}</dt>
            <dd>{formatPriceLKR(sale.total)}</dd>
          </div>
        </dl>
        {sale.note && <p className="field-message ops-muted">{sale.note}</p>}
      </section>

      <section className="flex flex-col gap-2" aria-labelledby="plan">
        <h3 id="plan" className="checkout-step-title">
          {t('planLegend')}
        </h3>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{t('due')}</th>
                <th scope="col">{t('amount')}</th>
                <th scope="col">{t('stillOwed')}</th>
                <th scope="col">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {balance.instalments.map((i) => (
                <tr key={i.seq}>
                  <td>{i.seq}</td>
                  <td>{formatDate(i.dueDate, locale)}</td>
                  <td>{formatPriceLKR(i.amount)}</td>
                  <td>{formatPriceLKR(i.remaining)}</td>
                  <td className={stateClass(i.state)}>{t(`state.${i.state}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {active && balance.outstanding > 0 && (
        <form action={recordPaymentAction} className="ops-form">
          {hidden}
          <fieldset>
            <legend>{t('recordPayment')}</legend>
            <div className="ops-form-row">
              <div className="flex flex-col gap-1">
                <label className="field-label" htmlFor="amount">
                  {t('amount')}
                </label>
                <input id="amount" name="amount" type="number" min={1} max={balance.outstanding} step={1} required className="input ops-number-input" defaultValue={balance.next?.remaining ?? balance.outstanding} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="field-label" htmlFor="paidOn">
                  {t('paidOn')}
                </label>
                <input id="paidOn" name="paidOn" type="date" required className="input" defaultValue={today} max={today} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="field-label" htmlFor="method">
                  {t('method')}
                </label>
                <select id="method" name="method" className="input" defaultValue="cash">
                  {(['cash', 'bank_transfer', 'card', 'other'] as const).map((m) => (
                    <option key={m} value={m}>
                      {t(`methods.${m}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ops-form-row">
              <div className="flex flex-col gap-1">
                <label className="field-label" htmlFor="reference">
                  {t('reference')}
                </label>
                <input id="reference" name="reference" className="input" maxLength={100} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="field-label" htmlFor="paymentNote">
                  {t('paymentNote')}
                </label>
                <input id="paymentNote" name="note" className="input" maxLength={300} />
              </div>
            </div>
            <p className="field-message">{t('outstandingNow', { amount: formatPriceLKR(balance.outstanding) })}</p>
          </fieldset>
          <div>
            <Button type="submit">{t('savePayment')}</Button>
          </div>
        </form>
      )}

      <section className="flex flex-col gap-2" aria-labelledby="payments">
        <h3 id="payments" className="checkout-step-title">
          {t('payments')}
        </h3>
        {sale.payments.length === 0 ? (
          <p className="field-message">{t('noPayments')}</p>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th scope="col">{t('paidOn')}</th>
                  <th scope="col">{t('amount')}</th>
                  <th scope="col">{t('method')}</th>
                  <th scope="col">{t('receivedBy')}</th>
                  <th scope="col">
                    <span className="sr-only">{t('void')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sale.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.paidOn, locale)}</td>
                    <td className={p.voidedAt ? 'ops-muted' : undefined}>
                      {p.voidedAt ? <s>{formatPriceLKR(p.amount)}</s> : formatPriceLKR(p.amount)}
                      {p.voidedAt && (
                        <>
                          <br />
                          {t('voided', { who: p.voidedBy ?? '', reason: p.voidReason ?? '' })}
                        </>
                      )}
                    </td>
                    <td>
                      {t(`methods.${p.method}`)}
                      {p.reference ? ` · ${p.reference}` : ''}
                      {p.note && (
                        <>
                          <br />
                          <span className="ops-muted">{p.note}</span>
                        </>
                      )}
                    </td>
                    <td>{p.receivedBy}</td>
                    <td>
                      {!p.voidedAt && (
                        <form action={voidPaymentAction} className="ops-inline-form">
                          {hidden}
                          <input type="hidden" name="paymentId" value={p.id} />
                          <input name="reason" className="input" required minLength={2} maxLength={300} aria-label={t('voidReason')} placeholder={t('voidReason')} />
                          <Button type="submit" size="sm" variant="tertiary">
                            {t('void')}
                          </Button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {active && (
        <form action={updatePlanAction} className="ops-form">
          {hidden}
          <fieldset>
            <legend>{t('changePlan')}</legend>
            <p className="field-message">{t('changePlanNote', { total: formatPriceLKR(sale.total) })}</p>
            <label className="field-label" htmlFor="instalments">
              {t('instalmentCount')}
            </label>
            <select id="instalments" name="instalments" className="input" defaultValue={String(sale.instalments.length)}>
              {Array.from({ length: MAX_INSTALMENTS }, (_, i) => (
                <option key={i} value={i + 1}>
                  {t('instalmentsN', { count: i + 1 })}
                </option>
              ))}
            </select>
            {Array.from({ length: MAX_INSTALMENTS }, (_, i) => {
              const inst = sale.instalments[i];
              return (
                <div key={i} className="ops-form-row">
                  <div className="flex flex-col gap-1">
                    <label className="field-label" htmlFor={`due_${i + 1}`}>
                      {t('dueN', { n: i + 1 })}
                    </label>
                    <input id={`due_${i + 1}`} name={`due_${i + 1}`} type="date" className="input" defaultValue={inst ? dayOf(inst.dueDate) : addMonths(dayOf(sale.soldOn), i)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="field-label" htmlFor={`amount_${i + 1}`}>
                      {t('amountN', { n: i + 1 })}
                    </label>
                    <input id={`amount_${i + 1}`} name={`amount_${i + 1}`} type="number" min={1} step={1} className="input ops-number-input" defaultValue={inst?.amount} placeholder={t('auto')} />
                  </div>
                </div>
              );
            })}
          </fieldset>
          <div>
            <Button type="submit" variant="secondary">
              {t('savePlan')}
            </Button>
          </div>
        </form>
      )}

      {active && (
        <form action={cancelOfficeSaleAction} className="ops-form">
          {hidden}
          <fieldset className="ops-danger-zone">
            <legend>{t('cancelSale')}</legend>
            <p className="field-message">{t('cancelNote')}</p>
            <label className="field-label" htmlFor="cancelReason">
              {t('cancelReason')}
            </label>
            <input id="cancelReason" name="reason" className="input" required minLength={2} maxLength={300} />
            <label className="ops-inline-form field-message">
              <input type="checkbox" name="confirm" required />
              {t('cancelConfirm')}
            </label>
          </fieldset>
          <div>
            <Button type="submit" variant="tertiary">
              {t('cancelSale')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
