import { getTranslations } from 'next-intl/server';
import { CheckoutClient } from './CheckoutClient';

const DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Kurunegala',
  'Galle',
  'Matara',
  'Jaffna',
  'Anuradhapura',
  'Ratnapura',
  'Badulla',
] as const;

export default async function CheckoutPage() {
  const t = await getTranslations('commerce.checkout');
  const tCart = await getTranslations('commerce.cart');
  const tSummary = await getTranslations('commerce.summary');
  const tDelivery = await getTranslations('commerce.delivery');
  const tPayment = await getTranslations('commerce.payment');
  const tUnstitched = await getTranslations('commerce.unstitched');
  const tJacket = await getTranslations('product.jacket');
  const tEmpty = await getTranslations('feedback.emptyState');

  return (
    <div className="home-section">
      <div className="home-section-inner" style={{ maxWidth: '640px' }}>
        <CheckoutClient
          backLabel={t('back')}
          continueLabel={t('continue')}
          cartTitle={t('cartTitle')}
          detailsTitle={t('detailsTitle')}
          deliveryTitle={t('deliveryTitle')}
          paymentTitle={t('paymentTitle')}
          reviewTitle={t('reviewTitle')}
          editLabel={tCart('editDesign')}
          removeLabel={tCart('remove')}
          decreaseQuantityLabel={tCart('decreaseQuantity')}
          increaseQuantityLabel={tCart('increaseQuantity')}
          unstitchedLabel={tJacket('shipsUnstitched')}
          subtotalLabel={tSummary('subtotal')}
          deliveryFeeLabel={tSummary('deliveryFee')}
          codFeeLabel={tSummary('codFee')}
          codWaivedLabel={tSummary('codWaived')}
          totalLabel={tSummary('total')}
          nameLabel={t('nameLabel')}
          phoneLabel={t('phoneLabel')}
          addressLabel={t('addressLabel')}
          districtLabel={t('districtLabel')}
          districtPlaceholder={t('districtPlaceholder')}
          districtOptions={DISTRICTS.map((d) => ({ value: d, label: d }))}
          eventDateLabel={t('eventDateLabel')}
          eventDateNote={t('eventDateNote')}
          deliveryEstimateRangeLabel={tDelivery('estimateRange')}
          dispatchCutoffLabel={tDelivery('dispatchCutoff')}
          paymentOptions={[
            { value: 'cod', label: tPayment('cod'), detail: tPayment('codDetail') },
            { value: 'bank_transfer', label: tPayment('bankTransfer'), detail: tPayment('bankTransferDetail') },
            { value: 'lankaqr', label: tPayment('lankaqr'), detail: tPayment('lankaqrDetail') },
            { value: 'card', label: tPayment('card'), detail: tPayment('cardDetail') },
          ]}
          unstitchedCheckoutMessage={tUnstitched('message')}
          unstitchedAcknowledgeLabel={tUnstitched('acknowledge')}
          placeOrderLabel={t('placeOrder')}
          emptyMessage={tEmpty('cartEmpty')}
          shopCuratedLabel={tEmpty('shopCurated')}
          designYourOwnLabel={tEmpty('designYourOwn')}
        />
      </div>
    </div>
  );
}
