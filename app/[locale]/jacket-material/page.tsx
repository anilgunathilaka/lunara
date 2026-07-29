import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { StockState } from '@/components/product/StockState';
import { placeholderJackets } from '@/content/catalogue/placeholder-jackets';

export default async function JacketMaterialPage() {
  const t = await getTranslations('jacketPage');
  const tStock = await getTranslations('product.stock');

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-5">
        <div>
          <SectionMarker />
          <h1 className="home-section-title">{t('title')}</h1>
        </div>
        <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
          {t('standaloneNote')}
        </p>

        <div className="home-arrivals-grid">
          {placeholderJackets.map((jacket) => (
            <Link key={jacket.id} href={`/jacket-material/${jacket.id}`} className="product-card">
              {/* True sampled fabric colour fills the card — swatch photography
                  will replace this flat fill once shot (OPS-02). */}
              <div className="product-card-image" style={{ backgroundColor: jacket.swatchHex }} aria-hidden="true" />
              <span className="sr-only">{jacket.colourName}</span>
              <StockState
                state={jacket.stockState}
                quantity={jacket.quantity}
                outOfStockLabel={tStock('outOfStock')}
                lowStockLabel={tStock('lowStock')}
                formatLeft={(count) => tStock('left', { count })}
              />
              <p className="product-card-name">{jacket.materialName}</p>
              <p className="product-card-material">{jacket.colourName}</p>
              <PriceDisplay amount={jacket.price} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
