import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense, type CSSProperties, type ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { getCuratedListings } from '@/lib/catalogue/queries';
import { getHomeTopSellVisible } from '@/lib/site/settings';
import { categoryNamer } from '@/lib/catalogue/category-label';
import type { CatalogueProduct } from '@/lib/catalogue/types';
import { HeroShowcase, type HeroMore, type HeroSlide } from '@/components/home/HeroShowcase';
import { HERO_BANNERS } from '@/lib/home/hero';
import { FactMarquee } from '@/components/home/FactMarquee';
import { ProductRail } from '@/components/home/ProductRail';
import { HomeFilm } from '@/components/home/HomeFilm';
import { ScrollProgress, ScrollWords } from '@/components/motion/ScrollProgress';
import { JsonLd } from '@/components/seo/JsonLd';
import { BRAND, SITE_URL, absoluteUrl, pageMetadata } from '@/lib/seo/meta';
import { WHATSAPP_NUMBER } from '@/lib/commerce/business';

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
// section of words go out at once; the featured sarees and the rail
// follow as the reads answer, each in
// a space the same size, so nothing shifts.
/** The home page's search title stands alone (no "| Lunara Sarees" suffix): it already starts with the name. */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return pageMetadata({ locale, path: '', title: { absolute: t('homeTitle') }, description: t('homeDescription') });
}

/**
 * Who Lunara is, for search engines (schema.org ClothingStore): name, logo,
 * where, how to reach us. The same facts as the Contact page.
 */
