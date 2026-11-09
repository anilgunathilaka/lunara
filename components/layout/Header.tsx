import { ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';
import { Wordmark } from '@/components/brand/Wordmark';
import { LanguageSelector, type LanguageSelectorProps } from '@/components/layout/LanguageSelector';
import { WhatsAppAction } from '@/components/layout/WhatsAppAction';

export interface HeaderNavItem {
  href: string;
  label: string;
}

export interface HeaderProps {
  /** docs/1-ux.md §1: "Five items maximum: Shop, Design Your Own, Jacket Material, Support, Cart." */
  shop: HeaderNavItem;
  /** Visually distinguished — the differentiator, must not read as one item among five. */
  designYourOwn?: HeaderNavItem;
  jacketMaterial: HeaderNavItem;
  support: HeaderNavItem;
  cartHref: string;
  cartLabel: string;
  cartCount: number;
  whatsappHref: string;
  whatsappLabel: string;
  languageLabels: LanguageSelectorProps['labels'];
}

export function Header({
  shop,
  designYourOwn,
  jacketMaterial,
  support,
  cartHref,
  cartLabel,
  cartCount,
  whatsappHref,
  whatsappLabel,
  languageLabels,
}: HeaderProps) {
  return (
    <header className="site-header">
      <Link href="/" aria-label="Lunara Sarees">
        <Wordmark />
      </Link>

      <nav className="site-header-nav hidden md:flex" aria-label="Primary">
        <Link href={shop.href} className="site-header-link">
          {shop.label}
        </Link>
        {designYourOwn && (
          <Link href={designYourOwn.href} className="site-header-link site-header-link-featured">
            {designYourOwn.label}
          </Link>
        )}
        <Link href={jacketMaterial.href} className="site-header-link">
          {jacketMaterial.label}
        </Link>
        <Link href={support.href} className="site-header-link">
          {support.label}
        </Link>
      </nav>

      <div className="site-header-actions">
        <WhatsAppAction href={whatsappHref} label={whatsappLabel} variant="inline" />
        {/* On mobile the language selector lives in the MobileNav "Menu" panel
            instead, to keep the compact header down to wordmark + cart. */}
        <LanguageSelector labels={languageLabels} className="hidden md:flex" />
        <Link href={cartHref} className="site-header-cart" aria-label={cartLabel}>
          <Icon icon={ShoppingBag} />
          {cartCount > 0 && <span className="site-header-cart-count">{cartCount}</span>}
        </Link>
      </div>
    </header>
  );
}
