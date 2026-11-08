import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Locale routing (next-intl). Kept as `middleware.ts` rather than Next 16's
// `proxy.ts`: OpenNext's support for Node-runtime proxy is experimental
// (docs/4-architecture.md §2.1).
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals and static/image assets.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