function storeData(locale: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': `${SITE_URL}/#store`,
    name: BRAND,
    description,
    url: `${SITE_URL}/${locale}`,
    logo: absoluteUrl('/brand/lunara-logo.webp'),
    image: absoluteUrl('/video/home-film-poster.jpg'),
    email: 'hello@lunarasarees.com',
    telephone: '+94 70 214 4064',
    currenciesAccepted: 'LKR',
    paymentAccepted: 'Cash, Bank transfer',
    areaServed: { '@type': 'Country', name: 'Sri Lanka' },
    address: { '@type': 'PostalAddress', addressLocality: 'Kandy', addressRegion: 'Central Province', addressCountry: 'LK' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+94 70 214 4064',
      url: `https://wa.me/${WHATSAPP_NUMBER}`,
      availableLanguage: ['English', 'Sinhala', 'Tamil'],
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Started together, awaited only where each is shown.
  const arrivalsP = getCuratedListings({ featuredOnly: true, limit: 6 });
  // Top sell (founder decision 2026-11-23): the sarees the admin ticked, unless
  // the admin has hidden the section. Degrades, never blocks: if either read
  // fails (say, before its migration has run) the section simply isn't shown.
  const topSellP: Promise<CatalogueProduct[]> = getHomeTopSellVisible()
    .then((visible) => (visible ? getCuratedListings({ topSellersOnly: true, limit: 8 }) : []))
    .catch(() => []);
  const categoryName = await categoryNamer();
  const t = await getTranslations('home');
  const tStock = await getTranslations('product.stock');
  const tJacket = await getTranslations('product.jacket');

  const formatLeft = (count: number) => tStock('left', { count });

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
      caption: categoryName(item.categoryId, item.categoryName),
    }));
    return { slides, slideOf: slideLabels(firstSlides.length + slides.length) };
  });

  const railProps = {
    heading: t('newArrivals.heading'),
    viewAll: { href: '/shop', label: t('newArrivals.viewAll') },
    labels: { previous: t('newArrivals.previous'), next: t('newArrivals.next') },
  };
  const renderCards = (items: CatalogueProduct[]) =>
    items.map((item) => (
        <ProductCard
          key={item.id}
          favouriteId={item.id}
          href={`/shop/${item.id}`}
          image={{ src: item.imageUrl, alt: item.name }}
          name={item.name}
          code={item.productCode}
          materialLabel={categoryName(item.categoryId, item.categoryName)}
          price={item.price}
          stockState={item.stockState}
          quantity={item.quantity}
          outOfStockLabel={tStock('outOfStock')}
          lowStockLabel={tStock('lowStock')}
          formatLeft={formatLeft}
        />
    ));
  const renderRail = (arrivals: CatalogueProduct[]) => <ProductRail {...railProps}>{renderCards(arrivals)}</ProductRail>;
  // Same rail as New arrivals. Nothing at all when hidden or when no saree is ticked.
  const renderTopSell = (items: CatalogueProduct[]) =>
    items.length === 0 ? null : (
      <section className="home-band">
        <div className="home-band-inner">
          <ProductRail
            heading={t('topSell.heading')}
            viewAll={{ href: '/shop', label: t('newArrivals.viewAll') }}
            labels={{ previous: t('newArrivals.previous'), next: t('newArrivals.next') }}
          >
            {renderCards(items)}
          </ProductRail>
        </div>
      </section>
    );

  // Osariya is additionally shown in Sinhala script regardless of active locale — docs/3-components.md §4.3.

  // Three founder posters after the film (founder decision 2026-11-23). Their
  // words are part of the artwork, so the alt text repeats them. Served as-is
  // (unoptimized), like the hero banners: already high-quality WebP sized for
  // the row; a second compression blurs the fine lettering.
  // Order and size (founder decision 2026-11-24): all three the same width and
  // height, the Osaria poster second. `pos` keeps each poster's words in the
  // frame: the tall first poster loses a sliver of floor and backdrop only.
  const trio = [
    { src: '/images/home-trio-1.webp', width: 1400, height: 2099, pos: '50% 47%', alt: t('trio.alt1') },
    { src: '/images/home-trio-3.webp', width: 1400, height: 1749, pos: '50% 50%', alt: t('trio.alt3') },
    { src: '/images/home-trio-2.webp', width: 1121, height: 1403, pos: '50% 50%', alt: t('trio.alt2') },
  ];

  const tSeo = await getTranslations('seo');

  return (
    <>
      <JsonLd data={storeData(locale, tSeo('siteDescription'))} />
      {/* On arrival a maroon curtain lifts off the page (after ccopadel.com,
          founder decision 2026-11-23). CSS only; skipped under reduced motion. */}
      <div className="home-curtain" aria-hidden="true" />

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

      {/* Sections after the hero follow ccopadel.com (docs/2-ui.md §7.4,
          founder decision 2026-11-23) on white, with Lunara's own words. */}

      {/* New arrivals — a rail of cards that scrolls sideways (the earlier design, kept: founder decision 2026-11-23). */}
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

      {/* One saree, two drapes: two lines ("Grace in" / "every drape") slide apart as the film
          grows to fill the screen, then a card with the door to the shop. */}
      <ScrollProgress mode="stage" as="section" className="home-stage" aria-label={t('osariya.heading')}>
        <div className="home-stage-pin">
          <p className="home-stage-lines" aria-hidden="true">
            <span className="home-stage-line home-stage-line-top">{t('stage.lineTop')}</span>
            <span className="home-stage-line home-stage-line-bottom">{t('stage.lineBottom')}</span>
          </p>
          {/* The film of a saree being worn grows to fill the screen (founder
              decision 2026-11-23). Over it only words, the card and the pause
              button: never a tint, gradient or scrim (CLAUDE.md). */}
          <div className="home-stage-media">
            <HomeFilm
              src="/video/home-film-720.mp4"
              poster="/video/home-film-poster.jpg"
              labels={{ pause: t('film.pause'), play: t('film.play') }}
            />
          </div>
          {/* Three short lines on the open wall to the right of the film
              (founder decision 2026-11-24): once the film fills the screen
              each rises out of its own mask, one after another, and a gold
              rule draws in beneath. Wide screens only; on phones the model
              fills the frame and the card carries the words. */}
          <p className="home-stage-over">
            {[t('stage.over1'), t('stage.over2'), t('stage.over3')].map((line, i) => (
              <span key={i} className="home-stage-over-mask">
                <span className="home-stage-over-line" style={{ '--i': i } as CSSProperties}>
                  {line}
                </span>
              </span>
            ))}
            <span className="home-stage-over-rule" aria-hidden="true" />
          </p>
          {/* The card: a title and a line (founder decision 2026-11-24: no label above). */}
          <div className="home-stage-card">
            <h2 className="home-stage-title">{t('stage.title')}</h2>
            <p className="home-stage-sub">{t('stage.sub')}</p>
            <Link href="/shop" className="solid-pill solid-pill-plum focus-ring">
              {t('shopNow')}
            </Link>
          </div>
        </div>
      </ScrollProgress>

      {/* Statement, after the film (founder decision 2026-11-23): the promise, centred, in large type whose words
          darken one by one as it scrolls in. */}
      <ScrollProgress as="section" className="home-statement-block">
        <div className="home-band-inner">
          <p className="home-statement-big">
            <span className="home-statement-words">
              <ScrollWords text={t('osariya.body')} />
            </span>
          </p>
          <Link href="/shop" className="text-link">
            {t('shopNow')}
          </Link>
        </div>
      </ScrollProgress>

      {/* Three posters in one row, all the same width and height (founder
          decision 2026-11-24). Phones swipe. */}
      <section className="home-trio" aria-label={t('trio.label')}>
        <div className="home-trio-row">
          {trio.map((p) => (
            <div key={p.src} className="home-trio-item" style={{ '--pos': p.pos } as CSSProperties}>
              <Image src={p.src} alt={p.alt} width={p.width} height={p.height} unoptimized />
            </div>
          ))}
        </div>
      </section>

      {/* Top sell, after the posters (founder decision 2026-11-23). Streams in
          when ready; shows nothing while loading, so the page never jumps for
          a section the admin may have hidden. */}
      <Suspense fallback={null}>
        <Await promise={topSellP}>{renderTopSell}</Await>
      </Suspense>

    </>
  );
}
