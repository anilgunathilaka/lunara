import { getTranslations } from 'next-intl/server';
import { CheckoutQaClient } from './CheckoutQaClient';

/**
 * Internal QA scratch page for CheckoutStep, PaymentMethod,
 * DeliveryEstimate and the checkout variant of UnstitchedReminder
 * (docs/3-components.md §5.2, §5.3). Not part of the shipped product
 * surface — delete or gate behind an env check before launch.
 */
export default async function CheckoutQaPage() {
  const tCheckout = await getTranslations('commerce.checkout');
  const tPayment = await getTranslations('commerce.payment');
  const tDelivery = await getTranslations('commerce.delivery');
  const tUnstitched = await getTranslations('commerce.unstitched');

  return (
    <main className="mx-auto flex max-w-[500px] flex-col gap-4 p-6">
      <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
        Checkout — QA
      </h1>
      <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
        &quot;Place order&quot; stays disabled until the reminder below is explicitly
        acknowledged — it starts unchecked and can&apos;t be pre-checked or skipped.
      </p>

      <CheckoutQaClient
        stepIndicatorLabel={tCheckout('stepIndicator', { current: 4, total: 5 })}
        backLabel={tCheckout('back')}
        paymentTitle={tCheckout('paymentTitle')}
        reviewTitle={tCheckout('reviewTitle')}
        paymentOptions={[
          { value: 'cod', label: tPayment('cod'), detail: tPayment('codDetail') },
          {
            value: 'bank_transfer',
            label: tPayment('bankTransfer'),
            detail: tPayment('bankTransferDetail'),
          },
          { value: 'lankaqr', label: tPayment('lankaqr'), detail: tPayment('lankaqrDetail') },
          { value: 'card', label: tPayment('card'), detail: tPayment('cardDetail') },
        ]}
        deliveryEstimateRangeLabel={tDelivery('estimateRange')}
        dispatchCutoffLabel={tDelivery('dispatchCutoff')}
        deliveryFeeLabel={tDelivery('feeLabel')}
        unstitchedMessage={tUnstitched('message')}
        unstitchedAcknowledgeLabel={tUnstitched('acknowledge')}
        placeOrderLabel={tCheckout('placeOrder')}
      />
    </main>
  );
}
