import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

/**
 * SEO building blocks (founder decision 2026-11-24): one canonical address
 * per page, hreflang links between its English, Sinhala and Tamil versions,
 * and Open Graph / Twitter cards so a shared link shows a picture, a title
 * and a line (WhatsApp, Facebook).
 */

export const SITE_URL = (process.env.BETTER_AUTH_URL?.trim() || 'https://lunarasarees.com').replace(/\/+$/, '');
export const BRAND = 'Lunara Sarees';
/** A photograph of a saree being worn: the share picture for pages without their own. */
export const DEFAULT_SHARE_IMAGE = '/video/home-film-poster.jpg';

const OG_LOCALE: Record<string, string> = { en: 'en_LK', si: 'si_LK', ta: 'ta_LK' };

/** An address on this site, absolute. `path` starts with "/" or is empty (the home page). */
export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

/** Canonical address for this language, and the same page in every language (x-default: English). */
export function localeAlternates(locale: string, path: string): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]));
  languages['x-default'] = `${SITE_URL}/${routing.defaultLocale}${path}`;
  return { canonical: `${SITE_URL}/${locale}${path}`, languages };
}

export interface PageMetaInput {
  locale: string;
  /** The page's path after the locale: "" for home, "/shop", "/shop/azzura-royale" … */
  path: string;
  title: NonNullable<Metadata['title']>;
  description: string;
  /** Share picture; absolute or site-relative. Defaults to DEFAULT_SHARE_IMAGE. */
  image?: string;
  type?: 'website' | 'article';
}

export function pageMetadata({ locale, path, title, description, image, type = 'website' }: PageMetaInput): Metadata {
  const alternates = localeAlternates(locale, path);
  const shareTitle = typeof title === 'string' ? title : 'absolute' in title ? title.absolute : BRAND;
  const picture = image ?? DEFAULT_SHARE_IMAGE;
  return {
    title,
    description,
    alternates,
    openGraph: {
      type,
      siteName: BRAND,
      locale: OG_LOCALE[locale] ?? 'en_LK',
      url: alternates.canonical as string,
      title: shareTitle,
      description,
      images: [{ url: picture }],
    },
    twitter: { card: 'summary_large_image', title: shareTitle, description, images: [picture] },
  };
}

/** For pages that must never be in search results (cart, checkout …). */
export const NO_INDEX: Metadata = { robots: { index: false, follow: false } };
