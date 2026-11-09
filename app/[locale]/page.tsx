import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { getCuratedListings } from '@/lib/catalogue/queries';
import { latestReviews, siteReviewSummary } from '@/lib/reviews/reviews';
import { ReviewList } from '@/components/reviews/ReviewList';
import { whatsappLink } from '@/lib/commerce/business';
import { FEATURES } from '@/lib/features';
import { HeroShowcase, type HeroSlide } from '@/components/home/HeroShowcase';
import { ProductRail } from '@/components/home/ProductRail';
import { Reveal } from '@/components/motion/Reveal';

// Rendered per request: "New arrivals" shows live price and stock
// (docs/4-architecture.md §3.3).
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Parallel: each read is a round trip to the database.
  const [arrivals, reviews, reviewSummary] = await Promise.all([
    getCuratedListings({ featuredOnly: true, limit: 6 }),
    latestReviews(3),
    siteReviewSummary(),
  ]);
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
  const heroSlides: HeroSlide[] =
    arrivals.length > 0
      ? arrivals.slice(0, 5).map((item) => ({
          href: `/shop/${item.id}`,
          image: { src: item.imageUrl, alt: item.name },
          title: item.name,
          caption: materialLabel[item.material],
        }))
      : [{ href: '/shop', image: { src: '/placeholder/hero.jpg', alt: t('hero.headline') }, title: t('hero.shopCurated') }];

  // Real review proof only: initials of the latest reviewers and the true
  // count and average. Nothing is shown until there are reviews.
  const proof =
    reviewSummary.count > 0 && reviewSummary.average !== null
      ? {
          initials: reviews.slice(0, 4).map((r) => r.displayName.trim().charAt(0).toUpperCase() || '·'),
          text: t('hero.card.proof', { average: reviewSummary.average, count: reviewSummary.count }),
        }
      : null;

  // Ways in: a real saree photograph of each cotton where one exists.
  const photoOf = (material: 'plain' | 'super') =>
    arrivals.find((item) => item.material === material)?.imageUrl ?? '/placeholder/product.jpg';
  const tiles = [
    { href: '/shop?material=plain', label: materialLabel.plain, image: photoOf('plain') },
    { href: '/shop?material=super', label: materialLabel.super, image: photoOf('super') },
    { href: '/jacket-material', label: tNav('jacketMaterial'), image: '/placeholder/product.jpg' },
    { href: '/support/care-guide', label: tFooter('careGuide'), image: '/placeholder/product.jpg' },
  ];
  const drapeImage = '/placeholder/product.jpg';

  const headlineWords = t('hero.headline').split(' ');

  return (
    <>
      {/* Hero (docs/1-ux.md §4.1; layout and motion per docs/2-ui.md §7.2):
          a rounded card of featured sarees carrying the trust facts as pills,
          then the promise set very large beneath it. */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <HeroShowcase
            slides={heroSlides}
            pills={[
              { label: tJacket('shipsUnstitched'), href: '/support/shipping' },
              { label: t('trust.returns'), href: '/support/returns' },
              { label: t('trust.dispatch'), href: '/support/shipping' },
              { label: t('trust.colourPromise'), href: '/support/care-guide' },
            ]}
            contact={{ label: t('trust.whatsapp'), href: whatsappLink() }}
            proof={proof}
            scrollTarget="#home-after-hero"
            labels={{
              region: t('hero.slider.region'),
              pause: t('hero.slider.pause'),
              play: t('hero.slider.play'),
              slideOf: heroSlides.map((_, i) => t('hero.slider.slideOf', { n: i + 1, total: heroSlides.length })),
              scroll: t('hero.card.scroll'),
            }}
          />
          <h1 className="home-hero-headline">
            {headlineWords.map((word, i) => (
              <span key={i} className="home-hero-word" style={{ '--i': i } as CSSProperties}>
                {word}
              </span>
            ))}
          </h1>
          <div className="home-hero-foot">
            <p className="home-hero-subhead">{t('hero.subhead')}</p>
            <div className="home-hero-doors">
              <Link href="/shop" className="home-hero-door focus-ring">
                {t('hero.shopCurated')}
                <ArrowUpRight className="icon icon-inline" aria-hidden="true" />
              </Link>
              {FEATURES.designYourOwn && (
                <Link href="/design-your-own" className="home-hero-door focus-ring">
                  {t('hero.designYourOwn')}
                  <ArrowUpRight className="icon icon-inline" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div id="home-after-hero" />

      {/* Sections after the hero follow the reference layout (docs/2-ui.md §7.4):
          a product rail, ways in, a two-drape split, a statement, a panel
          beside a photograph, reviews, then a word from us. */}

      {/* New arrivals — a rail of cards that scrolls sideways. */}
      <section className="home-band">
        <div className="home-band-inner">
          <ProductRail
            heading={t('newArrivals.heading')}
            viewAll={{ href: '/shop', label: t('newArrivals.viewAll') }}
            labels={{ previous: t('newArrivals.previous'), next: t('newArrivals.next') }}
          >
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
        </div>
      </section>

      {/* Ways in — each tile a photograph over a solid label bar with an arrow. */}
      <section className="home-band home-band-tight">
        <div className="home-band-inner">
          <Reveal>
            <h2 className="section-title">{t('tiles.heading')}</h2>
          </Reveal>
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
          {reviews.length > 0 ? (
            <div className="home-reviews">
              <ReviewList reviews={reviews} showItem />
            </div>
          ) : (
            <div className="home-proof-placeholder">
              <p>{t('proof.placeholderNote')}</p>
            </div>
          )}
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
