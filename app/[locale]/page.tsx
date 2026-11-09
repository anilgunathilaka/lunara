import Image from 'next/image';
import { Camera, MessageCircle, RotateCcw, Truck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { MotifDivider } from '@/components/brand/MotifDivider';
import { ProductCard } from '@/components/product/ProductCard';
import { getCuratedListings } from '@/lib/catalogue/queries';
import { latestReviews } from '@/lib/reviews/reviews';
import { ReviewList } from '@/components/reviews/ReviewList';
import { whatsappLink } from '@/lib/commerce/business';
import { FEATURES } from '@/lib/features';
import { HeroShowcase, type HeroSlide } from '@/components/home/HeroShowcase';

// Rendered per request: "New arrivals" shows live price and stock
// (docs/4-architecture.md §3.3).
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Parallel: each read is a round trip to the database.
  const [arrivals, reviews] = await Promise.all([getCuratedListings({ featuredOnly: true, limit: 6 }), latestReviews(3)]);
  const t = await getTranslations('home');
  const tFabric = await getTranslations('product.fabric');
  const tStock = await getTranslations('product.stock');
  const tDrape = await getTranslations('configurator.drape');

  const formatLeft = (count: number) => tStock('left', { count });
  const materialLabel = { plain: tFabric('materialPlain'), super: tFabric('materialSuper') };

  // The headline in two lines: the first half of its words, then the rest.
  const words = t('hero.headline').split(' ');
  const split = Math.ceil(words.length / 2);
  const headlineLines = words.length > 1 ? [words.slice(0, split).join(' '), words.slice(split).join(' ')] : words;

  // Featured sarees for the showcase; until there are any, the hero photograph.
  const heroSlides: HeroSlide[] =
    arrivals.length > 0
      ? arrivals.slice(0, 5).map((item) => ({
          href: `/shop/${item.id}`,
          image: { src: item.imageUrl, alt: item.name },
          title: item.name,
          caption: materialLabel[item.material],
        }))
      : [{ href: '/shop', image: { src: '/placeholder/hero.jpg', alt: t('hero.headline') }, title: t('hero.shopCurated') }];

  return (
    <>
      {/* Hero (docs/1-ux.md §4.1; motion per docs/2-ui.md §7.2): the promise
          set very large, then featured sarees in a wide showcase. The two
          doors (curated shop / configurator) keep equal visual weight. */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-top">
            <h1 className="home-hero-headline">
              {headlineLines.map((line, i) => (
                <span key={i} className={`hero-mask home-hero-line home-hero-line-${i + 1}`}>
                  <span className="hero-rise">{line}</span>
                </span>
              ))}
            </h1>
            <div className="home-hero-aside">
              <p className="home-hero-subhead">{t('hero.subhead')}</p>
              <div className="home-hero-doors">
                <Link href="/shop" className="btn focus-ring btn-primary btn-lg">
                  {t('hero.shopCurated')}
                </Link>
                {FEATURES.designYourOwn && (
                  <Link href="/design-your-own" className="btn focus-ring btn-secondary btn-lg">
                    {t('hero.designYourOwn')}
                  </Link>
                )}
              </div>
            </div>
          </div>
          <HeroShowcase
            slides={heroSlides}
            labels={{
              region: t('hero.slider.region'),
              previous: t('hero.slider.previous'),
              next: t('hero.slider.next'),
              pause: t('hero.slider.pause'),
              play: t('hero.slider.play'),
              slideOf: heroSlides.map((_, i) => t('hero.slider.slideOf', { n: i + 1, total: heroSlides.length })),
              view: t('hero.slider.view'),
            }}
          />
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
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="home-trust-item">
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

      {/* Proof — verified customer photo reviews (FR-46), newest first and
          never filtered by rating. Until the first one exists, this says so
          plainly rather than inventing a name and a quote. */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="home-section-header">
            <div>
              <SectionMarker />
              <h2 className="home-section-title">{t('proof.heading')}</h2>
            </div>
          </div>
          {reviews.length > 0 ? (
            <div style={{ marginTop: 'var(--space-5)', maxWidth: '68ch' }}>
              <ReviewList reviews={reviews} showItem />
            </div>
          ) : (
            <div className="home-proof-placeholder">
              <p>{t('proof.placeholderNote')}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
