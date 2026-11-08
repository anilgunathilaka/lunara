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
    remotePatterns,
  },
  typedRoutes: true,
};

export default withNextIntl(nextConfig);
