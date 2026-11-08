import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DesignYourOwnClient } from './DesignYourOwnClient';

/**
 * Path B (docs/1-ux.md Flow B). PreviewCanvas shows a static placeholder
 * regardless of selection — there is no real photography or server-side
 * compositor yet (docs/4-architecture.md §5), same as the /dev/configurator
 * QA page this was adapted from. Opens pre-loaded (UX-C1), never an empty
 * canvas — devDesigns[0]/'plain'/'teal'/first jacket/'saree' is the
 * starting combination.
 */
export default async function DesignYourOwnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tFabric = await getTranslations('product.fabric');
  const tStock = await getTranslations('product.stock');
  const tDrape = await getTranslations('configurator.drape');
  const tRotation = await getTranslations('configurator.rotation');
  const tHonesty = await getTranslations('configurator.honesty');
  const tSuggested = await getTranslations('configurator.suggested');
  const tBar = await getTranslations('configurator.bar');
  const tAxis = await getTranslations('configurator.axisHeadings');
  const tToast = await getTranslations('configurator.toast');
  const tFallback = await getTranslations('feedback.fallback');
  const tSlideover = await getTranslations('layout.slideover');
  const tCart = await getTranslations('commerce.cart');
  const tJacket = await getTranslations('product.jacket');
  const tPdp = await getTranslations('pdp');

  return (
    <div className="home-section">
      <div className="home-section-inner">
        <DesignYourOwnClient
          plainLabel={tFabric('materialPlain')}
          superLabel={tFabric('materialSuper')}
          sareeLabel={tDrape('saree')}
          osariyaLabel={tDrape('osariya')}
          explainerLabel={tDrape('explainer')}
          disabledAnnouncement={tStock('outOfStock')}
          lowStockAnnouncement={tStock('lowStock')}
          rotateLeftLabel={tRotation('left')}
          rotateRightLabel={tRotation('right')}
          honestyNoteText={tHonesty('text')}
          seeSareePhotosLabel={tHonesty('seeSaree')}
          seeJacketPhotosLabel={tHonesty('seeJacket')}
          suggestedHeading={tSuggested('heading')}
          addToCartLabel={tBar('addToCart')}
          saveLabel={tBar('save')}
          shareLabel={tBar('share')}
          requestSwatchesLabel={tBar('requestSwatches')}
          fallbackMessage={tFallback('rendererFailed')}
          designHeading={tAxis('design')}
          materialHeading={tAxis('material')}
          colourHeading={tAxis('colour')}
          jacketHeading={tAxis('jacket')}
          addedTitle={tSlideover('addedTitle')}
          closeLabel={tSlideover('close')}
          viewCartLabel={tPdp('viewCart')}
          keepShoppingLabel={tPdp('keepShopping')}
          editLabel={tCart('editDesign')}
          removeLabel={tCart('remove')}
          decreaseQuantityLabel={tCart('decreaseQuantity')}
          increaseQuantityLabel={tCart('increaseQuantity')}
          unstitchedLabel={tJacket('shipsUnstitched')}
          savedToastMessage={tToast('saved')}
          sharedToastMessage={tToast('shared')}
          swatchesToastMessage={tToast('swatchesRequested')}
        />
      </div>
    </div>
  );
}
