import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { Divider } from '@/components/primitives/Divider';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { StockState } from '@/components/product/StockState';
import { AddToCartFlow } from '@/components/commerce/AddToCartFlow';
import { getJacketProduct, placeholderJackets } from '@/content/catalogue/placeholder-jackets';
import { getCatalogueProduct } from '@/content/catalogue/placeholder-catalogue';

export function generateStaticParams() {
  return placeholderJackets.map((jacket) => ({ id: jacket.id }));
}

export default async function JacketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jacket = getJacketProduct(id);
  if (!jacket) notFound();

  const [t, tPdp, tJacket, tStock, tSlideover, tCart] = await Promise.all([
    getTranslations('jacketPage'),
    getTranslations('pdp'),
    getTranslations('product.jacket'),
    getTranslations('product.stock'),
    getTranslations('layout.slideover'),
    getTranslations('commerce.cart'),
  ]);

  const pairsWith = jacket.pairsWithIds
    .map((sareeId) => getCatalogueProduct(sareeId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="lg:flex-1">
            <div
              className="gallery-main"
              style={{ backgroundColor: jacket.swatchHex }}
              aria-label={`${jacket.materialName}, ${jacket.colourName}`}
            />
          </div>

          <div className="flex flex-col gap-4 lg:w-[380px]">
            <h1 className="checkout-step-title">{jacket.materialName}</h1>
            <p className="product-card-material">{jacket.colourName}</p>
            <StockState
              state={jacket.stockState}
              quantity={jacket.quantity}
              outOfStockLabel={tStock('outOfStock')}
              lowStockLabel={tStock('lowStock')}
              formatLeft={(count) => tStock('left', { count })}
            />
            <PriceDisplay amount={jacket.price} />

            <dl className="spec-list">
              <div className="spec-row">
                <dt className="spec-row-term">{t('composition')}</dt>
                <dd>{jacket.composition}</dd>
              </div>
              <div className="spec-row">
                <dt className="spec-row-term">{tJacket('pieceLength', { metres: jacket.pieceLengthMetres })}</dt>
              </div>
            </dl>
            <p className="jacket-block-unstitched">{tJacket('shipsUnstitched')}</p>
            <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
              {t('deliveryNote')}
            </p>

            <AddToCartFlow
              disabled={jacket.stockState === 'out'}
              item={{
                designName: jacket.materialName,
                materialLabel: jacket.composition,
                jacketMaterialName: jacket.materialName,
                jacketColourName: jacket.colourName,
                unitPrice: jacket.price,
                quantity: 1,
                thumbnail: { src: '/placeholder/product.jpg', alt: jacket.materialName },
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
        </div>

        {pairsWith.length > 0 && (
          <>
            <Divider />
            <div>
              <SectionMarker />
              <h2 className="home-section-title">{t('pairsWith')}</h2>
              <div className="flex flex-wrap gap-3" style={{ marginTop: 'var(--space-4)' }}>
                {pairsWith.map((saree) => (
                  <Link
                    key={saree.id}
                    href={`/design-your-own?jacket=${jacket.id}`}
                    className="btn focus-ring btn-secondary btn-md"
                  >
                    {saree.name}
                  </Link>
                ))}
              </div>
              <Link href={`/design-your-own?jacket=${jacket.id}`} className="btn focus-ring btn-tertiary btn-sm">
                {t('seeAgainstSaree')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
