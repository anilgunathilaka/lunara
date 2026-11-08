import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { CartPageClient } from './CartPageClient';

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cartPage');
  const tEmpty = await getTranslations('feedback.emptyState');
  const tCart = await getTranslations('commerce.cart');
  const tSummary = await getTranslations('commerce.summary');
  const tUnstitched = await getTranslations('commerce.unstitched');
  const tJacket = await getTranslations('product.jacket');
  const tToast = await getTranslations('feedback.toast');

  return (
    <div className="home-section">
      <div className="home-section-inner">
        <div className="home-section-header">
          <div>
            <SectionMarker />
            <h1 className="home-section-title">{t('title')}</h1>
          </div>
        </div>

        <CartPageClient
          emptyMessage={tEmpty('cartEmpty')}
          shopCuratedLabel={tEmpty('shopCurated')}
          designYourOwnLabel={tEmpty('designYourOwn')}
          editLabel={tCart('editDesign')}
          removeLabel={tCart('remove')}
          decreaseQuantityLabel={tCart('decreaseQuantity')}
          increaseQuantityLabel={tCart('increaseQuantity')}
          unstitchedInlineMessage={tUnstitched('message')}
          unstitchedLabel={tJacket('shipsUnstitched')}
          subtotalLabel={tSummary('subtotal')}
          deliveryFeeLabel={tSummary('deliveryFee')}
          checkoutLabel={t('checkout')}
          continueShoppingLabel={t('continueShopping')}
          removedToastMessage={tToast('removed')}
          undoLabel={tToast('undo')}
        />
      </div>
    </div>
  );
}
