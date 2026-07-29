import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { Divider } from '@/components/primitives/Divider';
import { ProductGallery } from '@/components/product/ProductGallery';
import { FabricBlock } from '@/components/product/FabricBlock';
import { JacketBlock } from '@/components/product/JacketBlock';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { StockState } from '@/components/product/StockState';
import { ProductCard } from '@/components/product/ProductCard';
import { Accordion } from '@/components/layout/Accordion';
import { AddToCartFlow } from '@/components/commerce/AddToCartFlow';
import { getCatalogueProduct, placeholderCatalogue } from '@/content/catalogue/placeholder-catalogue';

export function generateStaticParams() {
  return placeholderCatalogue.map((product) => ({ id: product.id }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getCatalogueProduct(id);
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

  const related = placeholderCatalogue.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="lg:flex-1">
            <ProductGallery
              referenceFrameLabel={tGallery('referenceFrame')}
              assets={[
                { type: 'image', src: '/placeholder/product.jpg', alt: `${product.name}, full drape` },
                { type: 'image', src: '/placeholder/product.jpg', alt: `${product.name}, pallu detail` },
                { type: 'image', src: '/placeholder/product.jpg', alt: `${product.name}, border close-up` },
                { type: 'image', src: '/placeholder/product.jpg', alt: `${product.name}, cotton texture macro` },
                {
                  type: 'image',
                  src: '/placeholder/product.jpg',
                  alt: `${product.name}, colour reference frame`,
                  isReferenceFrame: true,
                },
              ]}
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
                designName: product.name,
                materialLabel,
                sareeColourName: product.colourName,
                jacketMaterialName: product.jacketMaterialName,
                jacketColourName: product.jacketColourName,
                drapeLabel: 'Saree',
                unitPrice: product.price,
                quantity: 1,
                thumbnail: { src: '/placeholder/product.jpg', alt: product.name },
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

            <Link href="/design-your-own" className="btn focus-ring btn-secondary btn-lg">
              {tPdp('customiseThis')}
            </Link>
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
              title: tPdp('reviewsHeading'),
              content: (
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
                image={{ src: '/placeholder/product.jpg', alt: item.name }}
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
