import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { CartSummary, type CartSummaryRow } from '@/components/commerce/CartSummary';
import { BANK_TRANSFER, whatsappLink } from '@/lib/commerce/business';
import { isDistrictId } from '@/lib/commerce/delivery';
import { getGuestOrder } from '@/lib/commerce/orders';
import { formatPriceLKR } from '@/lib/pricing/format';

// Holds personal details: never indexed, never cached.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Order record for a guest (docs/1-ux.md §3.4 [6]; docs/4-architecture.md
 * §3.4). Reached from checkout with ?order=…&t=…; the token is checked
 * against its stored hash, so the number alone reveals nothing.
 */
export default async function CheckoutConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string | string[]; t?: string | string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const number = typeof query.order === 'string' ? query.order : '';
  const token = typeof query.t === 'string' ? query.t : '';

  const [t, tCheckout, tSummary, tStatus, tPayment, tDistricts, tDelivery] = await Promise.all([
    getTranslations('commerce.confirmed'),
    getTranslations('commerce.checkout'),
    getTranslations('commerce.summary'),
    getTranslations('commerce.orderStatus'),
    getTranslations('commerce.payment'),
    getTranslations('districts'),
    getTranslations('commerce.delivery'),
  ]);

  const order = number && token ? await getGuestOrder(number, token) : null;

  if (!order) {
    return (
      <div className="home-section">
        <div className="home-section-inner flex flex-col gap-4" style={{ maxWidth: '560px' }}>
          <SectionMarker />
          <p className="field-message">{t('notFound')}</p>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn focus-ring btn-secondary btn-md">
            {t('contactWhatsApp')}
          </a>
        </div>
      </div>
    );
  }

  const total = formatPriceLKR(order.total);
  const rows: CartSummaryRow[] = [
    { label: tSummary('subtotal'), amount: order.subtotal },
    { label: tSummary('deliveryFee'), amount: order.deliveryFee },
    ...(order.codFee > 0 ? [{ label: tSummary('codFee'), amount: order.codFee }] : []),
  ];
  const districtName = isDistrictId(order.district) ? tDistricts(order.district) : order.district;

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-5" style={{ maxWidth: '560px' }}>
        <div>
          <SectionMarker />
          <h1 className="home-section-title">
            {order.status === 'payment_pending' ? t('pendingHeading') : tCheckout('confirmedHeading')}
          </h1>
        </div>

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
        </dl>

        {order.paymentMethod === 'bank_transfer' && (
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

        {order.paymentMethod === 'cod' && <p className="field-message">{t('codNote', { total })}</p>}

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

        <p className="field-message">{t('body', { phone: order.phone })}</p>
        <p className="jacket-block-unstitched">{tCheckout('confirmedUnstitchedReminder')}</p>
        <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
          {t('bookmark')}
        </p>
        <Link href="/" className="btn focus-ring btn-primary btn-md" style={{ alignSelf: 'flex-start' }}>
          {tCheckout('backHome')}
        </Link>
      </div>
    </div>
  );
}
