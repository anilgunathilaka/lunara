import { getTranslations } from 'next-intl/server';
import { LayoutQaClient } from './LayoutQaClient';

/**
 * Internal QA scratch page for Header, Footer, MobileNav, WhatsAppAction,
 * SlideOver and Accordion (docs/3-components.md §6.2). Not part of the
 * shipped product surface — delete or gate behind an env check before
 * launch.
 *
 * registrationNumber/address/phone below are placeholders — real
 * business registration and contact details are an explicit open founder
 * decision (docs/0-prd.md "Business registration and published contact
 * details | Founder | Before Phase 1 launch"), never fabricated here.
 */
export default async function LayoutQaPage() {
  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('layout.nav');
  const tLayout = await getTranslations('layout');
  const tFooter = await getTranslations('layout.footer');
  const tHeader = await getTranslations('layout.header');
  const tSlideover = await getTranslations('layout.slideover');
  const tAccordion = await getTranslations('layout.accordion');
  const tPayment = await getTranslations('commerce.payment');

  return (
    <main className="flex flex-col gap-8 pb-24">
      <div className="p-6">
        <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
          Layout components — QA
        </h1>
      </div>

      <div className="px-6">
        <LayoutQaClient
          languageLabels={{
            en: tCommon('languageEnglish'),
            si: tCommon('languageSinhala'),
            ta: tCommon('languageTamil'),
          }}
          navLabels={{
            shop: tNav('shop'),
            designYourOwn: tNav('designYourOwn'),
            jacketMaterial: tNav('jacketMaterial'),
            support: tNav('support'),
            cart: tNav('cart'),
            menu: tNav('menu'),
          }}
          whatsappLabel={tLayout('whatsapp')}
          headerTopBar={{
            promo: tHeader('promo'),
            promoHref: '/shop',
            promoCta: tHeader('promoCta'),
            shipping: { href: '/support/shipping', label: tFooter('shipping') },
            support: { href: '/support', label: tFooter('support') },
          }}
          footerLinkLabels={{
            support: tFooter('support'),
            returns: tFooter('returns'),
            careGuide: tFooter('careGuide'),
            shipping: tFooter('shipping'),
            privacy: tFooter('privacy'),
            terms: tFooter('terms'),
          }}
          footerLabels={{
            usefulLinksHeading: tFooter('usefulLinksHeading'),
            customerServiceHeading: tFooter('customerServiceHeading'),
            newsletterHeading: tFooter('newsletterHeading'),
            newsletterBody: tFooter('newsletterBody'),
            newsletterEmailLabel: tFooter('newsletterEmailLabel'),
            newsletterPlaceholder: tFooter('newsletterPlaceholder'),
            newsletterSubscribe: tFooter('newsletterSubscribe'),
            newsletterThanks: tFooter('newsletterThanks'),
            newsletterDisclaimer: tFooter('newsletterDisclaimer'),
            copyright: tFooter('copyright'),
            backToTop: tFooter('backToTop'),
            paymentsHeading: tFooter('paymentsHeading'),
            paymentBank: tPayment('bankTransfer'),
            paymentCod: tPayment('cod'),
            paymentLankaQr: tPayment('lankaqr'),
            paymentCard: tPayment('card'),
          }}
          registrationNumber="Business Reg. No. [placeholder — pending founder input]"
          address="[Address placeholder — pending founder input]"
          phone="[Phone placeholder — pending founder input]"
          slideoverAddedTitle={tSlideover('addedTitle')}
          slideoverClose={tSlideover('close')}
          accordionItems={[
            { id: 'shipping', title: tAccordion('shipping'), content: tAccordion('shippingContent') },
            { id: 'care', title: tAccordion('care'), content: tAccordion('careContent') },
            { id: 'returns', title: tAccordion('returns'), content: tAccordion('returnsContent') },
          ]}
        />
      </div>
    </main>
  );
}
