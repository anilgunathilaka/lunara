'use client';

import { useState } from 'react';
import { Menu, Package, ShoppingBag, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { WhatsAppAction } from '@/components/layout/WhatsAppAction';
import { SlideOver } from '@/components/layout/SlideOver';
import { Accordion } from '@/components/layout/Accordion';
import { Button } from '@/components/primitives/Button';
import type { LanguageSelectorProps } from '@/components/layout/LanguageSelector';
import { whatsappLink } from '@/lib/commerce/business';

export interface LayoutQaClientProps {
  languageLabels: LanguageSelectorProps['labels'];
  navLabels: Record<'shop' | 'designYourOwn' | 'jacketMaterial' | 'support' | 'cart' | 'menu', string>;
  whatsappLabel: string;
  footerLabels: Record<'support' | 'returns' | 'careGuide' | 'shipping' | 'privacy' | 'terms', string>;
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
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="field-label">Footer</h2>
        <Footer
          supportLinks={[
            { href: '/', label: footerLabels.support },
            { href: '/', label: footerLabels.returns },
            { href: '/', label: footerLabels.careGuide },
            { href: '/', label: footerLabels.shipping },
          ]}
          policyLinks={[
            { href: '/', label: footerLabels.privacy },
            { href: '/', label: footerLabels.terms },
          ]}
          registrationNumber={registrationNumber}
          address={address}
          phone={phone}
          languageLabels={languageLabels}
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

      <WhatsAppAction href={whatsappLink()} label={whatsappLabel} variant="floating" />
    </div>
  );
}
