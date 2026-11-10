import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CartSummary } from '@/components/commerce/CartSummary';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { isDistrictId } from '@/lib/commerce/delivery';
import { transitionOrderAction } from '@/lib/ops/actions';
import { getOrderDetail } from '@/lib/ops/queries';
import { requireStaffPage } from '@/lib/ops/staff';
import { ALLOWED_TRANSITIONS, RESTOCK_ON_CANCEL_FROM } from '@/lib/ops/transitions';
import { formatPriceLKR } from '@/lib/pricing/format';
import { OpsFlash, formatDateTime, type OpsSearchParams } from '../../shared';

/** One order: details, lines, history, and only the allowed next steps (§3.5, §7.2). */
export default async function OpsOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; number: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale, number } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/orders/${number}`);
  const order = await getOrderDetail(number);
  if (!order) notFound();

  const [t, tCol, tStep, tStatus, tPayment, tSummary, tDistricts, tDrape, tMessages, tNotify] = await Promise.all([
    getTranslations('ops.order'),
    getTranslations('ops.columns'),
    getTranslations('ops.transition'),
    getTranslations('commerce.orderStatus'),
    getTranslations('commerce.payment'),
    getTranslations('commerce.summary'),
    getTranslations('districts'),
    getTranslations('configurator.drape'),
    getTranslations('ops.messages'),
    getTranslations('ops.notificationStatus'),
  ]);
  const query = await searchParams;
  const nextSteps = ALLOWED_TRANSITIONS[order.status];

  function stepLabel(to: (typeof nextSteps)[number]): string {
    if (to === 'confirmed' && order!.status === 'payment_pending') return tStep('confirmPayment');
    if (to === 'cancelled') return RESTOCK_ON_CANCEL_FROM.has(order!.status) ? tStep('cancelled') : tStep('cancelledLate');
    return tStep(to);
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '720px' }}>
      <Link href="/ops/orders" className="btn focus-ring btn-tertiary btn-sm" style={{ alignSelf: 'flex-start' }}>
        {t('back')}
      </Link>
      <h2 className="checkout-step-title">
        {order.number} · {tStatus(order.status)}
      </h2>
      <OpsFlash searchParams={query} />

      <dl className="spec-list">
        <div className="spec-row">
          <dt className="spec-row-term">{tCol('date')}</dt>
          <dd>{formatDateTime(order.createdAt, locale)}</dd>
        </div>
        <div className="spec-row">
          <dt className="spec-row-term">{tCol('customer')}</dt>
          <dd>{order.customerName}</dd>
        </div>
        <div className="spec-row">
          <dt className="spec-row-term">{tCol('phone')}</dt>
          <dd>
            <a href={`tel:${order.phone}`} className="focus-ring">
              {order.phone}
            </a>
          </dd>
        </div>
        {order.email && (
          <div className="spec-row">
            <dt className="spec-row-term">{t('email')}</dt>
            <dd>{order.email}</dd>
          </div>
        )}
        <div className="spec-row">
          <dt className="spec-row-term">{t('address')}</dt>
          <dd>
            {order.addressLine}, {isDistrictId(order.district) ? tDistricts(order.district) : order.district}
          </dd>
        </div>
        {order.eventDate && (
          <div className="spec-row">
            <dt className="spec-row-term">{t('eventDate')}</dt>
            <dd>{order.eventDate.toISOString().slice(0, 10)}</dd>
          </div>
        )}
        <div className="spec-row">
          <dt className="spec-row-term">{tCol('payment')}</dt>
          <dd>{order.paymentMethod === 'cod' ? tPayment('cod') : tPayment('bankTransfer')}</dd>
        </div>
        <div className="spec-row">
          <dt className="spec-row-term">{t('acknowledged')}</dt>
          <dd>{formatDateTime(order.unstitchedAcknowledgedAt, locale)}</dd>
        </div>
        {order.courier && (
          <div className="spec-row">
            <dt className="spec-row-term">{t('shipment')}</dt>
            <dd>
              {order.courier} · {order.trackingNumber}
            </dd>
          </div>
        )}
      </dl>

      <section className="flex flex-col gap-3" aria-labelledby="lines-heading">
        <h3 id="lines-heading" className="field-label">
          {t('lines')}
        </h3>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <tbody>
              {order.lines.map((line) => (
                <tr key={line.id}>
                  <td>
                    {line.title}
                    {line.materialName ? ` · ${line.materialName}` : ''}
                    {line.sareeColourName ? ` · ${line.sareeColourName}` : ''}
                    <br />
                    {line.jacketMaterialName} · {line.jacketColourName}
                    {line.drape ? ` · ${t('drape', { drape: tDrape(line.drape) })}` : ''}
                  </td>
                  <td>
                    {line.sareeSku ? `${line.sareeSku} + ` : ''}
                    {line.jacketSku}
                  </td>
                  <td>× {line.quantity}</td>
                  <td>{formatPriceLKR(line.unitPrice * line.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CartSummary
          rows={[
            { label: tSummary('subtotal'), amount: order.subtotal },
            { label: tSummary('deliveryFee'), amount: order.deliveryFee },
            ...(order.codFee > 0 ? [{ label: tSummary('codFee'), amount: order.codFee }] : []),
          ]}
          totalLabel={tSummary('total')}
          total={order.total}
        />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="next-heading">
        <h3 id="next-heading" className="field-label">
          {t('nextStep')}
        </h3>
        {nextSteps.length === 0 ? (
          <p className="field-message">{t('noNextStep')}</p>
        ) : (
          nextSteps.map((to) => (
            <form key={to} action={transitionOrderAction} className="flex flex-col gap-3">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="number" value={order.number} />
              <input type="hidden" name="to" value={to} />
              {to === 'dispatched' && (
                <>
                  <Input label={t('courier')} name="courier" required />
                  <Input label={t('tracking')} name="trackingNumber" required />
                </>
              )}
              <Input label={t('note')} name="note" />
              <Button type="submit" variant={to === 'cancelled' ? 'secondary' : 'primary'}>
                {stepLabel(to)}
              </Button>
            </form>
          ))
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="messages-heading">
        <h3 id="messages-heading" className="field-label">
          {tMessages('notificationsHeading')}
        </h3>
        <ol className="spec-list">
          {order.notifications.map((n) => (
            <li key={n.id} className="spec-row">
              <span>
                {n.event} · {n.channel.toUpperCase()} · {tNotify(n.status)}
                {n.sentBy ? ` · ${t('by', { actor: n.sentBy })}` : ''}
              </span>
              <span className="spec-row-term">{formatDateTime(n.sentAt ?? n.dueAt, locale)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="history-heading">
        <h3 id="history-heading" className="field-label">
          {t('history')}
        </h3>
        <ol className="spec-list">
          {order.events.map((event) => (
            <li key={event.id} className="spec-row">
              <span>
                {tStatus(event.status)} · {t('by', { actor: event.actor })}
                {event.note ? ` — ${event.note}` : ''}
              </span>
              <span className="spec-row-term">{formatDateTime(event.createdAt, locale)}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
