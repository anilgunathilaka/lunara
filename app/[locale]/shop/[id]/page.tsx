import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductGallery, type GalleryAsset } from '@/components/product/ProductGallery';
import { FabricBlock } from '@/components/product/FabricBlock';
import { JacketBlock } from '@/components/product/JacketBlock';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { StockState } from '@/components/product/StockState';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductRail } from '@/components/home/ProductRail';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import { listingReviews } from '@/lib/reviews/reviews';
import { Accordion } from '@/components/layout/Accordion';
import { ProductImageGrid } from '@/components/product/ProductImageGrid';
import { StickyBuyBar } from '@/components/product/StickyBuyBar';
import { AddToCartFlow } from '@/components/commerce/AddToCartFlow';
import { getCuratedListing, getCuratedListings } from '@/lib/catalogue/queries';
import { PLACEHOLDER_IMAGE } from '@/lib/catalogue/types';
import { categoryNamer } from '@/lib/catalogue/category-label';
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
    // All listings, in shop order: the related sarees and the previous / next ones.
    getCuratedListings(),
    listingReviews(id),
  ]);
  if (!product) notFound();

  const [tFabric, tOpacity, tJacket, tStock, tGallery, tPdp, tCart, tSlideover, tAccordion, tNav, tRail] =
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
      getTranslations('layout.nav'),
      getTranslations('home.newArrivals'),
    ]);

  const opacityLabel = { opaque: tOpacity('opaque'), 'semi-sheer': tOpacity('semiSheer'), sheer: tOpacity('sheer') }[
    product.opacity
  ];
  const categoryName = await categoryNamer();
  const materialLabel = categoryName(product.categoryId, product.categoryName);

  const related = others.filter((p) => p.id !== product.id).slice(0, 8);
  // Previous and next sarees in shop order, wrapping round (none when this is the only one).
  const at = others.findIndex((p) => p.id === product.id);
  const prev = at >= 0 && others.length > 1 ? others[(at - 1 + others.length) % others.length] : undefined;
  const next = at >= 0 && others.length > 1 ? others[(at + 1) % others.length] : undefined;

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
  // Wide screens show four photographs, two by two (founder decision
  // 2026-11-13): the first four, with the placeholder in any empty places.
  const GRID_SIZE = 4;
  const gridAssets: GalleryAsset[] = [
    ...photos.slice(0, GRID_SIZE),
    ...Array.from({ length: Math.max(0, GRID_SIZE - photos.length) }, (): GalleryAsset => ({
      type: 'image',
      src: PLACEHOLDER_IMAGE,
      alt: tGallery('placeholderAlt', { name: product.name }),
    })),
  ];

  const reviewSummary =
    reviewData.summary.count > 0 && reviewData.summary.average !== null
      ? tPdp('reviewsHeadingSummary', { count: reviewData.summary.count, average: reviewData.summary.average.toFixed(1) })
      : null;

  // Layout after eshandlooms.com (docs/2-ui.md §7.5; founder decision
  // 2026-11-13): breadcrumb and previous / next above; the gallery (unchanged)
  // beside the details; a band of tabs across the page; related sarees under a
  // centred heading; and a bar that slides up with Add to cart once the page's
  // own button has scrolled away.
  return (
    <div className="pdp">
      <div className="pdp-inner">
        <div className="pdp-topline">
          <nav aria-label={tPdp('breadcrumb')}>
            <ol className="pdp-breadcrumb">
              <li>
                <Link href="/">{tPdp('home')}</Link>
              </li>
              <li>
                <Link href="/shop">{tNav('shop')}</Link>
              </li>
              <li aria-current="page">{product.name}</li>
            </ol>
          </nav>
          {prev && next && (
            <div className="pdp-prevnext">
              <Link
                href={`/shop/${prev.id}`}
                className="pdp-prevnext-link focus-ring"
                aria-label={tPdp('previousNamed', { name: prev.name })}
              >
                <ChevronLeft className="icon icon-inline" aria-hidden="true" />
                {tPdp('previous')}
              </Link>
              <Link
                href={`/shop/${next.id}`}
                className="pdp-prevnext-link focus-ring"
                aria-label={tPdp('nextNamed', { name: next.name })}
              >
                {tPdp('next')}
                <ChevronRight className="icon icon-inline" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        <div className="pdp-main">
          <div className="pdp-gallery">
            {/* Phones and tablets: the slider. Wide screens: every photograph in a grid. */}
            <div className="pdp-gallery-slider">
              <ProductGallery referenceFrameLabel={tGallery('referenceFrame')} assets={galleryAssets} />
            </div>
            <div className="pdp-gallery-grid">
              <ProductImageGrid
                assets={gridAssets}
                referenceFrameLabel={tGallery('referenceFrame')}
                viewerLabel={product.name}
                closeLabel={tSlideover('close')}
              />
            </div>
          </div>

          <div className="pdp-summary">
            {reviewSummary && <p className="pdp-rating">{reviewSummary}</p>}
            {product.productCode && <p className="pdp-code">{product.productCode}</p>}
            <h1 className="pdp-title">{product.name}</h1>
            <PriceDisplay amount={product.price} className="pdp-price" />
            <p className="pdp-material">{materialLabel}</p>
            <StockState
              state={product.stockState}
              quantity={product.quantity}
              outOfStockLabel={tStock('outOfStock')}
              lowStockLabel={tStock('lowStock')}
              formatLeft={(count) => tStock('left', { count })}
            />

            <JacketBlock
              materialName={product.jacketMaterialName}
              swatchHex={product.jacketSwatchHex}
              swatchUrl={product.jacketSwatchUrl}
              pieceLengthLabel={tJacket('pieceLength', { metres: product.jacketPieceLengthMetres })}
              shipsUnstitchedLabel={tJacket('shipsUnstitched')}
            />

            <div id="pdp-buy" className="pdp-buy">
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
            </div>

            {FEATURES.designYourOwn && (
              <Link href="/design-your-own" className="btn focus-ring btn-secondary btn-lg pdp-secondary">
                {tPdp('customiseThis')}
              </Link>
            )}
            <button type="button" className="btn focus-ring btn-tertiary btn-md pdp-swatches">
              {tPdp('sendSwatches')}
            </button>

            {/* Material, delivery, colour promise and care, folded, under the doors (founder decision 2026-11-13). */}
            <div className="pdp-details">
              <Accordion
                items={[
                  {
                    id: 'fabric',
                    title: tFabric('material'),
                    content: (
                      <FabricBlock
                        materialLabel={tFabric('category')}
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
                ]}
              />
            </div>

            {product.stockState === 'out' && <p className="field-message-error">{tPdp('outOfStockLabel')}</p>}
          </div>
        </div>
      </div>

      {/* Customer reviews, after killstar.com (docs/2-ui.md §7.5). */}
      <ProductReviews reviews={reviewData.reviews} summary={reviewData.summary} />

      {related.length > 0 && (
        <section className="pdp-related">
          {/* The same rail and cards as New arrivals on the home page (founder decision 2026-11-13). */}
          <ProductRail
            heading={tPdp('relatedHeading')}
            viewAll={{ href: '/shop', label: tRail('viewAll') }}
            labels={{ previous: tRail('previous'), next: tRail('next') }}
          >
            {related.map((item) => (
              <ProductCard
                key={item.id}
                href={`/shop/${item.id}`}
                image={{ src: item.imageUrl, alt: item.name }}
                name={item.name}
                code={item.productCode}
                materialLabel={categoryName(item.categoryId, item.categoryName)}
                price={item.price}
                jacketMaterialName={item.jacketMaterialName}
                jacketSwatchHex={item.jacketSwatchHex}
                jacketSwatchUrl={item.jacketSwatchUrl}
                stockState={item.stockState}
                quantity={item.quantity}
                outOfStockLabel={tStock('outOfStock')}
                lowStockLabel={tStock('lowStock')}
                formatLeft={(count) => tStock('left', { count })}
              />
            ))}
          </ProductRail>
        </section>
      )}

      <StickyBuyBar
        targetId="pdp-buy"
        thumbnail={{ src: product.imageUrl, alt: product.name }}
        name={product.name}
        price={<PriceDisplay amount={product.price} />}
        addToCartLabel={tPdp('addToCart')}
        disabled={product.stockState === 'out'}
      />
    </div>
  );
}
