'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { CheckoutStep } from '@/components/commerce/CheckoutStep';
import { CartLine } from '@/components/commerce/CartLine';
import { CartSummary } from '@/components/commerce/CartSummary';
import { PaymentMethod, type PaymentMethodValue, type PaymentMethodOption } from '@/components/commerce/PaymentMethod';
import { DeliveryEstimate } from '@/components/commerce/DeliveryEstimate';
import { UnstitchedReminder } from '@/components/commerce/UnstitchedReminder';
import { Input } from '@/components/primitives/Input';
import { Select, type SelectOption } from '@/components/primitives/Select';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useCart } from '@/lib/cart/CartContext';

const DELIVERY_FEE = 450;
const COD_FEE = 350;
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
  deliveryEstimateRangeLabel: string;
  dispatchCutoffLabel: string;
  paymentOptions: PaymentMethodOption[];
  unstitchedCheckoutMessage: string;
  unstitchedAcknowledgeLabel: string;
  placeOrderLabel: string;
  emptyMessage: string;
  shopCuratedLabel: string;
  designYourOwnLabel: string;
}

export function CheckoutClient({
  backLabel,
  continueLabel,
  cartTitle,
  detailsTitle,
  deliveryTitle,
  paymentTitle,
  reviewTitle,
  editLabel,
  removeLabel,
  decreaseQuantityLabel,
  increaseQuantityLabel,
  unstitchedLabel,
  subtotalLabel,
  deliveryFeeLabel,
  codFeeLabel,
  codWaivedLabel,
  totalLabel,
  nameLabel,
  phoneLabel,
  addressLabel,
  districtLabel,
  districtPlaceholder,
  districtOptions,
  eventDateLabel,
  eventDateNote,
  deliveryEstimateRangeLabel,
  dispatchCutoffLabel,
  paymentOptions,
  unstitchedCheckoutMessage,
  unstitchedAcknowledgeLabel,
  placeOrderLabel,
  emptyMessage,
  shopCuratedLabel,
  designYourOwnLabel,
}: CheckoutClientProps) {
  const { items, hydrated, subtotal, setQuantity, removeItem, clear } = useCart();
  const router = useRouter();
  const t = useTranslations('commerce.checkout');
  const stepIndicatorLabel = (current: number) => t('stepIndicator', { current, total: TOTAL_STEPS });

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [payment, setPayment] = useState<PaymentMethodValue>('bank_transfer');
  const [acknowledged, setAcknowledged] = useState(false);
  const [placing, setPlacing] = useState(false);

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        actions={[
          { href: '/shop', label: shopCuratedLabel },
          { href: '/design-your-own', label: designYourOwnLabel },
        ]}
      />
    );
  }

  const total = subtotal + DELIVERY_FEE + COD_FEE;
  const detailsValid = name.trim().length > 0 && phone.trim().length >= 9 && address.trim().length > 0 && district.length > 0;

  function handlePlaceOrder() {
    setPlacing(true);
    const orderNumber = `LUN-${Date.now().toString(36).toUpperCase()}`;
    try {
      window.sessionStorage.setItem(
        'lunara.lastOrder',
        JSON.stringify({ orderNumber, total, itemCount: items.length, district }),
      );
    } catch {
      // Session storage unavailable — the confirmation page falls back to a generic message.
    }
    clear();
    router.push('/checkout/confirmed');
  }

  return (
    <div className="flex flex-col gap-10">
      {step === 1 && (
        <CheckoutStep stepIndicatorLabel={stepIndicatorLabel(1)} title={cartTitle}>
          <div>
            {items.map((item) => (
              <CartLine
                key={item.id}
                thumbnail={item.thumbnail}
                designName={item.designName}
                materialLabel={item.materialLabel}
                sareeColourName={item.sareeColourName}
                jacketMaterialName={item.jacketMaterialName}
                jacketColourName={item.jacketColourName}
                drapeLabel={item.drapeLabel}
                unitPrice={item.unitPrice}
                quantity={item.quantity}
                onQuantityChange={(quantity) => setQuantity(item.id, quantity)}
                onRemove={() => removeItem(item.id)}
                editLabel={editLabel}
                removeLabel={removeLabel}
                decreaseQuantityLabel={decreaseQuantityLabel}
                increaseQuantityLabel={increaseQuantityLabel}
                unstitchedLabel={unstitchedLabel}
              />
            ))}
          </div>
          <DeliveryEstimate
            estimateRangeLabel={deliveryEstimateRangeLabel}
            dispatchCutoffLabel={dispatchCutoffLabel}
            feeLabel={deliveryFeeLabel}
            fee={DELIVERY_FEE}
          />
          <CartSummary
            rows={[
              { label: subtotalLabel, amount: subtotal },
              { label: deliveryFeeLabel, amount: DELIVERY_FEE },
              { label: codFeeLabel, amount: COD_FEE, note: codWaivedLabel },
            ]}
            totalLabel={totalLabel}
            total={total}
          />
          <Button fullWidth onClick={() => setStep(2)}>
            {continueLabel}
          </Button>
        </CheckoutStep>
      )}

      {step === 2 && (
        <CheckoutStep stepIndicatorLabel={stepIndicatorLabel(2)} title={detailsTitle} onBack={() => setStep(1)} backLabel={backLabel}>
          <Input label={nameLabel} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <Input label={phoneLabel} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" />
          <Input label={addressLabel} value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" />
          <Select
            label={districtLabel}
            placeholder={districtPlaceholder}
            options={districtOptions}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
          <div className="field">
            <label htmlFor="event-date" className="field-label">
              {eventDateLabel}
            </label>
            <input
              id="event-date"
              type="date"
              className="input"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
            <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
              {eventDateNote}
            </p>
          </div>
          <Button fullWidth disabled={!detailsValid} onClick={() => setStep(3)}>
            {continueLabel}
          </Button>
        </CheckoutStep>
      )}

      {step === 3 && (
        <CheckoutStep stepIndicatorLabel={stepIndicatorLabel(3)} title={deliveryTitle} onBack={() => setStep(2)} backLabel={backLabel}>
          <DeliveryEstimate
            estimateRangeLabel={deliveryEstimateRangeLabel}
            dispatchCutoffLabel={dispatchCutoffLabel}
            feeLabel={deliveryFeeLabel}
            fee={DELIVERY_FEE}
          />
          <Button fullWidth onClick={() => setStep(4)}>
            {continueLabel}
          </Button>
        </CheckoutStep>
      )}

      {step === 4 && (
        <CheckoutStep stepIndicatorLabel={stepIndicatorLabel(4)} title={paymentTitle} onBack={() => setStep(3)} backLabel={backLabel}>
          <PaymentMethod name="checkout-payment" options={paymentOptions} value={payment} onChange={setPayment} />
          <Button fullWidth onClick={() => setStep(5)}>
            {continueLabel}
          </Button>
        </CheckoutStep>
      )}

      {step === 5 && (
        <CheckoutStep stepIndicatorLabel={stepIndicatorLabel(5)} title={reviewTitle} onBack={() => setStep(4)} backLabel={backLabel}>
          <CartSummary
            rows={[
              { label: subtotalLabel, amount: subtotal },
              { label: deliveryFeeLabel, amount: DELIVERY_FEE },
              { label: codFeeLabel, amount: COD_FEE, note: codWaivedLabel },
            ]}
            totalLabel={totalLabel}
            total={total}
          />
          <UnstitchedReminder
            variant="checkout"
            message={unstitchedCheckoutMessage}
            acknowledged={acknowledged}
            onAcknowledge={setAcknowledged}
            acknowledgeLabel={unstitchedAcknowledgeLabel}
          />
          <Button fullWidth disabled={!acknowledged || placing} loading={placing} onClick={handlePlaceOrder}>
            {placeOrderLabel}
          </Button>
        </CheckoutStep>
      )}
    </div>
  );
}
