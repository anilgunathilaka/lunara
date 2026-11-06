import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { fontVariableClassName } from '@/lib/fonts';
import { SiteChrome } from '@/components/layout/SiteChrome';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Lunara Sarees',
  description:
    'Premium Sri Lankan cotton sarees with unstitched jacket material. See it before you wear it.',
  icons: {
    icon: [{ url: '/images/lunra-favicon.webp', type: 'image/webp' }],
    apple: [{ url: '/images/lunra-favicon.webp', type: 'image/webp' }],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('layout.nav');
  const tLayout = await getTranslations('layout');
  const tHeader = await getTranslations('layout.header');
  const tFooter = await getTranslations('layout.footer');
  const tSlideover = await getTranslations('layout.slideover');
  const tPayment = await getTranslations('commerce.payment');

  const languageLabels = {
    en: tCommon('languageEnglish'),
    si: tCommon('languageSinhala'),
    ta: tCommon('languageTamil'),
  };

  return (
    <html lang={locale} className={fontVariableClassName}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SiteChrome
            languageLabels={languageLabels}
            navLabels={{
              shop: tNav('shop'),
              designYourOwn: tNav('designYourOwn'),
              jacketMaterial: tNav('jacketMaterial'),
              support: tNav('support'),
              cart: tNav('cart'),
              menu: tNav('menu'),
            }}
            closeLabel={tSlideover('close')}
            whatsappHref="https://wa.me/94000000000"
            whatsappLabel={tLayout('whatsapp')}
            headerTopBar={{
              promo: tHeader('promo'),
              promoHref: '/shop',
              promoCta: tHeader('promoCta'),
              shipping: { href: '/support/shipping', label: tFooter('shipping') },
              support: { href: '/support', label: tFooter('support') },
            }}
            footerUsefulLinks={[
              { href: '/shop', label: tNav('shop') },
              { href: '/design-your-own', label: tNav('designYourOwn') },
              { href: '/jacket-material', label: tNav('jacketMaterial') },
              { href: '/cart', label: tNav('cart') },
              { href: '/support', label: tNav('support') },
            ]}
            footerSupportLinks={[
              { href: '/support', label: tFooter('support') },
              { href: '/support/returns', label: tFooter('returns') },
              { href: '/support/care-guide', label: tFooter('careGuide') },
              { href: '/support/shipping', label: tFooter('shipping') },
            ]}
            footerPolicyLinks={[
              { href: '/policies/privacy', label: tFooter('privacy') },
              { href: '/policies/terms', label: tFooter('terms') },
            ]}
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
          >
            {children}
          </SiteChrome>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
