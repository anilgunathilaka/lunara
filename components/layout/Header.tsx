'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, FocusEvent, KeyboardEvent } from 'react';
import Image from 'next/image';
import { ChevronDown, ShoppingBag, UserRound } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';
import { Wordmark } from '@/components/brand/Wordmark';
import { LanguageSelector, type LanguageSelectorProps } from '@/components/layout/LanguageSelector';
import { AnnouncementBar, type AnnouncementBarProps } from '@/components/layout/AnnouncementBar';
import { cn } from '@/lib/utils';

export interface HeaderMenuLink {
  href: string;
  label: string;
  /** Opens outside the site (WhatsApp). */
  external?: boolean;
}

/** The panel that opens under a header item (docs/2-ui.md §7.2). */
export interface HeaderMegaMenu {
  /** Names the panel and its toggle for screen readers: "Shop menu". */
  label: string;
  columns: { heading: string; links: HeaderMenuLink[] }[];
  promo?: { title: string; cta: string; href: string };
}

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
  jacketMaterial: HeaderNavItem;
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
  // The strip and the header stay at the top together; once the page has
  // moved, a hairline settles under the header.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={cn('site-header-group', scrolled && 'is-scrolled')}>
      {announcement && <AnnouncementBar {...announcement} />}
      <header className="site-header">
        <Link href="/" aria-label="Lunara Sarees" className="site-header-logo">
          <Wordmark />
        </Link>

        <nav className="site-header-nav hidden md:flex" aria-label="Primary">
          <NavItem item={shop} />
          {designYourOwn && (
            <Link href={designYourOwn.href} className="site-header-link site-header-link-featured">
              {designYourOwn.label}
            </Link>
          )}
          <NavItem item={jacketMaterial} />
          <NavItem item={support} />
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
    </div>
  );
}

/**
 * A header link, and — when it has a menu — the panel beneath the header.
 * The pointer opens it on hover; the keyboard opens it with the chevron
 * button beside the link (a disclosure, so the link itself still just
 * goes to its page). Escape closes it and returns focus to the chevron.
 */
function NavItem({ item }: { item: HeaderNavItem }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = item.menu;

  if (!menu) {
    return (
      <Link href={item.href} className="site-header-link">
        {item.label}
      </Link>
    );
  }

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      toggle.current?.focus();
    }
  };
  const close = () => setOpen(false);

  return (
    <div
      className={cn('site-header-item', open && 'is-open')}
      onPointerEnter={(event) => event.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && setOpen(false)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <Link href={item.href} className="site-header-link" onClick={close}>
        {item.label}
      </Link>
      <button
        ref={toggle}
        type="button"
        className="site-header-toggle focus-ring"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={menu.label}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon icon={ChevronDown} size="inline" />
      </button>

      <div id={panelId} className="site-mega" role="region" aria-label={menu.label}>
        <div className="site-mega-columns">
          {menu.columns.map((column, c) => (
            <div key={column.heading} className="site-mega-column">
              <p className="site-mega-heading" style={{ '--i': c } as CSSProperties}>
                {column.heading}
              </p>
              <ul className="site-mega-list">
                {column.links.map((link, l) =>
                  link.external ? (
                    <li key={link.label} style={{ '--i': c + l + 1 } as CSSProperties}>
                      <a href={link.href} className="site-mega-link" target="_blank" rel="noopener noreferrer" onClick={close}>
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.label} style={{ '--i': c + l + 1 } as CSSProperties}>
                      <Link href={link.href} className="site-mega-link" onClick={close}>
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
        {menu.promo && (
          <Link href={menu.promo.href} className="site-mega-promo" onClick={close}>
            <Image src="/brand/lunara-emblem.webp" alt="" width={128} height={128} className="site-mega-promo-emblem" unoptimized />
            <span className="site-mega-promo-title">{menu.promo.title}</span>
            <span className="site-mega-promo-cta">{menu.promo.cta}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
