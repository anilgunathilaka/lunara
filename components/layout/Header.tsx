'use client';

import { useEffect, useRef, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';
import { Wordmark } from '@/components/brand/Wordmark';
import { AccountMenu } from '@/components/account/AccountMenu';
import { LanguageSelector, type LanguageSelectorProps } from '@/components/layout/LanguageSelector';
import { AnnouncementBar, type AnnouncementBarProps } from '@/components/layout/AnnouncementBar';
import { NavItem, type HeaderMegaMenu } from '@/components/layout/MegaMenu';
import { cn } from '@/lib/utils';

export type { HeaderMegaMenu, HeaderMenuCategory, HeaderMenuImage, HeaderMenuLink } from '@/components/layout/MegaMenu';

export interface HeaderNavItem {
  href: string;
  label: string;
  /** Short visible text beside an icon, on wide screens. */
  text?: string;
  menu?: HeaderMegaMenu;
}

export interface HeaderProps {
  /** docs/1-ux.md §1: "Five items maximum: Shop, Design Your Own, Jacket Material, Support, Cart." */
  shop: HeaderNavItem;
  /** Visually distinguished — the differentiator, must not read as one item among five. */
  designYourOwn?: HeaderNavItem;
  /** Omitted while the Jacket Material pages are switched off (lib/features.ts). */
  jacketMaterial?: HeaderNavItem;
  support: HeaderNavItem;
  /** Sign in / My orders; staff land in the operations panel (app/[locale]/account/start). */
  account?: HeaderNavItem;
  cartHref: string;
  cartLabel: string;
  cartCount: number;
  languageLabels: LanguageSelectorProps['labels'];
  /** Facts in the strip above the header, one at a time (docs/2-ui.md §7.2). */
  announcement?: AnnouncementBarProps;
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
  // After ccopadel.com (founder decision 2026-11-23): once the page has moved
  // the header floats as a rounded white bar; it slips away while the
  // customer scrolls down and comes back the moment they scroll up. It never
  // hides while a menu is open or anything in it has keyboard focus.
  const groupRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const group = groupRef.current;
      const busy = !!group && (group.matches(':focus-within') || !!group.querySelector('.site-header-item.is-open'));
      setScrolled(y > 0);
      if (busy || y < (group?.offsetHeight ?? 0)) setHidden(false);
      else if (Math.abs(y - last) > 4) setHidden(y > last);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={groupRef}
      className={cn('site-header-group', scrolled && 'is-scrolled', hidden && 'is-hidden')}
      onFocus={() => setHidden(false)}
    >
      {announcement && <AnnouncementBar {...announcement} />}
      <header className="site-header">
        <Link href="/" aria-label="Lunara Sarees" className="site-header-logo">
          <Wordmark />
        </Link>

        <nav className="site-header-nav hidden md:flex" aria-label="Primary">
          <NavItem href={shop.href} label={shop.label} menu={shop.menu} />
          {designYourOwn && (
            <Link href={designYourOwn.href} className="site-header-link site-header-link-featured">
              {designYourOwn.label}
            </Link>
          )}
          {jacketMaterial && <NavItem href={jacketMaterial.href} label={jacketMaterial.label} menu={jacketMaterial.menu} />}
          <NavItem href={support.href} label={support.label} menu={support.menu} />
        </nav>

        <div className="site-header-actions">
          {/* On mobile the language selector lives in the MobileNav "Menu" panel
              instead, to keep the compact header down to wordmark + cart. */}
          <LanguageSelector labels={languageLabels} className="hidden md:flex" />
          {/* Signed out: the sign-in link. Signed in: avatar menu (founder decision 2026-11-24). */}
          {account && <AccountMenu href={account.href} label={account.label} text={account.text} />}
          <Link href={cartHref} className="site-header-cart focus-ring" aria-label={cartLabel}>
            <Icon icon={ShoppingBag} />
            {cartCount > 0 && <span className="site-header-cart-count">{cartCount}</span>}
          </Link>
        </div>
      </header>
    </div>
  );
}
