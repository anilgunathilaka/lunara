import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getCuratedListings } from '@/lib/catalogue/queries';
import { SITE_URL } from '@/lib/seo/meta';

/**
 * sitemap.xml (founder decision 2026-11-24): every public page and every
 * saree on sale, in English, Sinhala and Tamil, each listing its other
 * languages. New sarees appear on their own; archived ones drop out.
 * Account, cart, checkout and the admin are left out on purpose.
 */

const PAGES: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/support', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/support/shipping', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/support/returns', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/support/care-guide', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/policies/colour', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/policies/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/policies/terms', priority: 0.2, changeFrequency: 'yearly' },
];

function entries(path: string, extra: Omit<MetadataRoute.Sitemap[number], 'url'>): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]));
  return routing.locales.map((locale) => ({ url: `${SITE_URL}/${locale}${path}`, alternates: { languages }, ...extra }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The catalogue may be unreachable: the static pages are still listed.
  const sarees = await getCuratedListings().catch(() => []);
  return [
    ...PAGES.flatMap((p) => entries(p.path, { priority: p.priority, changeFrequency: p.changeFrequency })),
    ...sarees.flatMap((s) => entries(`/shop/${s.id}`, { priority: 0.8, changeFrequency: 'weekly' })),
  ];
}
