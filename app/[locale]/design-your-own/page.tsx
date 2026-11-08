import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getConfiguratorCatalogue } from '@/lib/catalogue/queries';
import { CONFIGURATOR_MODEL_URL } from '@/lib/configurator/model';
import { DesignYourOwnClient, type InitialSelection } from './DesignYourOwnClient';

/**
 * Path B (docs/1-ux.md Flow B). The preview is a 3D model drawn in the
 * browser (docs/4-architecture.md §5.0). Opens pre-loaded (UX-C1), never an
 * empty canvas: on a stocked combination, or on the one a shared link names
 * (?d=design&m=material&c=colour&j=jacket&dr=drape, UX-C12).
 */
export default async function DesignYourOwnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const one = (key: string) => (typeof query[key] === 'string' ? (query[key] as string).slice(0, 100) : undefined);
  const initial: InitialSelection = {
    designId: one('d'),
    material: one('m') === 'super' ? 'super' : one('m') === 'plain' ? 'plain' : undefined,
    colourName: one('c'),
    jacketId: one('j'),
    drape: one('dr') === 'osariya' ? 'osariya' : one('dr') === 'saree' ? 'saree' : undefined,
  };
  setRequestLocale(locale);
  // Designs, jackets and every price come from the database, resolved on
  // the server (docs/4-architecture.md §3.3, §7.1).
  const catalogue = await getConfiguratorCatalogue();
  if (catalogue.designs.length === 0 || catalogue.jackets.length === 0) notFound();
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
          catalogue={catalogue}
          initial={initial}
          modelUrl={CONFIGURATOR_MODEL_URL}
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
