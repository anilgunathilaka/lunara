import { ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';
import { Wordmark } from '@/components/brand/Wordmark';
import { LanguageSelector, type LanguageSelectorProps } from '@/components/layout/LanguageSelector';

export interface HeaderNavItem {
  href: string;
  label: string;
}

export interface HeaderProps {
  /** docs/1-ux.md §1: "Five items maximum: Shop, Design Your Own, Jacket Material, Support, Cart." */
  shop: HeaderNavItem;
  /** Visually distinguished — the differentiator, must not read as one item among five. */
  designYourOwn: HeaderNavItem;
  jacketMaterial: HeaderNavItem;
  support: HeaderNavItem;
  cartHref: string;
  cartLabel: string;
  cartCount: number;
  languageLabels: LanguageSelectorProps['labels'];
  /** Top utility bar — trust line + secondary links (Jolie-style structure). */
  topBar: {
    promo: string;
    promoHref: string;
    promoCta: string;
    shipping: HeaderNavItem;
    support: HeaderNavItem;
  };
}

/**
 * Two-tier header: utility bar scrolls away; main nav sticks to the viewport.
 * WhatsApp lives as a floating FAB (SiteChrome), not in the header actions.
 */
export function Header({
  shop,
  designYourOwn,
  jacketMaterial,
  support,
  cartHref,
  cartLabel,
  cartCount,
  languageLabels,
  topBar,
}: HeaderProps) {
  return (
    <>
      <div className="site-header-top">
        <div className="site-header-top-inner">
          <p className="site-header-promo">
            {topBar.promo}{' '}
            <Link href={topBar.promoHref} className="site-header-promo-cta">
              {topBar.promoCta}
            </Link>
          </p>
          <div className="site-header-top-actions">
            <Link href={topBar.shipping.href} className="site-header-top-link hidden sm:inline">
              {topBar.shipping.label}
            </Link>
            <Link href={topBar.support.href} className="site-header-top-link hidden sm:inline">
              {topBar.support.label}
            </Link>
            {/* Language lives in the top bar on desktop; MobileNav menu on small screens. */}
            <LanguageSelector labels={languageLabels} className="site-header-top-language" />
          </div>
        </div>
      </div>

      <header className="site-header-main">
        <div className="site-header-main-inner">
          <Link href="/" className="site-header-logo">
            <Wordmark priority />
          </Link>

          <nav className="site-header-nav hidden md:flex" aria-label="Primary">
            <Link href={shop.href} className="site-header-link">
              {shop.label}
            </Link>
            <Link href={jacketMaterial.href} className="site-header-link">
              {jacketMaterial.label}
            </Link>
            <Link href={support.href} className="site-header-link">
              {support.label}
            </Link>
          </nav>

          <div className="site-header-actions">
            <Link
              href={designYourOwn.href}
              className="btn focus-ring btn-sm site-header-cta hidden md:inline-flex"
            >
              {designYourOwn.label}
            </Link>
            <Link href={cartHref} className="site-header-cart" aria-label={cartLabel}>
              <Icon icon={ShoppingBag} size="touch" />
              {cartCount > 0 && <span className="site-header-cart-count">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
