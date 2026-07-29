import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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
  },
  typedRoutes: true,
};

export default withNextIntl(nextConfig);
