import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CheckoutClient } from './CheckoutClient';
import { COD_FEE, DISTRICT_IDS } from '@/lib/commerce/delivery';
import { formatAmount } from '@/lib/pricing/format';

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('commerce.checkout');
  const tCart = await getTranslations('commerce.cart');
  const tSummary = await getTranslations('commerce.summary');
  const tDelivery = await getTranslations('commerce.delivery');
  const tPayment = await getTranslations('commerce.payment');
  const tUnstitched = await getTranslations('commerce.unstitched');
  const tJacket = await getTranslations('product.jacket');
  const tEmpty = await getTranslations('feedback.emptyState');
  const tDistricts = await getTranslations('districts');

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
          districtOptions={DISTRICT_IDS.map((id) => ({ value: id, label: tDistricts(id) })).sort((a, b) =>
            a.label.localeCompare(b.label, locale),
          )}
          eventDateLabel={t('eventDateLabel')}
          eventDateNote={t('eventDateNote')}
          dispatchCutoffLabel={tDelivery('dispatchCutoff')}
          paymentOptions={[
            // Bank transfer first: first-class, never hidden (docs/1-ux.md §3.4).
            // LankaQR and card appear once a payment gateway is contracted
            // (docs/4-architecture.md §3.4).
            { value: 'bank_transfer', label: tPayment('bankTransfer'), detail: tPayment('bankTransferDetail') },
            { value: 'cod', label: tPayment('cod'), detail: tPayment('codDetail', { fee: formatAmount(COD_FEE) }) },
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
