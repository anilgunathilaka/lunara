'use client';

import { useState } from 'react';
import { Menu, Package, ShoppingBag, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Header, type HeaderMegaMenu } from '@/components/layout/Header';
import type { AnnouncementBarProps } from '@/components/layout/AnnouncementBar';
import { Footer, type FooterLink, type FooterProps } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { WhatsAppAction } from '@/components/layout/WhatsAppAction';
import { SlideOver } from '@/components/layout/SlideOver';
import { LanguageSelector, type LanguageSelectorProps } from '@/components/layout/LanguageSelector';
import { Link, usePathname } from '@/i18n/navigation';
import { CartProvider, useCart } from '@/lib/cart/CartContext';
import { FEATURES } from '@/lib/features';

export interface SiteChromeProps {
  languageLabels: LanguageSelectorProps['labels'];
  navLabels: Record<'shop' | 'designYourOwn' | 'jacketMaterial' | 'support' | 'account' | 'accountShort' | 'cart' | 'menu', string>;
  closeLabel: string;
  whatsappHref: string;
  whatsappLabel: string;
  footerSupportLinks: FooterLink[];
  footerPolicyLinks: FooterLink[];
  footerHeadings: FooterProps['headings'];
  footerTrust: FooterProps['trust'];
  registrationNumber: string;
  address: string;
  phone: string;
  /** Facts for the strip above the header. */
  announcement?: AnnouncementBarProps;
  /** Panels under Shop and Support (docs/2-ui.md §7.2). */
  menus?: { shop?: HeaderMegaMenu; support?: HeaderMegaMenu };
  children: ReactNode;
}

/**
 * Persistent site chrome — Header, Footer, MobileNav, WhatsAppAction —
 * present on every page per docs/1-ux.md §2.2 nav rules ("Cart persistence",
 * "WhatsApp affordance ... reachable from every page", "Language selector
 * ... present in the header on every page"). Lives above {children} in
 * app/[locale]/layout.tsx rather than per-page, so no page has to remember
 * to wire it in.
 */
export function SiteChrome(props: SiteChromeProps) {
  return (
    <CartProvider>
      <SiteChromeInner {...props} />
    </CartProvider>
  );
}

function SiteChromeInner({
  languageLabels,
  navLabels,
  closeLabel,
  whatsappHref,
  whatsappLabel,
  footerSupportLinks,
  footerPolicyLinks,
  footerHeadings,
  footerTrust,
  registrationNumber,
  address,
  phone,
  announcement,
  menus,
  children,
}: SiteChromeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();

  // The operations panel has its own frame (app/[locale]/ops/OpsChrome.tsx):
  // none of the store's header, footer, bars or WhatsApp button there.
  if (pathname === '/ops' || pathname.startsWith('/ops/')) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only">
        {navLabels.menu}
      </a>

      <Header
        shop={{ href: '/shop', label: navLabels.shop, menu: menus?.shop }}
        designYourOwn={FEATURES.designYourOwn ? { href: '/design-your-own', label: navLabels.designYourOwn } : undefined}
        jacketMaterial={{ href: '/jacket-material', label: navLabels.jacketMaterial }}
        support={{ href: '/support', label: navLabels.support, menu: menus?.support }}
        account={{ href: '/account/start', label: navLabels.account, text: navLabels.accountShort }}
        cartHref="/cart"
        cartLabel={navLabels.cart}
        cartCount={itemCount}
        languageLabels={languageLabels}
        announcement={announcement}
      />

      {/* .site-content reserves space at the end of the scroll area for the
          fixed MobileNav bar, so Footer content isn't left hidden beneath
          it — padding on <main> alone wouldn't reach past Footer, which
          follows it in normal flow. */}
      <div className="site-content flex flex-1 flex-col">
        <main id="main-content" className="flex-1">
          {children}
        </main>

        <Footer
          supportLinks={footerSupportLinks}
          policyLinks={footerPolicyLinks}
          headings={footerHeadings}
          trust={footerTrust}
          whatsapp={{ href: whatsappHref, label: whatsappLabel }}
          registrationNumber={registrationNumber}
          address={address}
          phone={phone}
          languageLabels={languageLabels}
        />
      </div>

      <MobileNav
        shop={{ href: '/shop', label: navLabels.shop, icon: ShoppingBag }}
        design={FEATURES.designYourOwn ? { href: '/design-your-own', label: navLabels.designYourOwn, icon: Sparkles } : undefined}
        cart={{ href: '/cart', label: navLabels.cart, icon: Package }}
        cartCount={itemCount}
        onMenuOpen={() => setMenuOpen(true)}
        menuLabel={navLabels.menu}
        menuIcon={Menu}
        activeHref={pathname}
      />
      <SlideOver
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={navLabels.menu}
        closeLabel={closeLabel}
      >
        <nav className="flex flex-col gap-4">
          <Link href="/shop" className="site-header-link" onClick={() => setMenuOpen(false)}>
            {navLabels.shop}
          </Link>
          <Link href="/jacket-material" className="site-header-link" onClick={() => setMenuOpen(false)}>
            {navLabels.jacketMaterial}
          </Link>
          <Link href="/support" className="site-header-link" onClick={() => setMenuOpen(false)}>
            {navLabels.support}
          </Link>
          <Link href="/account/start" className="site-header-link" onClick={() => setMenuOpen(false)}>
            {navLabels.accountShort}
          </Link>
          <LanguageSelector labels={languageLabels} />
        </nav>
      </SlideOver>

      <WhatsAppAction href={whatsappHref} label={whatsappLabel} variant="floating" />
    </div>
  );
}
