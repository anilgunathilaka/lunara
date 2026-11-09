'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { CheckoutStep } from '@/components/commerce/CheckoutStep';
import { CartLine } from '@/components/commerce/CartLine';
import { CartSummary, type CartSummaryRow } from '@/components/commerce/CartSummary';
import { PaymentMethod, type PaymentMethodValue, type PaymentMethodOption } from '@/components/commerce/PaymentMethod';
import { DeliveryEstimate } from '@/components/commerce/DeliveryEstimate';
import { UnstitchedReminder } from '@/components/commerce/UnstitchedReminder';
import { Input } from '@/components/primitives/Input';
import { Select, type SelectOption } from '@/components/primitives/Select';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useCart, type CartLineItem } from '@/lib/cart/CartContext';
import { useCartQuote } from '@/lib/cart/useCartQuote';
import { placeOrderAction } from '@/lib/commerce/actions';
import { customerDetailsSchema, normaliseSriLankanMobile, type OfferedPaymentMethod } from '@/lib/commerce/cart-ref';
import { DELIVERY_FEE_RANGE } from '@/lib/commerce/delivery';
import { whatsappLink } from '@/lib/commerce/business';
import { formatAmount, formatPriceLKR } from '@/lib/pricing/format';
import type { QuotedLine } from '@/lib/commerce/quote';
import { FEATURES } from '@/lib/features';

const TOTAL_STEPS = 5;

export interface CheckoutClientProps {
  backLabel: string;
  continueLabel: string;
  cartTitle: string;
  detailsTitle: string;
  deliveryTitle: string;
  paymentTitle: string;
  reviewTitle: string;
  editLabel: string;
  removeLabel: string;
  decreaseQuantityLabel: string;
  increaseQuantityLabel: string;
  unstitchedLabel: string;
  subtotalLabel: string;
  deliveryFeeLabel: string;
  codFeeLabel: string;
  codWaivedLabel: string;
  totalLabel: string;
  nameLabel: string;
  phoneLabel: string;
  addressLabel: string;
  districtLabel: string;
  districtPlaceholder: string;
  districtOptions: SelectOption[];
  eventDateLabel: string;
  eventDateNote: string;
  dispatchCutoffLabel: string;
  paymentOptions: PaymentMethodOption[];
  unstitchedCheckoutMessage: string;
  unstitchedAcknowledgeLabel: string;
  placeOrderLabel: string;
  emptyMessage: string;
  shopCuratedLabel: string;
  designYourOwnLabel: string;
}

type CheckoutError = 'network' | 'invalid' | 'changed' | 'unavailable' | null;

/** Inline, beside the line — never a toast (CLAUDE.md: attribute every price change). */
function LineNotice({ item, quoted }: { item: CartLineItem; quoted: QuotedLine | undefined }) {
  const t = useTranslations('commerce.quote');
  if (!quoted) return null;
  if (quoted.status === 'unavailable') return <p className="field-message-error" role="status">{t('unavailable')}</p>;
  return (
    <>
      {quoted.status === 'insufficient' && (
        <p className="field-message-error" role="status">
          {t('insufficient', { count: quoted.available ?? 0 })}
        </p>
      )}
      {quoted.unitPrice !== undefined && quoted.unitPrice !== item.unitPrice && (
        <p className="price-attribution" role="status">
          {t('priceChanged', { old: formatPriceLKR(item.unitPrice) })}
        </p>
      )}
    </>
  );
}

