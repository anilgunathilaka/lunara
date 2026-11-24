import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Product media is served from Cloudflare R2's public domain in deployed
// environments (docs/4-architecture.md §2.2); allow next/image to load it.
const r2PublicUrl = process.env.R2_PUBLIC_BASE_URL?.trim();
const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = r2PublicUrl
  ? [new URL(`${r2PublicUrl.replace(/\/+$/, '')}/**`)]
  : [];

const nextConfig: NextConfig = {
  // Dev-only build-activity indicator — default bottom-left collides with
  // the floating WhatsAppAction FAB and the fixed MobileNav bar during
  // responsive QA. Never shown in production builds.
  devIndicators: {
    position: 'top-right',
  },
  images: {
    // Product photography colour fidelity must be preserved end to end
    // (docs/4-architecture.md §4) — no format transform that would strip
    // the embedded colour profile.
    formats: ['image/avif', 'image/webp'],
    // 90 for product photographs (PHOTO_QUALITY, lib/media/quality.ts): at the
    // default 75 the weave, print and embroidery soften. 75 stays the default.
    qualities: [75, 90],
    remotePatterns,
  },
  typedRoutes: true,
  // Preview deployments on *.workers.dev must never be indexed: they would
  // compete with the real domain in search results.
  // Security headers on every response (docs/4-architecture.md §2.4,
  // security audit 2026-11-15).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          // No page may be framed by another site (clickjacking), the ops panel above all.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Security review 2026-11-24: also no plugins, no <base> rewrites, forms
          // post only to this site, and any http:// sub-resource is upgraded.
          // Scripts are not restricted here: Next's inline scripts would need nonces.
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'; upgrade-insecure-requests",
          },
          // Windows this site opens (or that open it) cannot reach into it.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Order and review links carry tokens in the query: never send them to other sites.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?<subdomain>.+)\\.workers\\.dev' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  // Prisma ships workerd-specific builds; keeping these external lets the
  // OpenNext build pick them for the Worker (opennext.js.org/cloudflare/howtos/db).
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  // The add-jacket form sends its photograph with the form (founder decision
  // 2026-11-14); photos may be up to 12 MB (lib/media/photos MAX_PHOTO_BYTES),
  // stored byte-for-byte, never shrunk (§4).
  experimental: {
    serverActions: { bodySizeLimit: '13mb' },
  },
};

// Deliberately NOT calling initOpenNextCloudflareForDev(): `next dev` needs
// no Cloudflare bindings (lib/prisma.ts uses DATABASE_URL and lib/storage
// uses the local disk in development), so local dev stays plain Next.js.
// Bindings are exercised with `npm run preview` (local workerd).
export default withNextIntl(nextConfig);
