'use client';

import { useState } from 'react';
import { CheckoutStep } from '@/components/commerce/CheckoutStep';
import { PaymentMethod, type PaymentMethodValue } from '@/components/commerce/PaymentMethod';
import { DeliveryEstimate } from '@/components/commerce/DeliveryEstimate';
import { UnstitchedReminder } from '@/components/commerce/UnstitchedReminder';
import { Button } from '@/components/primitives/Button';

export interface CheckoutQaClientProps {
  stepIndicatorLabel: string;
  backLabel: string;
  paymentTitle: string;
  reviewTitle: string;
  paymentOptions: { value: PaymentMethodValue; label: string; detail?: string }[];
  deliveryEstimateRangeLabel: string;
  dispatchCutoffLabel: string;
  deliveryFeeLabel: string;
  unstitchedMessage: string;
  unstitchedAcknowledgeLabel: string;
  placeOrderLabel: string;
}

/**
 * Client half of the checkout QA page — isolated so the page itself can
 * stay a server component for next-intl's getTranslations. Demonstrates
 * that "Place order" stays disabled until the unstitched reminder is
 * explicitly acknowledged, never pre-checked (docs/3-components.md §5.2).
 */
export function CheckoutQaClient({
  stepIndicatorLabel,
  backLabel,
  paymentTitle,
  reviewTitle,
  paymentOptions,
  deliveryEstimateRangeLabel,
  dispatchCutoffLabel,
  deliveryFeeLabel,
  unstitchedMessage,
  unstitchedAcknowledgeLabel,
  placeOrderLabel,
}: CheckoutQaClientProps) {
  const [payment, setPayment] = useState<PaymentMethodValue>('bank_transfer');
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="flex flex-col gap-10">
      <CheckoutStep stepIndicatorLabel={stepIndicatorLabel} title={paymentTitle}>
        <PaymentMethod
          name="payment-qa"
          options={paymentOptions}
          value={payment}
          onChange={setPayment}
        />
        <DeliveryEstimate
          estimateRangeLabel={deliveryEstimateRangeLabel}
          dispatchCutoffLabel={dispatchCutoffLabel}
          feeLabel={deliveryFeeLabel}
          fee={450}
        />
      </CheckoutStep>

      <CheckoutStep
        stepIndicatorLabel={stepIndicatorLabel}
        title={reviewTitle}
        onBack={() => {}}
        backLabel={backLabel}
      >
        <UnstitchedReminder
          variant="checkout"
          message={unstitchedMessage}
          acknowledged={acknowledged}
          onAcknowledge={setAcknowledged}
          acknowledgeLabel={unstitchedAcknowledgeLabel}
        />
        <Button disabled={!acknowledged} fullWidth>
          {placeOrderLabel}
        </Button>
      </CheckoutStep>
    </div>
  );
}
