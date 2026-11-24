import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { fontVariableClassName } from '@/lib/fonts';
import { SiteChrome } from '@/components/layout/SiteChrome';
import '../globals.css';
import { whatsappLink } from '@/lib/commerce/business';
import { HERO_BANNERS } from '@/lib/home/hero';
import { FEATURES } from '@/lib/features';
import { BRAND, DEFAULT_SHARE_IMAGE, SITE_URL } from '@/lib/seo/meta';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Site-wide SEO defaults (founder decision 2026-11-24): every page's title
 * ends "| Lunara Sarees"; pages set their own title, description,
 * canonical address, hreflang links and share card (lib/seo/meta.ts).
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: BRAND,
    title: { default: t('siteTitle'), template: `%s | ${BRAND}` },
    description: t('siteDescription'),
    openGraph: { siteName: BRAND, type: 'website', images: [{ url: DEFAULT_SHARE_IMAGE }] },
    twitter: { card: 'summary_large_image' },
    // Phone numbers are links only where we make them links (Contact page).
    formatDetection: { telephone: false },
  };
}

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
  // Static rendering: tell next-intl the locale from the route param, so it
  // never has to read request headers (which would force dynamic rendering
  // and cost Worker CPU on every view — docs/4-architecture.md §2.3).
  setRequestLocale(locale);

  const messages = await getMessages();

  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('layout.nav');
  const tLayout = await getTranslations('layout');
  const tFooter = await getTranslations('layout.footer');
  const tSlideover = await getTranslations('layout.slideover');
  const tMenu = await getTranslations('layout.menu');
  const tAnnouncement = await getTranslations('layout.announcement');
  const tJacket = await getTranslations('product.jacket');
  const tTrust = await getTranslations('home.trust');
  const tOsariya = await getTranslations('home.osariya');

  const tHome = await getTranslations('home');
  const tJacketPage = await getTranslations('jacketPage');
  const tSupport = await getTranslations('support');
  const tAccordion = await getTranslations('layout.accordion');

  // Photographs on the right of the menu panels: the founder's banner and,
  // until real product photographs exist, the placeholder.
  const menuMedia = [
    { src: HERO_BANNERS[0]!.src, alt: '', unoptimized: true },
    { src: '/placeholder/product.jpg', alt: '' },
  ];
  const menuFoot = { text: tHome('hero.headline'), cta: { href: '/shop', label: tMenu('promoCta') } };
  const menus = {
    shop: {
      label: tMenu('open', { label: tNav('shop') }),
      media: menuMedia,
      foot: menuFoot,
      categories: [
        {
          label: tMenu('shopAll'),
          href: '/shop',
          tag: tNav('shop'),
          description: tHome('hero.subhead'),
        },
        {
          label: tOsariya('heading'),
          href: '/shop',
          tag: tNav('shop'),
          description: tOsariya('body'),
        },
        // Jacket material is not sold on its own (PRD v4.1): no menu entry while its pages are off.
        ...(FEATURES.jacketMaterialPage
          ? [
              {
                label: tNav('jacketMaterial'),
                href: '/jacket-material',
                tag: tJacket('shipsUnstitched'),
                description: tJacketPage('standaloneNote'),
                links: [{ href: '/support', label: tSupport('jacketStitchingHeading') }],
              },
            ]
          : []),
      ],
    },
    support: {
      label: tMenu('open', { label: tNav('support') }),
      media: menuMedia,
      foot: { text: tTrust('whatsapp'), cta: { href: whatsappLink(), label: tLayout('whatsapp'), external: true } },
      categories: [
        {
          label: tAccordion('shipping'),
          href: '/support/shipping',
          tag: tNav('support'),
          description: tAccordion('shippingContent'),
        },
        {
          label: tAccordion('returns'),
          href: '/support/returns',
          tag: tNav('support'),
          description: tAccordion('returnsContent'),
        },
        {
          label: tAccordion('care'),
          href: '/support/care-guide',
          tag: tNav('support'),
          description: tAccordion('careContent'),
        },
        {
          label: tSupport('contactHeading'),
          href: '/support',
          tag: tNav('support'),
          description: tSupport('contactBody'),
          links: [{ href: whatsappLink(), label: tLayout('whatsapp'), external: true }],
        },
      ],
    },
  };
  const announcement = {
    items: [
      { label: tJacket('shipsUnstitched'), href: '/support/shipping' },
      { label: tTrust('dispatch'), href: '/support/shipping' },
      { label: tTrust('returns'), href: '/support/returns' },
      { label: tTrust('colourPromise'), href: '/policies/colour' },
    ],
    labels: { region: tAnnouncement('region'), pause: tAnnouncement('pause'), play: tAnnouncement('play') },
  };

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
              account: tNav('account'),
              accountShort: tNav('accountShort'),
              cart: tNav('cart'),
              menu: tNav('menu'),
            }}
            closeLabel={tSlideover('close')}
            announcement={announcement}
            menus={menus}
            whatsappHref={whatsappLink()}
            whatsappLabel={tLayout('whatsapp')}
            footerSupportLinks={[
              { href: '/support', label: tFooter('support') },
              { href: '/support/returns', label: tFooter('returns') },
              { href: '/support/care-guide', label: tFooter('careGuide') },
              { href: '/support/shipping', label: tFooter('shipping') },
              // About and Contact (founder decision 2026-11-24). "My orders" moved to
              // the Contact page (account is optional and post-purchase, PRD FR-33).
              { href: '/about', label: tFooter('about') },
              { href: '/contact', label: tFooter('contact') },
              { href: '/favourites', label: tFooter('favourites') },
            ]}
            footerHeadings={{ support: tFooter('support'), policies: tFooter('policiesHeading') }}
            footerTrust={[
              { key: 'unstitched', label: tJacket('shipsUnstitched'), href: '/support/shipping' },
              { key: 'dispatch', label: tTrust('dispatch'), href: '/support/shipping' },
              { key: 'returns', label: tTrust('returns'), href: '/support/returns' },
              { key: 'colour', label: tTrust('colourPromise'), href: '/policies/colour' },
            ]}
            footerPolicyLinks={[
              { href: '/policies/privacy', label: tFooter('privacy') },
              { href: '/policies/terms', label: tFooter('terms') },
              { href: '/policies/colour', label: tFooter('colour') },
            ]}
          >
            {children}
          </SiteChrome>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
