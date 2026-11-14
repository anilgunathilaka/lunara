import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { StockState } from '@/components/product/StockState';
import { getStandaloneJackets } from '@/lib/catalogue/queries';

export default async function JacketMaterialPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('jacketPage');
  const tStock = await getTranslations('product.stock');
  const jackets = await getStandaloneJackets();

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
          {jackets.map((jacket) => (
            <Link key={jacket.id} href={`/jacket-material/${jacket.id}`} className="product-card">
              {/* The jacket's photograph; its colour fills the card until one is uploaded (OPS-02). */}
              <div className="product-card-image" style={{ backgroundColor: jacket.swatchHex }} aria-hidden="true">
                {jacket.swatchImageUrl && <Image src={jacket.swatchImageUrl} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" />}
              </div>
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
