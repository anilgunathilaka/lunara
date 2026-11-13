import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Locale routing (next-intl). Kept as `middleware.ts` rather than Next 16's
// `proxy.ts`: OpenNext's support for Node-runtime proxy is experimental
// (docs/4-architecture.md §2.1).
const intl = createMiddleware(routing);

/**
 * Coming-soon mode (founder decision 2026-11-14): with COMING_SOON=1 (a var
 * in wrangler.jsonc), visitors see the temporary landing page at every
 * address, while the address bar keeps what they typed. Still reachable:
 * the admin (/ops) and sign-in, so staff keep working, and customers' own
 * pages (account, review links in emails). ?preview=1 sets a cookie that
 * shows the real shop in that browser (?preview=0 clears it): a convenience
 * for the founder, not a lock. Off (unset) in development and once the shop opens.
 */
const PREVIEW_COOKIE = 'lunara_preview';
const OPEN_PATHS = /^\/(?:en|si|ta)\/(?:ops|sign-in|account|review)(?:\/|$)/;

export default function middleware(request: NextRequest) {
  if (process.env.COMING_SOON !== '1') return intl(request);

  const { pathname, searchParams } = request.nextUrl;
  if (pathname === '/coming-soon') return NextResponse.next();

  const landing = () => NextResponse.rewrite(new URL('/coming-soon', request.url));
  const preview = searchParams.get('preview');
  if (preview === '1') {
    const response = intl(request);
    response.cookies.set(PREVIEW_COOKIE, '1', { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax', secure: true });
    return response;
  }
  if (preview === '0') {
    const response = OPEN_PATHS.test(pathname) ? intl(request) : landing();
    response.cookies.delete(PREVIEW_COOKIE);
    return response;
  }
  if (request.cookies.get(PREVIEW_COOKIE)?.value === '1') return intl(request);
  if (OPEN_PATHS.test(pathname)) return intl(request);

  return landing();
}

export const config = {
  // Skip API routes, Next internals and static/image assets.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
