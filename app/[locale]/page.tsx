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

  const marqueeItems = [
    t('trust.colourPromise'),
    t('trust.returns'),
    t('trust.dispatch'),
    t('trust.whatsapp'),
  ];

  const categories = [
    {
      href: '/shop' as const,
      title: t('categories.shop.title'),
      body: t('categories.shop.body'),
      image: '/placeholder/product.jpg',
      imageAlt: t('categories.shop.title'),
    },
    {
      href: '/design-your-own' as const,
      title: t('categories.design.title'),
      body: t('categories.design.body'),
      image: '/placeholder/hero.jpg',
      imageAlt: t('categories.design.title'),
    },
    {
      href: '/jacket-material' as const,
      title: t('categories.jacket.title'),
      body: t('categories.jacket.body'),
      image: '/placeholder/product.jpg',
      imageAlt: t('categories.jacket.title'),
    },
    {
      href: '/shop' as const,
      title: t('categories.occasion.title'),
      body: t('categories.occasion.body'),
      image: '/placeholder/hero.jpg',
      imageAlt: t('categories.occasion.title'),
    },
  ];

  return (
    <>
      {/* Running trust line — Jolie-style horizontal ticker, Lunara facts only
          (docs/1-ux.md §4.1 trust strip; no urgency theatre). */}
      <div className="home-marquee" aria-label={t('marquee.label')}>
        <div className="home-marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="home-marquee-group" aria-hidden={copy === 1}>
              {marqueeItems.map((item) => (
                <span key={`${copy}-${item}`} className="home-marquee-item">
                  <span className="home-marquee-dot" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hero — full-bleed media plane + content band below (no overlay /
          tint on photography — docs/2-ui.md §2.5). Two equal doors
          (docs/1-ux.md §4.1). */}
      <section className="home-hero">
        <div className="home-hero-media">
          <Image
            src="/placeholder/hero.jpg"
            alt="A Lunara cotton saree and jacket pairing"
            fill
            sizes="100vw"
            priority
          />
        </div>
        <div className="home-hero-body">
          <p className="home-hero-eyebrow">{t('hero.eyebrow')}</p>
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
      </section>

      {/* Category tiles — Jolie collection-list structure, Lunara paths. */}
      <section className="home-section home-categories">
        <div className="home-section-inner">
          <div className="home-section-header">
            <div>
              <SectionMarker />
              <h2 className="home-section-title">{t('categories.heading')}</h2>
            </div>
          </div>
          <div className="home-category-rail">
            {categories.map((category) => (
              <Link key={category.href + category.title} href={category.href} className="home-category-card">
                <div className="home-category-media">
                  <Image
                    src={category.image}
                    alt={category.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 40vw, 70vw"
                  />
                </div>
                <div className="home-category-body">
                  <h3 className="home-category-title">{category.title}</h3>
                  <p className="home-category-text">{category.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip — four facts above the fold on mobile. */}
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
        <a
          href="https://wa.me/94000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="home-trust-item"
        >
          <Icon icon={MessageCircle} />
          <span className="home-trust-item-text">{t('trust.whatsapp')}</span>
        </a>
      </div>

      {/* New arrivals — featured collection + view-all. */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="home-section-header">
            <div>
              <SectionMarker />
              <h2 className="home-section-title">{t('newArrivals.heading')}</h2>
            </div>
            <Link href="/shop" className="home-section-link">
              {t('newArrivals.viewAll')}
            </Link>
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

      {/* Promo image cards — Jolie image-cards rhythm; Osariya + doors. */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="home-promo-grid">
            <article className="home-promo-card home-promo-card-wide">
              <div className="home-promo-media home-promo-media-split">
                <div className="home-osariya-frame">
                  <Image
                    src="/placeholder/product.jpg"
                    alt="Standard saree drape"
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                  />
                </div>
                <div className="home-osariya-frame">
                  <Image
                    src="/placeholder/product.jpg"
                    alt="Kandyan Osariya drape"
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                  />
                </div>
              </div>
              <div className="home-promo-body">
                <SectionMarker />
                <h2 className="home-section-title">{t('osariya.heading')}</h2>
                <div className="home-osariya-labels">
                  <span className="home-osariya-label">{tDrape('saree')}</span>
                  <span className="home-osariya-label">
                    {tDrape('osariya')} · ඔසරිය
                  </span>
                </div>
                <p className="home-promo-text">{t('osariya.body')}</p>
                <Link href="/design-your-own" className="home-section-link">
                  {t('osariya.cta')}
                </Link>
              </div>
            </article>

            <Link href="/design-your-own" className="home-promo-card">
              <div className="home-promo-media">
                <Image
                  src="/placeholder/hero.jpg"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
              </div>
              <div className="home-promo-body">
                <h3 className="home-promo-title">{t('promos.design.title')}</h3>
                <p className="home-promo-text">{t('promos.design.body')}</p>
                <span className="home-section-link">{t('promos.design.cta')}</span>
              </div>
            </Link>

            <Link href="/jacket-material" className="home-promo-card">
              <div className="home-promo-media">
                <Image
                  src="/placeholder/product.jpg"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
              </div>
              <div className="home-promo-body">
                <h3 className="home-promo-title">{t('promos.jacket.title')}</h3>
                <p className="home-promo-text">{t('promos.jacket.body')}</p>
                <span className="home-section-link">{t('promos.jacket.cta')}</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <div className="px-4 md:px-6">
        <MotifDivider />
      </div>

      {/* Proof — real reviews only when published (FR-46); never fabricated. */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="home-section-header home-section-header-center">
            <div>
              <SectionMarker />
              <h2 className="home-section-title">{t('proof.heading')}</h2>
              <p className="home-section-lede">{t('proof.lede')}</p>
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
