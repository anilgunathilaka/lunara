/**
 * Worker entry: OpenNext's generated handler plus a Cron Trigger
 * (docs/4-architecture.md §6.1). The scheduled handler calls the app's own
 * internal notifications endpoint through the self-reference binding, so
 * all delivery logic stays inside the Next.js app.
 */
// Excluded from tsconfig: this file only resolves after `opennextjs-cloudflare build`.
import handler from './.open-next/worker.js';

// Durable Object classes OpenNext may reference; re-exported unchanged.
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from './.open-next/worker.js';

interface Env {
  WORKER_SELF_REFERENCE: { fetch: (request: Request) => Promise<Response> };
  CRON_SECRET?: string;
  BETTER_AUTH_URL?: string;
}

/**
 * Plain http:// on the real domain goes to https:// (security review
 * 2026-11-24: the site answered over http with no redirect). Only for
 * lunarasarees.com, so `wrangler dev` on http://localhost keeps working.
 */
function httpsRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.protocol !== 'http:' || !/(^|\.)lunarasarees\.com$/.test(url.hostname)) return null;
  url.protocol = 'https:';
  return Response.redirect(url.toString(), 301);
}

const worker = {
  fetch: (request: Request, env: Env, ctx: unknown) => httpsRedirect(request) ?? handler.fetch(request, env, ctx),

  async scheduled(_controller: unknown, env: Env, ctx: { waitUntil: (p: Promise<unknown>) => void }) {
    if (!env.CRON_SECRET) return; // not configured: nothing to do
    const origin = env.BETTER_AUTH_URL ?? 'https://lunarasarees.com';
    ctx.waitUntil(
      env.WORKER_SELF_REFERENCE.fetch(
        new Request(`${origin}/api/internal/notifications`, {
          method: 'POST',
          headers: { authorization: `Bearer ${env.CRON_SECRET}` },
        }),
      ).then(async (response) => {
        if (!response.ok) console.error('[cron] notifications run failed:', response.status);
      }),
    );
  },
};

export default worker;
