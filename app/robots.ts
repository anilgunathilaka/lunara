import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/meta';

/**
 * robots.txt (founder decision 2026-11-24): the shop is open to search
 * engines; private and transactional pages are not. Those pages also carry
 * noindex or need a sign-in, so this is a crawl hint, not access control.
 * Cloudflare adds its own content-signal lines above these.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/coming-soon', '/*/ops', '/*/account', '/*/cart', '/*/checkout', '/*/sign-in', '/*/review', '/*/favourites', '/*/dev'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