export function CheckoutClient(props: CheckoutClientProps) {
  const { items, hydrated, setQuantity, removeItem, clear } = useCart();
  const router = useRouter();
  const locale = useLocale() as 'en' | 'si' | 'ta';
  const t = useTranslations('commerce.checkout');
  const tQuote = useTranslations('commerce.quote');
  const tDelivery = useTranslations('commerce.delivery');
  const stepIndicatorLabel = (current: number) => t('stepIndicator', { current, total: TOTAL_STEPS });

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [payment, setPayment] = useState<OfferedPaymentMethod>('bank_transfer');
  const [acknowledged, setAcknowledged] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<CheckoutError>(null);

  const { quote, setQuote, loading, failed, refresh, lineFor } = useCartQuote(items, {
    district: district || undefined,
    paymentMethod: payment,
    enabled: hydrated,
  });

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <EmptyState
        message={props.emptyMessage}
        actions={
          FEATURES.designYourOwn
            ? [
                { href: '/shop', label: props.shopCuratedLabel },
                { href: '/design-your-own', label: props.designYourOwnLabel },
              ]
            : [{ href: '/shop', label: props.shopCuratedLabel }]
        }
      />
    );
  }

  const details = { name, phone, email, address, district, eventDate };
  const detailsValid = customerDetailsSchema.safeParse(details).success;
  const phoneInvalid = phone.trim().length > 0 && normaliseSriLankanMobile(phone) === null;
  const orderable = Boolean(quote?.orderable) && !loading;

  const summaryRows: CartSummaryRow[] = quote
    ? [
        { label: props.subtotalLabel, amount: quote.subtotal },
        ...(quote.deliveryFee !== null ? [{ label: props.deliveryFeeLabel, amount: quote.deliveryFee }] : []),
        ...(quote.codFee > 0 ? [{ label: props.codFeeLabel, amount: quote.codFee, note: props.codWaivedLabel }] : []),
      ]
    : [];

  const quoteStatus = loading ? (
    <p className="field-message" role="status">{tQuote('loading')}</p>
  ) : failed ? (
    <div className="flex flex-col gap-2" role="alert">
      <p className="field-message-error">{tQuote('failed')}</p>
      <Button variant="secondary" onClick={() => void refresh()}>
        {t('retry')}
      </Button>
    </div>
  ) : null;

  function whatsappFallbackHref(): string {
    const lines = items.map((i) => `• ${i.designName} — ${i.materialLabel} × ${i.quantity}`);
    return whatsappLink([t('whatsappOrderIntro'), ...lines, `${name}, ${phone}`, `${address}, ${district}`].join('\n'));
  }

  async function handlePlaceOrder() {
    if (!quote) return;
    setPlacing(true);
    setError(null);
    try {
      const result = await placeOrderAction({
        lines: items.map((i) => ({ key: i.id, ref: i.ref, quantity: i.quantity })),
        details,
        paymentMethod: payment,
        unstitchedAcknowledged: acknowledged,
        expectedTotal: quote.total,
        locale,
      });
      if (result.ok) {
        clear();
        router.push(`/checkout/confirmed?order=${result.number}&t=${encodeURIComponent(result.token)}`);
        return;
      }
      if (result.reason === 'invalid') {
        setError('invalid');
        setStep(2);
      } else if (result.reason === 'changed') {
        setQuote(result.quote);
        setError('changed');
      } else {
        setQuote(result.quote);
        setError('unavailable');
        setStep(1);
      }
    } catch {
      // Network or server failure: keep every field, offer retry and WhatsApp (docs/1-ux.md).
      setError('network');
    } finally {
      setPlacing(false);
    }
  }

  const errorBanner =
    error === 'invalid' ? (
      <p className="field-message-error" role="alert">{t('invalidDetails')}</p>
    ) : error === 'unavailable' ? (
      <p className="field-message-error" role="alert">{t('fixCart')}</p>
    ) : null;

  return (
    <div className="flex flex-col gap-10">
      {step === 1 && (
        <CheckoutStep stepIndicatorLabel={stepIndicatorLabel(1)} title={props.cartTitle}>
          {errorBanner}
          <div>
            {items.map((item) => {
              const quoted = lineFor(item.id);
              return (
                <div key={item.id}>
                  <CartLine
                    thumbnail={item.thumbnail}
                    designName={item.designName}
                    materialLabel={item.materialLabel}
                    sareeColourName={item.sareeColourName}
                    jacketMaterialName={item.jacketMaterialName}
                    jacketColourName={item.jacketColourName}
                    drapeLabel={item.drapeLabel}
                    unitPrice={quoted?.unitPrice ?? item.unitPrice}
                    quantity={item.quantity}
                    onQuantityChange={(quantity) => setQuantity(item.id, quantity)}
                    onRemove={() => removeItem(item.id)}
                    editLabel={props.editLabel}
                    removeLabel={props.removeLabel}
                    decreaseQuantityLabel={props.decreaseQuantityLabel}
                    increaseQuantityLabel={props.increaseQuantityLabel}
                    unstitchedLabel={props.unstitchedLabel}
                  />
                  <LineNotice item={item} quoted={quoted} />
                </div>
              );
            })}
          </div>
          {/* Delivery is shown HERE, not later (docs/1-ux.md §3.4): a range until the district is known. */}
          <p className="field-message">
            {props.deliveryFeeLabel}:{' '}
            {tDelivery('feeRange', { min: formatAmount(DELIVERY_FEE_RANGE.min), max: formatAmount(DELIVERY_FEE_RANGE.max) })}
          </p>
          {quote && <CartSummary rows={[]} totalLabel={props.subtotalLabel} total={quote.subtotal} />}
          {quoteStatus}
          <Button fullWidth disabled={!orderable} onClick={() => setStep(2)}>
            {props.continueLabel}
          </Button>
        </CheckoutStep>
      )}

      {step === 2 && (
        <CheckoutStep
          stepIndicatorLabel={stepIndicatorLabel(2)}
          title={props.detailsTitle}
          onBack={() => setStep(1)}
          backLabel={props.backLabel}
        >
          {errorBanner}
          <Input label={props.nameLabel} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <Input
            label={props.phoneLabel}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t('phoneHint')}
            error={phoneInvalid ? t('phoneInvalid') : undefined}
          />
          <Input
            label={t('emailLabel')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
          />
          <Input
            label={props.addressLabel}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoComplete="street-address"
          />
          <Select
            label={props.districtLabel}
            placeholder={props.districtPlaceholder}
            options={props.districtOptions}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
          <div className="field">
            <label htmlFor="event-date" className="field-label">
              {props.eventDateLabel}
            </label>
            <input
              id="event-date"
              type="date"
              className="input"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
            <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
              {props.eventDateNote}
            </p>
          </div>
          <Button fullWidth disabled={!detailsValid} onClick={() => setStep(3)}>
            {props.continueLabel}
          </Button>
        </CheckoutStep>
      )}

      {step === 3 && (
        <CheckoutStep
          stepIndicatorLabel={stepIndicatorLabel(3)}
          title={props.deliveryTitle}
          onBack={() => setStep(2)}
          backLabel={props.backLabel}
        >
          {quote?.estimate && quote.deliveryFee !== null ? (
            <DeliveryEstimate
              estimateRangeLabel={tDelivery('estimateDays', { min: quote.estimate.minDays, max: quote.estimate.maxDays })}
              dispatchCutoffLabel={props.dispatchCutoffLabel}
              feeLabel={props.deliveryFeeLabel}
              fee={quote.deliveryFee}
            />
          ) : (
            <p className="field-message">{tDelivery('chooseDistrict')}</p>
          )}
          {quoteStatus}
          <Button fullWidth disabled={!orderable || quote?.deliveryFee === null} onClick={() => setStep(4)}>
            {props.continueLabel}
          </Button>
        </CheckoutStep>
      )}

      {step === 4 && (
        <CheckoutStep
          stepIndicatorLabel={stepIndicatorLabel(4)}
          title={props.paymentTitle}
          onBack={() => setStep(3)}
          backLabel={props.backLabel}
        >
          <PaymentMethod
            name="checkout-payment"
            options={props.paymentOptions}
            value={payment}
            onChange={(value: PaymentMethodValue) => {
              if (value === 'cod' || value === 'bank_transfer') setPayment(value);
            }}
          />
          {quote && <CartSummary rows={summaryRows} totalLabel={props.totalLabel} total={quote.total} />}
          {quoteStatus}
          <Button fullWidth disabled={!orderable} onClick={() => setStep(5)}>
            {props.continueLabel}
          </Button>
        </CheckoutStep>
      )}

      {step === 5 && (
        <CheckoutStep
          stepIndicatorLabel={stepIndicatorLabel(5)}
          title={props.reviewTitle}
          onBack={() => setStep(4)}
          backLabel={props.backLabel}
        >
          {error === 'changed' && (
            <p className="field-message-error" role="alert">
              {tQuote('totalChanged')}
            </p>
          )}
          {items.map((item) => (
            <LineNotice key={item.id} item={item} quoted={lineFor(item.id)} />
          ))}
          {quote && <CartSummary rows={summaryRows} totalLabel={props.totalLabel} total={quote.total} />}
          {quoteStatus}
          <UnstitchedReminder
            variant="checkout"
            message={props.unstitchedCheckoutMessage}
            acknowledged={acknowledged}
            onAcknowledge={setAcknowledged}
            acknowledgeLabel={props.unstitchedAcknowledgeLabel}
          />
          {error === 'network' && (
            <div className="flex flex-col gap-3" role="alert">
              <p className="field-message-error">{t('networkError')}</p>
              <a
                href={whatsappFallbackHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn focus-ring btn-secondary btn-md"
              >
                {t('sendOnWhatsApp')}
              </a>
            </div>
          )}
          <Button
            fullWidth
            disabled={!acknowledged || !orderable || placing}
            loading={placing}
            onClick={() => void handlePlaceOrder()}
          >
            {error === 'network' ? t('retry') : props.placeOrderLabel}
          </Button>
        </CheckoutStep>
      )}
    </div>
  );
}
