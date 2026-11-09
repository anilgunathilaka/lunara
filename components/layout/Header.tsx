import { ShoppingBag, UserRound } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';
import { Wordmark } from '@/components/brand/Wordmark';
import { LanguageSelector, type LanguageSelectorProps } from '@/components/layout/LanguageSelector';

export interface HeaderNavItem {
  href: string;
  label: string;
  /** Short visible text beside an icon, on wide screens. */
  text?: string;
}

export interface HeaderProps {
  /** docs/1-ux.md §1: "Five items maximum: Shop, Design Your Own, Jacket Material, Support, Cart." */
  shop: HeaderNavItem;
  /** Visually distinguished — the differentiator, must not read as one item among five. */
  designYourOwn?: HeaderNavItem;
  jacketMaterial: HeaderNavItem;
  support: HeaderNavItem;
  /** Sign in / My orders; staff land in the operations panel (app/[locale]/account/start). */
  account?: HeaderNavItem;
  cartHref: string;
  cartLabel: string;
  cartCount: number;
  languageLabels: LanguageSelectorProps['labels'];
  /** Short facts in the strip above the header (docs/2-ui.md §7.2). Phones show the first only. */
  announcement?: string[];
}

export function Header({
  shop,
  designYourOwn,
  jacketMaterial,
  support,
  account,
  cartHref,
  cartLabel,
  cartCount,
  languageLabels,
  announcement,
}: HeaderProps) {
  return (
    <>
      {announcement && announcement.length > 0 && (
        <div className="site-announcement">
          <ul className="site-announcement-list">
            {announcement.map((item) => (
              <li key={item} className="site-announcement-item">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
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
        {/* On mobile the language selector lives in the MobileNav "Menu" panel
            instead, to keep the compact header down to wordmark + cart. */}
        <LanguageSelector labels={languageLabels} className="hidden md:flex" />
        {account && (
          <Link href={account.href} className="site-header-cart focus-ring" aria-label={account.label}>
            <Icon icon={UserRound} />
            {account.text && <span className="site-header-account-text">{account.text}</span>}
          </Link>
        )}
        <Link href={cartHref} className="site-header-cart focus-ring" aria-label={cartLabel}>
          <Icon icon={ShoppingBag} />
          {cartCount > 0 && <span className="site-header-cart-count">{cartCount}</span>}
        </Link>
      </div>
    </header>
    </>
  );
}
