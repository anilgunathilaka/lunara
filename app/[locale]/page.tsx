import Image from 'next/image';
import { Suspense, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { getCuratedListings } from '@/lib/catalogue/queries';
import { latestReviews, type PublicReview } from '@/lib/reviews/reviews';
import type { CatalogueProduct } from '@/lib/catalogue/types';
import { ReviewList } from '@/components/reviews/ReviewList';
import { whatsappLink } from '@/lib/commerce/business';
import { HeroShowcase, type HeroMore, type HeroSlide } from '@/components/home/HeroShowcase';
import { HERO_BANNERS } from '@/lib/home/hero';
import { FactMarquee } from '@/components/home/FactMarquee';
import { ProductRail } from '@/components/home/ProductRail';
import { Reveal } from '@/components/motion/Reveal';

/** Waits for a read inside its own Suspense boundary, then renders with it. */
async function Await<T>({ promise, children }: { promise: Promise<T>; children: (value: T) => ReactNode }) {
  return children(await promise);
}

/** Grey stand-ins the size of a product card, while the rail's data streams in. */
function CardSkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <div className="product-card-image skeleton" />
      <span className="skeleton skeleton-line" />
      <span className="skeleton skeleton-line skeleton-line-short" />
    </div>
  );
}

// Rendered per request: "New arrivals" shows live price and stock
// (docs/4-architecture.md §3.3). Streamed (founder report 2026-11-10: a
// refresh felt slow): nothing waits for the database before the first
// paint. The header, the banner, the sliding facts, the headline and every
// section of words go out at once; the featured sarees, the rail, the
// tiles' photographs and the reviews follow as the reads answer, each in
// a space the same size, so nothing shifts.
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Started together, awaited only where each is shown.
  const arrivalsP = getCuratedListings({ featuredOnly: true, limit: 6 });
  const reviewsP = latestReviews(3);
  const t = await getTranslations('home');
  const tFabric = await getTranslations('product.fabric');
  const tStock = await getTranslations('product.stock');
  const tDrape = await getTranslations('configurator.drape');
  const tJacket = await getTranslations('product.jacket');
  const tSupport = await getTranslations('support');
  const tNav = await getTranslations('layout.nav');
  const tLayout = await getTranslations('layout');
  const tFooter = await getTranslations('layout.footer');

  const formatLeft = (count: number) => tStock('left', { count });
  const materialLabel = { plain: tFabric('materialPlain'), super: tFabric('materialSuper') };

  // Featured sarees for the hero card; until there are any, the hero photograph.
  // Founder banners first, then featured sarees, four slides at most (founder decision 2026-11-10).
  const bannerSlides: HeroSlide[] = HERO_BANNERS.map((banner) => ({
    href: '/shop',
    image: { src: banner.src, alt: t(`hero.banners.${banner.altKey}`), focus: banner.focus, unoptimized: true },
    title: t('hero.shopCurated'),
  }));
  // With no banner, the hero photograph stands in until the sarees arrive.
  const firstSlides: HeroSlide[] =
    bannerSlides.length > 0
      ? bannerSlides
      : [{ href: '/shop', image: { src: '/placeholder/hero.jpg', alt: t('hero.headline') }, title: t('hero.shopCurated') }];
  const slideLabels = (total: number) =>
    Array.from({ length: total }, (_, i) => t('hero.slider.slideOf', { n: i + 1, total }));

  // Featured sarees after the banners, four slides at most.
  const heroMore: Promise<HeroMore> = arrivalsP.then((arrivals) => {
    const slides: HeroSlide[] = arrivals.slice(0, Math.max(0, 4 - firstSlides.length)).map((item) => ({
      href: `/shop/${item.id}`,
      image: { src: item.imageUrl, alt: item.name },
      title: item.name,
      caption: materialLabel[item.material],
    }));
    return { slides, slideOf: slideLabels(firstSlides.length + slides.length) };
  });

  // Ways in: a real saree photograph of each cotton where one exists.
  const tilesWith = (arrivals: CatalogueProduct[]) => {
    const photoOf = (material: 'plain' | 'super') =>
      arrivals.find((item) => item.material === material)?.imageUrl ?? '/placeholder/product.jpg';
    return [
      { href: '/shop?material=plain', label: materialLabel.plain, image: photoOf('plain') },
      { href: '/shop?material=super', label: materialLabel.super, image: photoOf('super') },
      { href: '/jacket-material', label: tNav('jacketMaterial'), image: '/placeholder/product.jpg' },
      { href: '/support/care-guide', label: tFooter('careGuide'), image: '/placeholder/product.jpg' },
    ];
  };
  const tileList = (tiles: ReturnType<typeof tilesWith>) => (
    <ul className="home-tiles">
      {tiles.map((tile) => (
        <li key={tile.href}>
          <Link href={tile.href} className="home-tile focus-ring">
            <span className="home-tile-image">
              <Image src={tile.image} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" />
            </span>
            <span className="home-tile-label">
              {tile.label}
              <ArrowRight className="icon icon-inline" aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

  const railProps = {
    heading: t('newArrivals.heading'),
    viewAll: { href: '/shop', label: t('newArrivals.viewAll') },
    labels: { previous: t('newArrivals.previous'), next: t('newArrivals.next') },
  };
  const renderRail = (arrivals: CatalogueProduct[]) => (
      <ProductRail {...railProps}>
        {arrivals.map((item) => (
          <ProductCard
            key={item.id}
            href={`/shop/${item.id}`}
            image={{ src: item.imageUrl, alt: item.name }}
            name={item.name}
            materialLabel={materialLabel[item.material]}
            price={item.price}
            jacketMaterialName={item.jacketMaterialName}
            jacketSwatchHex={item.jacketSwatchHex}
            stockState={item.stockState}
            quantity={item.quantity}
            outOfStockLabel={tStock('outOfStock')}
            lowStockLabel={tStock('lowStock')}
            formatLeft={formatLeft}
          />
        ))}
      </ProductRail>
  );

  const renderReviews = (reviews: PublicReview[]) =>
    reviews.length > 0 ? (
      <div className="home-reviews">
        <ReviewList reviews={reviews} showItem />
      </div>
    ) : (
      <div className="home-proof-placeholder">
        <p>{t('proof.placeholderNote')}</p>
      </div>
    );
  const drapeImage = '/placeholder/product.jpg';

  return (
    <>
      {/* Hero (docs/1-ux.md §4.1; layout and motion per docs/2-ui.md §7.2):
          a slider of photographs with no words on them, the four facts
          sliding beneath it. */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <HeroShowcase
            slides={firstSlides}
            more={heroMore}
            labels={{
              region: t('hero.slider.region'),
              previous: t('hero.slider.previous'),
              next: t('hero.slider.next'),
              slideOf: slideLabels(firstSlides.length),
            }}
          />
          {/* The four facts as sliding words beneath the banner (docs/2-ui.md §7.2). */}
          <FactMarquee
            facts={[tJacket('shipsUnstitched'), t('trust.returns'), t('trust.dispatch'), t('trust.colourPromise')]}
          />
          {/* The promise stays the page heading for search engines and screen readers, not shown. */}
          <h1 className="sr-only">{t('hero.headline')}</h1>
        </div>
      </section>

      {/* Sections after the hero follow the reference layout (docs/2-ui.md §7.4):
          a product rail, ways in, a two-drape split, a statement, a panel
          beside a photograph, reviews, then a word from us. */}

      {/* New arrivals — a rail of cards that scrolls sideways. */}
      <section className="home-band">
        <div className="home-band-inner">
          <Suspense
            fallback={
              <ProductRail {...railProps}>
                {[0, 1, 2, 3].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </ProductRail>
            }
          >
            <Await promise={arrivalsP}>{renderRail}</Await>
          </Suspense>
        </div>
      </section>

      {/* Ways in — each tile a photograph over a solid label bar with an arrow. */}
      <section className="home-band home-band-tight">
        <div className="home-band-inner">
          <Reveal>
            <h2 className="section-title">{t('tiles.heading')}</h2>
          </Reveal>
          <Suspense fallback={tileList(tilesWith([]))}>
            <Await promise={arrivalsP}>{(arrivals) => tileList(tilesWith(arrivals))}</Await>
          </Suspense>
        </div>
      </section>

      {/* One saree, two drapes — two photographs edge to edge, each with its
          name and a door. Both frames use the same placeholder photograph
          until the real dual-drape capture (OPS-09) exists: this shows the
          layout, not a claim that these are two different drapes. */}
      <section className="home-split" aria-label={t('osariya.heading')}>
        {[
          { label: tDrape('saree'), alt: 'Standard saree drape' },
          // Osariya is additionally shown in Sinhala script regardless of active locale — docs/3-components.md §4.3.
          { label: `${tDrape('osariya')} · ඔසරිය`, alt: 'Kandyan Osariya drape' },
        ].map((panel) => (
          <div key={panel.alt} className="home-split-panel">
            <Image src={drapeImage} alt={panel.alt} fill sizes="(min-width: 768px) 50vw, 100vw" />
            <Reveal className="home-split-copy">
              <h2 className="home-split-title">{panel.label}</h2>
              <Link href="/shop" className="solid-pill focus-ring">
                {t('shopNow')}
              </Link>
            </Reveal>
          </div>
        ))}
      </section>

      {/* Statement — the promise behind the split, set large. */}
      <section className="home-band">
        <Reveal className="home-band-inner home-statement">
          <p className="eyebrow">{t('osariya.heading')}</p>
          <p className="home-statement-text">{t('osariya.body')}</p>
          <Link href="/shop" className="text-link">
            {t('shopNow')}
          </Link>
        </Reveal>
      </section>

      {/* Reviews — verified customer photo reviews (FR-46), newest first and
          never filtered by rating. Until the first exists, this says so
          plainly rather than inventing a name and a quote. */}
      <section className="home-band home-band-tight">
        <div className="home-band-inner">
          <Reveal>
            <h2 className="section-title">{t('proof.heading')}</h2>
          </Reveal>
          <Suspense fallback={<div className="home-reviews skeleton skeleton-block" aria-hidden="true" />}>
            <Await promise={reviewsP}>{renderReviews}</Await>
          </Suspense>
        </div>
      </section>

      {/* A coloured panel beside a photograph: how the jacket gets made. */}
      <section className="home-feature">
        <Reveal className="home-feature-copy">
          <p className="eyebrow">{tJacket('shipsUnstitched')}</p>
          <h2 className="home-feature-title">{tSupport('jacketStitchingHeading')}</h2>
          <p className="home-feature-body">{tSupport('jacketStitchingBody')}</p>
          <Link href="/jacket-material" className="solid-pill solid-pill-plum focus-ring">
            {tNav('jacketMaterial')}
          </Link>
        </Reveal>
        <div className="home-feature-image">
          <Image src="/placeholder/product.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
      </section>

      {/* A word from us — the reference's community block, as WhatsApp. */}
      <section className="home-band">
        <Reveal className="home-band-inner home-community">
          <h2 className="section-title">{t('trust.whatsapp')}</h2>
          <p className="home-community-body">{tSupport('contactBody')}</p>
          <a href={whatsappLink()} className="solid-pill focus-ring" target="_blank" rel="noopener noreferrer">
            {tLayout('whatsapp')}
          </a>
        </Reveal>
      </section>
    </>
  );
}
