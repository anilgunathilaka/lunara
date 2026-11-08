import { getLocale, getTranslations } from 'next-intl/server';
import { CartSummary, type CartSummaryRow } from '@/components/commerce/CartSummary';
import { OrderTimeline } from '@/components/commerce/OrderTimeline';
import { BANK_TRANSFER } from '@/lib/commerce/business';
import { isDistrictId } from '@/lib/commerce/delivery';
import type { GuestOrder } from '@/lib/commerce/orders';
import { trackingFor } from '@/lib/commerce/tracking';
import { formatDateTime } from '@/lib/format/date';
import { formatPriceLKR } from '@/lib/pricing/format';

/**
 * One order as the customer sees it: status, progress, delivery, payment
 * instructions and items. Shared by the guest order page and the account
 * (docs/4-architecture.md §3.6), so the two can never show different facts.
 */
export async function OrderRecord({ order }: { order: GuestOrder }) {
  const locale = await getLocale();
  const [t, tCheckout, tSummary, tStatus, tPayment, tDistricts, tDelivery, tTracking] = await Promise.all([
    getTranslations('commerce.confirmed'),
    getTranslations('commerce.checkout'),
    getTranslations('commerce.summary'),
    getTranslations('commerce.orderStatus'),
    getTranslations('commerce.payment'),
    getTranslations('districts'),
    getTranslations('commerce.delivery'),
    getTranslations('commerce.tracking'),
  ]);

  const total = formatPriceLKR(order.total);
  const rows: CartSummaryRow[] = [
    { label: tSummary('subtotal'), amount: order.subtotal },
    { label: tSummary('deliveryFee'), amount: order.deliveryFee },
    ...(order.codFee > 0 ? [{ label: tSummary('codFee'), amount: order.codFee }] : []),
  ];
  const districtName = isDistrictId(order.district) ? tDistricts(order.district) : order.district;
  const tracking = trackingFor(order.status, order.events);
  const awaitingPayment = order.status === 'payment_pending';

  return (
    <>
      <dl className="spec-list">
        <div className="spec-row">
          <dt className="spec-row-term">{tCheckout('confirmedOrderNumberLabel')}</dt>
          <dd>
            <strong>{order.number}</strong>
          </dd>
        </div>
        <div className="spec-row">
          <dt className="spec-row-term">{t('statusLabel')}</dt>
          <dd>{tStatus(order.status)}</dd>
        </div>
        <div className="spec-row">
          <dt className="spec-row-term">{t('paymentLabel')}</dt>
          <dd>{order.paymentMethod === 'cod' ? tPayment('cod') : tPayment('bankTransfer')}</dd>
        </div>
        <div className="spec-row">
          <dt className="spec-row-term">{t('deliverToLabel')}</dt>
          <dd>
            {order.customerName}, {order.addressLine}, {districtName}
          </dd>
        </div>
        <div className="spec-row">
          <dt className="spec-row-term">{t('estimateLabel')}</dt>
          <dd>{tDelivery('estimateDays', { min: order.estimateMinDays, max: order.estimateMaxDays })}</dd>
        </div>
        {order.courier && order.trackingNumber && (
          <div className="spec-row">
            <dt className="spec-row-term">{tTracking('courierLabel')}</dt>
            <dd>
              {order.courier} · <strong>{order.trackingNumber}</strong>
            </dd>
          </div>
        )}
      </dl>

      <section className="flex flex-col gap-3" aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="checkout-step-title">
          {tTracking('heading')}
        </h2>
        <OrderTimeline
          label={tTracking('heading')}
          steps={tracking.steps.map((step) => ({
            ...step,
            label: step.key === 'placed' && awaitingPayment ? tTracking('steps.placedAwaitingPayment') : tTracking(`steps.${step.key}`),
            time: step.at ? formatDateTime(step.at, locale) : null,
          }))}
          cancelledNote={
            tracking.cancelledAt ? tTracking('cancelled', { date: formatDateTime(tracking.cancelledAt, locale) }) : undefined
          }
        />
      </section>

      {order.paymentMethod === 'bank_transfer' && awaitingPayment && (
        <section className="flex flex-col gap-3" aria-labelledby="bank-heading">
          <h2 id="bank-heading" className="checkout-step-title">
            {t('bankHeading')}
          </h2>
          {BANK_TRANSFER.isPlaceholder ? (
            // Placeholder details must never take a real payment.
            <p className="field-message-error" role="alert">
              {t('bankPlaceholderWarning')}
            </p>
          ) : (
            <>
              <p className="field-message">{t('bankBody', { total, number: order.number })}</p>
              <dl className="spec-list">
                <div className="spec-row">
                  <dt className="spec-row-term">{t('bankName')}</dt>
                  <dd>{BANK_TRANSFER.bankName}</dd>
                </div>
                <div className="spec-row">
                  <dt className="spec-row-term">{t('branch')}</dt>
                  <dd>{BANK_TRANSFER.branch}</dd>
                </div>
                <div className="spec-row">
                  <dt className="spec-row-term">{t('accountName')}</dt>
                  <dd>{BANK_TRANSFER.accountName}</dd>
                </div>
                <div className="spec-row">
                  <dt className="spec-row-term">{t('accountNumber')}</dt>
                  <dd>{BANK_TRANSFER.accountNumber}</dd>
                </div>
              </dl>
            </>
          )}
        </section>
      )}

      {order.paymentMethod === 'cod' && !['delivered', 'cancelled'].includes(order.status) && (
        <p className="field-message">{t('codNote', { total })}</p>
      )}

      <section className="flex flex-col gap-3" aria-labelledby="items-heading">
        <h2 id="items-heading" className="checkout-step-title">
          {t('itemsHeading')}
        </h2>
        <ul className="flex flex-col gap-2">
          {order.lines.map((line) => (
            <li key={line.id} className="cart-summary-row">
              <span className="spec-row-term">
                {line.title}
                {line.materialName ? ` · ${line.materialName}` : ''}
                {line.sareeColourName ? ` · ${line.sareeColourName}` : ''} — {line.jacketMaterialName} ·{' '}
                {line.jacketColourName} · {t('quantity', { count: line.quantity })}
              </span>
              <span>{formatPriceLKR(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <CartSummary rows={rows} totalLabel={tSummary('total')} total={order.total} />
      </section>

      <p className="jacket-block-unstitched">{tCheckout('confirmedUnstitchedReminder')}</p>
    </>
  );
}
