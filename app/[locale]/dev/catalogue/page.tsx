import { getTranslations } from 'next-intl/server';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGallery } from '@/components/product/ProductGallery';
import { FabricBlock } from '@/components/product/FabricBlock';
import { JacketBlock } from '@/components/product/JacketBlock';
import { OpacityRating } from '@/components/product/OpacityRating';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { StockState } from '@/components/product/StockState';
import { devCatalogueSamples } from '@/content/dev/catalogue-samples';

/**
 * Internal QA scratch page for ProductCard, ProductGallery, FabricBlock,
 * JacketBlock, OpacityRating, PriceDisplay and StockState
 * (docs/3-components.md §3.3-3.5). Not part of the shipped product
 * surface — delete or gate behind an env check before launch.
 */
export default async function CatalogueQaPage() {
  const tFabric = await getTranslations('product.fabric');
  const tOpacity = await getTranslations('product.opacity');
  const tJacket = await getTranslations('product.jacket');
  const tStock = await getTranslations('product.stock');

  const formatLeft = (count: number) => tStock('left', { count });
  const [teal, rose, charcoal] = devCatalogueSamples.cards;

  return (
    <main className="mx-auto flex max-w-[960px] flex-col gap-10 p-6">
      <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
        Catalogue components — QA
      </h1>

      <section className="flex flex-col gap-3">
        <h2 className="field-label">ProductCard — in / low / out</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <ProductCard
            href="/dev/catalogue"
            image={{ src: '/dev/sample-saree.jpg', alt: 'Deep teal cotton saree, full drape' }}
            name={teal.name}
            materialLabel={tFabric('materialPlain')}
            price={teal.price}
            jacketMaterialName={teal.jacketMaterialName}
            jacketSwatchHex={teal.jacketSwatchHex}
            stockState={teal.stockState}
            outOfStockLabel={tStock('outOfStock')}
            lowStockLabel={tStock('lowStock')}
            formatLeft={formatLeft}
          />
          <ProductCard
            href="/dev/catalogue"
            image={{ src: '/dev/sample-saree.jpg', alt: 'Rose dust cotton saree, full drape' }}
            name={rose.name}
            materialLabel={tFabric('materialSuper')}
            price={rose.price}
            jacketMaterialName={rose.jacketMaterialName}
            jacketSwatchHex={rose.jacketSwatchHex}
            stockState={rose.stockState}
            quantity={rose.quantity}
            outOfStockLabel={tStock('outOfStock')}
            lowStockLabel={tStock('lowStock')}
            formatLeft={formatLeft}
          />
          <ProductCard
            href="/dev/catalogue"
            image={{ src: '/dev/sample-saree.jpg', alt: 'Charcoal cotton saree, full drape' }}
            name={charcoal.name}
            materialLabel={tFabric('materialPlain')}
            price={charcoal.price}
            jacketMaterialName={charcoal.jacketMaterialName}
            jacketSwatchHex={charcoal.jacketSwatchHex}
            stockState={charcoal.stockState}
            outOfStockLabel={tStock('outOfStock')}
            lowStockLabel={tStock('lowStock')}
            formatLeft={formatLeft}
          />
        </div>
      </section>

      <section className="flex max-w-[420px] flex-col gap-3">
        <h2 className="field-label">ProductGallery</h2>
        <ProductGallery
          referenceFrameLabel="Colour reference"
          assets={[
            { type: 'image', src: '/dev/sample-saree.jpg', alt: 'Full drape' },
            { type: 'image', src: '/dev/sample-saree.jpg', alt: 'Pallu detail' },
            { type: 'image', src: '/dev/sample-saree.jpg', alt: 'Border close-up' },
            {
              type: 'image',
              src: '/dev/sample-saree.jpg',
              alt: 'Colour reference frame',
              isReferenceFrame: true,
            },
          ]}
        />
      </section>

      <section className="flex max-w-[420px] flex-col gap-3">
        <h2 className="field-label">FabricBlock</h2>
        <FabricBlock
          materialLabel={tFabric('material')}
          materialValue={tFabric('materialPlain')}
          weightLabel={tFabric('weight')}
          weightValue={tFabric('weightValue', { gsm: 120 })}
          lengthLabel={tFabric('length')}
          lengthValue={tFabric('lengthValue', { metres: 5.5 })}
          opacityLabel={tFabric('opacity')}
          opacity="semi-sheer"
          opacityValueLabel={tOpacity('semiSheer')}
        />
      </section>

      <section className="flex max-w-[420px] flex-col gap-3">
        <h2 className="field-label">JacketBlock</h2>
        <JacketBlock
          materialName={devCatalogueSamples.jacketBlock.materialName}
          swatchHex={devCatalogueSamples.jacketBlock.swatchHex}
          pieceLengthLabel={tJacket('pieceLength', { metres: 1.2 })}
          shipsUnstitchedLabel={tJacket('shipsUnstitched')}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="field-label">OpacityRating</h2>
        <div className="flex flex-col gap-2">
          <OpacityRating value="opaque" label={tOpacity('opaque')} />
          <OpacityRating value="semi-sheer" label={tOpacity('semiSheer')} />
          <OpacityRating value="sheer" label={tOpacity('sheer')} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="field-label">PriceDisplay / StockState</h2>
        <div className="flex flex-wrap items-center gap-4">
          <PriceDisplay amount={8900} />
          <StockState
            state="low"
            quantity={2}
            outOfStockLabel={tStock('outOfStock')}
            lowStockLabel={tStock('lowStock')}
            formatLeft={formatLeft}
          />
          <StockState
            state="out"
            outOfStockLabel={tStock('outOfStock')}
            lowStockLabel={tStock('lowStock')}
            formatLeft={formatLeft}
          />
          <StockState
            state="in"
            outOfStockLabel={tStock('outOfStock')}
            lowStockLabel={tStock('lowStock')}
            formatLeft={formatLeft}
          />
          <span className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
            (&quot;in&quot; renders nothing — silent default)
          </span>
        </div>
      </section>
    </main>
  );
}
