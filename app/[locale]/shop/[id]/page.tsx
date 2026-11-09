import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { Divider } from '@/components/primitives/Divider';
import { ProductGallery, type GalleryAsset } from '@/components/product/ProductGallery';
import { FabricBlock } from '@/components/product/FabricBlock';
import { JacketBlock } from '@/components/product/JacketBlock';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { StockState } from '@/components/product/StockState';
import { ProductCard } from '@/components/product/ProductCard';
import { ReviewList } from '@/components/reviews/ReviewList';
import { listingReviews } from '@/lib/reviews/reviews';
import { Accordion } from '@/components/layout/Accordion';
import { AddToCartFlow } from '@/components/commerce/AddToCartFlow';
import { getCuratedListing, getCuratedListings } from '@/lib/catalogue/queries';
import { PLACEHOLDER_IMAGE } from '@/lib/catalogue/types';
import { FEATURES } from '@/lib/features';

// Rendered per request: price and stock are live (docs/4-architecture.md §3.3).
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  // Parallel, not sequential: each read is a round trip to the database.
  const [product, others, reviewData] = await Promise.all([
    getCuratedListing(id),
    getCuratedListings({ limit: 4 }),
    listingReviews(id),
  ]);
  if (!product) notFound();

  const [tFabric, tOpacity, tJacket, tStock, tGallery, tPdp, tCart, tSlideover, tAccordion] =
    await Promise.all([
      getTranslations('product.fabric'),
      getTranslations('product.opacity'),
      getTranslations('product.jacket'),
      getTranslations('product.stock'),
      getTranslations('product.gallery'),
      getTranslations('pdp'),
      getTranslations('commerce.cart'),
      getTranslations('layout.slideover'),
      getTranslations('layout.accordion'),
    ]);

  const opacityLabel = { opaque: tOpacity('opaque'), 'semi-sheer': tOpacity('semiSheer'), sheer: tOpacity('sheer') }[
    product.opacity
  ];
  const materialLabel = product.material === 'plain' ? tFabric('materialPlain') : tFabric('materialSuper');

  const related = others.filter((p) => p.id !== product.id).slice(0, 3);

  // Real photographs once uploaded (§3.7): gallery in staff order, then the
  // unretouched reference frame. Until then, one honest placeholder.
  const photos: GalleryAsset[] = product.gallery.map((src, i) => ({
    type: 'image',
    src,
    alt: tGallery('photoAlt', { name: product.name, n: i + 1 }),
  }));
  if (product.referenceFrameUrl) {
    photos.push({ type: 'image', src: product.referenceFrameUrl, alt: tGallery('referenceAlt', { name: product.name }), isReferenceFrame: true });
  }
  const galleryAssets: GalleryAsset[] =
    photos.length > 0 ? photos : [{ type: 'image', src: PLACEHOLDER_IMAGE, alt: tGallery('placeholderAlt', { name: product.name }) }];

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="lg:flex-1">
            <ProductGallery
              referenceFrameLabel={tGallery('referenceFrame')}
              assets={galleryAssets}
            />
          </div>

          <div className="flex flex-col gap-4 lg:w-[380px]">
            <h1 className="checkout-step-title">{product.name}</h1>
            <p className="product-card-material">{materialLabel}</p>
            <StockState
              state={product.stockState}
              quantity={product.quantity}
              outOfStockLabel={tStock('outOfStock')}
              lowStockLabel={tStock('lowStock')}
              formatLeft={(count) => tStock('left', { count })}
            />
            <PriceDisplay amount={product.price} />

            <JacketBlock
              materialName={product.jacketMaterialName}
              swatchHex={product.jacketSwatchHex}
              pieceLengthLabel={tJacket('pieceLength', { metres: product.jacketPieceLengthMetres })}
              shipsUnstitchedLabel={tJacket('shipsUnstitched')}
            />

            <AddToCartFlow
              disabled={product.stockState === 'out'}
              item={{
                ref: { kind: 'listing', listingId: product.id },
                designName: product.name,
                materialLabel,
                sareeColourName: product.colourName,
                jacketMaterialName: product.jacketMaterialName,
                jacketColourName: product.jacketColourName,
                drapeLabel: 'Saree',
                unitPrice: product.price,
                quantity: 1,
                thumbnail: { src: product.imageUrl, alt: product.name },
                unstitched: true,
              }}
              addToCartLabel={tPdp('addToCart')}
              addedTitle={tSlideover('addedTitle')}
              closeLabel={tSlideover('close')}
              viewCartLabel={tPdp('viewCart')}
              keepShoppingLabel={tPdp('keepShopping')}
              editLabel={tCart('editDesign')}
              removeLabel={tCart('remove')}
              decreaseQuantityLabel={tCart('decreaseQuantity')}
              increaseQuantityLabel={tCart('increaseQuantity')}
              unstitchedLabel={tJacket('shipsUnstitched')}
            />

            {FEATURES.designYourOwn && (
              <Link href="/design-your-own" className="btn focus-ring btn-secondary btn-lg">
                {tPdp('customiseThis')}
              </Link>
            )}
            <button type="button" className="btn focus-ring btn-tertiary btn-md">
              {tPdp('sendSwatches')}
            </button>

            {product.stockState === 'out' && <p className="field-message-error">{tPdp('outOfStockLabel')}</p>}
          </div>
        </div>

        <Divider />

        <Accordion
          items={[
            {
              id: 'fabric',
              title: tFabric('material'),
              content: (
                <FabricBlock
                  materialLabel={tFabric('material')}
                  materialValue={materialLabel}
                  weightLabel={tFabric('weight')}
                  weightValue={tFabric('weightValue', { gsm: product.gsm })}
                  lengthLabel={tFabric('length')}
                  lengthValue={tFabric('lengthValue', { metres: product.lengthMetres })}
                  opacityLabel={tFabric('opacity')}
                  opacity={product.opacity}
                  opacityValueLabel={opacityLabel}
                />
              ),
            },
            {
              id: 'delivery',
              title: tPdp('deliveryHeading'),
              content: <p className="field-message">{tAccordion('shippingContent')}</p>,
            },
            {
              id: 'promises',
              title: tPdp('colourPromiseHeading'),
              content: (
                <div className="flex flex-col gap-3">
                  <p className="field-message">{tPdp('colourPromiseBody')}</p>
                  <p className="field-message">{tAccordion('returnsContent')}</p>
                </div>
              ),
            },
            {
              id: 'care',
              title: tAccordion('care'),
              content: <p className="field-message">{tAccordion('careContent')}</p>,
            },
            {
              id: 'reviews',
              title:
                reviewData.summary.count > 0 && reviewData.summary.average !== null
                  ? tPdp('reviewsHeadingSummary', { count: reviewData.summary.count, average: reviewData.summary.average.toFixed(1) })
                  : tPdp('reviewsHeading'),
              content:
                reviewData.reviews.length > 0 ? (
                  <ReviewList reviews={reviewData.reviews} />
                ) : (
                  <div className="home-proof-placeholder">
                    <p>{tPdp('reviewsNone')}</p>
                  </div>
                ),
            },
          ]}
        />

        <Divider />

        <div>
          <SectionMarker />
          <h2 className="home-section-title">{tPdp('relatedHeading')}</h2>
          <div className="home-arrivals-grid" style={{ marginTop: 'var(--space-5)' }}>
            {related.map((item) => (
              <ProductCard
                key={item.id}
                href={`/shop/${item.id}`}
                image={{ src: item.imageUrl, alt: item.name }}
                name={item.name}
                materialLabel={item.material === 'plain' ? tFabric('materialPlain') : tFabric('materialSuper')}
                price={item.price}
                jacketMaterialName={item.jacketMaterialName}
                jacketSwatchHex={item.jacketSwatchHex}
                stockState={item.stockState}
                quantity={item.quantity}
                outOfStockLabel={tStock('outOfStock')}
                lowStockLabel={tStock('lowStock')}
                formatLeft={(count) => tStock('left', { count })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
