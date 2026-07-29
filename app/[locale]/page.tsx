import Image from 'next/image';
import { Camera, MessageCircle, RotateCcw, Truck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { MotifDivider } from '@/components/brand/MotifDivider';
import { ProductCard } from '@/components/product/ProductCard';
import { placeholderArrivals } from '@/content/catalogue/placeholder-arrivals';

export default async function HomePage() {
  const t = await getTranslations('home');
  const tFabric = await getTranslations('product.fabric');
  const tStock = await getTranslations('product.stock');
  const tDrape = await getTranslations('configurator.drape');

  const formatLeft = (count: number) => tStock('left', { count });
  const materialLabel = { plain: tFabric('materialPlain'), super: tFabric('materialSuper') };

  return (
    <>
      {/* Hero — the configurator's promise, shown rather than described
          (docs/1-ux.md §4.1). The two doors (curated shop / configurator)
          carry equal visual weight, neither is the "advanced" option. */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-media">
            {/* Real capture footage (OPS-09) doesn't exist yet — this is
                the same placeholder asset used elsewhere pending
                photography, not a claim about the finished product. */}
            <Image
              src="/placeholder/hero.jpg"
              alt="A Lunara cotton saree and jacket pairing"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority
            />
          </div>
          <div className="home-hero-body">
            <h1 className="home-hero-headline">{t('hero.headline')}</h1>
            <p className="home-hero-subhead">{t('hero.subhead')}</p>
            <div className="home-hero-doors">
              <Link href="/shop" className="btn focus-ring btn-primary btn-lg">
                {t('hero.shopCurated')}
              </Link>
              <Link href="/design-your-own" className="btn focus-ring btn-secondary btn-lg">
                {t('hero.designYourOwn')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip — four facts answering the category's biggest
          doubts, above the fold on mobile. */}
      <div className="home-trust-strip">
        <div className="home-trust-item">
          <Icon icon={Camera} />
          <span className="home-trust-item-text">{t('trust.colourPromise')}</span>
        </div>
        <div className="home-trust-item">
          <Icon icon={RotateCcw} />
          <span className="home-trust-item-text">{t('trust.returns')}</span>
        </div>
        <div className="home-trust-item">
          <Icon icon={Truck} />
          <span className="home-trust-item-text">{t('trust.dispatch')}</span>
        </div>
        <a href="https://wa.me/94000000000" target="_blank" rel="noopener noreferrer" className="home-trust-item">
          <Icon icon={MessageCircle} />
          <span className="home-trust-item-text">{t('trust.whatsapp')}</span>
        </a>
      </div>

      {/* New arrivals */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="home-section-header">
            <div>
              <SectionMarker />
              <h2 className="home-section-title">{t('newArrivals.heading')}</h2>
            </div>
          </div>
          <div className="home-arrivals-grid">
            {placeholderArrivals.map((item) => (
              <ProductCard
                key={item.id}
                href={`/shop/${item.id}`}
                image={{ src: '/placeholder/product.jpg', alt: item.name }}
                name={item.name}
                materialLabel={materialLabel[item.material]}
                price={item.price}
                jacketMaterialName={item.jacketMaterialName}
                jacketSwatchHex={item.jacketSwatchHex}
                stockState={item.stockState}
                quantity={'quantity' in item ? item.quantity : undefined}
                outOfStockLabel={tStock('outOfStock')}
                lowStockLabel={tStock('lowStock')}
                formatLeft={formatLeft}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="px-4 md:px-6">
        <MotifDivider />
      </div>

      {/* Osariya feature — the same saree in both drapes. A culturally
          distinctive panel no other Sri Lankan competitor shows online
          (docs/0-prd.md §2.2 "Osariya invisibility"). Both frames use the
          same placeholder photograph pending the real dual-drape capture
          (OPS-09) — this demonstrates the panel's layout, not a claim
          that these are two different drapes. */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="home-section-header">
            <div>
              <SectionMarker />
              <h2 className="home-section-title">{t('osariya.heading')}</h2>
            </div>
          </div>
          <div className="home-osariya-panel">
            <div>
              <div className="home-osariya-frame">
                <Image
                  src="/placeholder/product.jpg"
                  alt="Standard saree drape"
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              </div>
              <span className="home-osariya-label">{tDrape('saree')}</span>
            </div>
            <div>
              <div className="home-osariya-frame">
                <Image
                  src="/placeholder/product.jpg"
                  alt="Kandyan Osariya drape"
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              </div>
              {/* Osariya is additionally shown in Sinhala script regardless
                  of active locale — docs/3-components.md §4.3. */}
              <span className="home-osariya-label">
                {tDrape('osariya')} · ඔසරිය
              </span>
            </div>
          </div>
          <p className="home-osariya-body">{t('osariya.body')}</p>
        </div>
      </section>

      <div className="px-4 md:px-6">
        <MotifDivider />
      </div>

      {/* Proof — customer photo reviews. Never fabricated: no verified
          reviews exist yet (FR-46), so this states that plainly rather
          than inventing a name and a quote. */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="home-section-header">
            <div>
              <SectionMarker />
              <h2 className="home-section-title">{t('proof.heading')}</h2>
            </div>
          </div>
          <div className="home-proof-placeholder">
            <p>{t('proof.placeholderNote')}</p>
          </div>
        </div>
      </section>
    </>
  );
}
