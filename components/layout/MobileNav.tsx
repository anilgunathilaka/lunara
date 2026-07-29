'use client';

import type { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';
import { cn } from '@/lib/utils';

export interface MobileNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface MobileNavProps {
  shop: MobileNavItem;
  design: MobileNavItem;
  cart: MobileNavItem;
  cartCount?: number;
  /** Opens the secondary menu (Jacket Material, Support, language) — a SlideOver, typically. */
  onMenuOpen: () => void;
  menuLabel: string;
  menuIcon: LucideIcon;
  activeHref: string;
}

/** docs/3-components.md §6.2 — persistent bottom bar across all pages. */
export function MobileNav({
  shop,
  design,
  cart,
  cartCount,
  onMenuOpen,
  menuLabel,
  menuIcon: MenuIcon,
  activeHref,
}: MobileNavProps) {
  return (
    <nav className="mobile-nav md:hidden" aria-label="Primary">
      {[shop, design, cart].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn('mobile-nav-item', item.href === activeHref && 'mobile-nav-item-active')}
        >
          <span className="mobile-nav-icon-wrap">
            <Icon icon={item.icon} size="touch" />
            {item === cart && cartCount ? (
              <span className="mobile-nav-badge">{cartCount}</span>
            ) : null}
          </span>
          <span className="mobile-nav-label">{item.label}</span>
        </Link>
      ))}
      <button type="button" className="mobile-nav-item" onClick={onMenuOpen}>
        <Icon icon={MenuIcon} size="touch" />
        <span className="mobile-nav-label">{menuLabel}</span>
      </button>
    </nav>
  );
}
