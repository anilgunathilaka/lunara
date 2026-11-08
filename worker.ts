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

const worker = {
  fetch: (request: Request, env: Env, ctx: unknown) => handler.fetch(request, env, ctx),

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
