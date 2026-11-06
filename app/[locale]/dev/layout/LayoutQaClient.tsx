'use client';

import { useState } from 'react';
import { Menu, Package, ShoppingBag, Sparkles } from 'lucide-react';
import { Header, type HeaderProps } from '@/components/layout/Header';
import { Footer, type FooterProps } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { WhatsAppAction } from '@/components/layout/WhatsAppAction';
import { SlideOver } from '@/components/layout/SlideOver';
import { Accordion } from '@/components/layout/Accordion';
import { Button } from '@/components/primitives/Button';
import type { LanguageSelectorProps } from '@/components/layout/LanguageSelector';

export interface LayoutQaClientProps {
  languageLabels: LanguageSelectorProps['labels'];
  navLabels: Record<'shop' | 'designYourOwn' | 'jacketMaterial' | 'support' | 'cart' | 'menu', string>;
  whatsappLabel: string;
  headerTopBar: HeaderProps['topBar'];
  footerLinkLabels: Record<'support' | 'returns' | 'careGuide' | 'shipping' | 'privacy' | 'terms', string>;
  footerLabels: FooterProps['labels'];
  registrationNumber: string;
  address: string;
  phone: string;
  slideoverAddedTitle: string;
  slideoverClose: string;
  accordionItems: { id: string; title: string; content: string }[];
}

export function LayoutQaClient({
  languageLabels,
  navLabels,
  whatsappLabel,
  headerTopBar,
  footerLinkLabels,
  footerLabels,
  registrationNumber,
  address,
  phone,
  slideoverAddedTitle,
  slideoverClose,
  accordionItems,
}: LayoutQaClientProps) {
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h2 className="field-label">Header</h2>
        <div className="rounded-[var(--radius-m)] border" style={{ borderColor: 'var(--lun-line)' }}>
          <Header
            shop={{ href: '/', label: navLabels.shop }}
            designYourOwn={{ href: '/', label: navLabels.designYourOwn }}
            jacketMaterial={{ href: '/', label: navLabels.jacketMaterial }}
            support={{ href: '/', label: navLabels.support }}
            cartHref="/dev/cart"
            cartLabel={navLabels.cart}
            cartCount={2}
            languageLabels={languageLabels}
            topBar={headerTopBar}
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="field-label">Footer</h2>
        <Footer
          usefulLinks={[
            { href: '/', label: navLabels.shop },
            { href: '/', label: navLabels.designYourOwn },
            { href: '/', label: navLabels.jacketMaterial },
            { href: '/', label: navLabels.cart },
            { href: '/', label: navLabels.support },
          ]}
          supportLinks={[
            { href: '/', label: footerLinkLabels.support },
            { href: '/', label: footerLinkLabels.returns },
            { href: '/', label: footerLinkLabels.careGuide },
            { href: '/', label: footerLinkLabels.shipping },
          ]}
          policyLinks={[
            { href: '/', label: footerLinkLabels.privacy },
            { href: '/', label: footerLinkLabels.terms },
          ]}
          registrationNumber={registrationNumber}
          address={address}
          phone={phone}
          whatsappHref="https://wa.me/94000000000"
          whatsappLabel={whatsappLabel}
          languageLabels={languageLabels}
          labels={footerLabels}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="field-label">SlideOver &amp; Accordion (open below)</h2>
        <Button onClick={() => setSlideOverOpen(true)}>Open add-to-cart SlideOver</Button>
        <SlideOver
          open={slideOverOpen}
          onClose={() => setSlideOverOpen(false)}
          title={slideoverAddedTitle}
          closeLabel={slideoverClose}
        >
          <Accordion
            items={accordionItems.map((item) => ({
              id: item.id,
              title: item.title,
              content: item.content,
            }))}
          />
        </SlideOver>
      </section>

      {/* MobileNav is fixed to the viewport bottom and only shows below md. */}
      <MobileNav
        shop={{ href: '/dev/layout', label: navLabels.shop, icon: ShoppingBag }}
        design={{ href: '/dev/layout', label: navLabels.designYourOwn, icon: Sparkles }}
        cart={{ href: '/dev/cart', label: navLabels.cart, icon: Package }}
        cartCount={2}
        onMenuOpen={() => setMenuOpen(true)}
        menuLabel={navLabels.menu}
        menuIcon={Menu}
        activeHref="/dev/layout"
      />
      <SlideOver
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={navLabels.menu}
        closeLabel={slideoverClose}
      >
        <p className="field-message">{navLabels.jacketMaterial}</p>
        <p className="field-message">{navLabels.support}</p>
      </SlideOver>

      <WhatsAppAction href="https://wa.me/94000000000" label={whatsappLabel} variant="floating" />
    </div>
  );
}
