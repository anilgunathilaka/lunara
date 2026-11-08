import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { cache } from 'react';

/**
 * Database access (docs/4-architecture.md §2.2).
 *
 * Always call `getPrisma()` INSIDE a request — in a Route Handler, Server
 * Action or Server Component — never at module scope. That rule is what
 * lets the same calling code run in both environments:
 *
 *   - Cloudflare Worker: the connection comes from the Hyperdrive binding
 *     and a NEW client is created per request. Reusing a client across
 *     requests with Hyperdrive hangs the Worker (prisma/orm issue 28193).
 *   - Local `next dev` / `next start`: DATABASE_URL, and one client per
 *     process so hot reloads don't exhaust Supabase pooler connections.
 *
 * Within one Server Component render, `cache` dedupes to a single client.
 * In Route Handlers each call creates one, so call it once per handler
 * and pass the client down.
 */

/**
 * Interactive transactions (order placement, ops changes) make several round
 * trips. Prisma's 5 s default turns a slow-but-working link into a failed
 * order; these limits still bound how long stock rows stay locked.
 */
const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 20_000 } as const;

function createClient(connectionString: string, perRequest: boolean): PrismaClient {
  return new PrismaClient({
    transactionOptions: TRANSACTION_OPTIONS,
    // maxUses: 1 — on the Worker a pooled connection must not be reused
    // beyond its request; Hyperdrive does the real pooling.
    adapter: new PrismaPg(perRequest ? { connectionString, maxUses: 1 } : { connectionString }),
  });
}

/**
 * The Worker's Cloudflare context, or undefined outside a Worker
 * (`next dev`, `next start`, build-time prerendering).
 */
function workerContext() {
  if (process.env.NODE_ENV !== 'production') return undefined;
  try {
    return getCloudflareContext();
  } catch {
    return undefined;
  }
}

const globalForPrisma = globalThis as unknown as { lunaraPrisma?: PrismaClient };

function localClient(): PrismaClient {
  if (!globalForPrisma.lunaraPrisma) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set (see .env.example).');
    }
    globalForPrisma.lunaraPrisma = createClient(url, false);
  }
  return globalForPrisma.lunaraPrisma;
}

export const getPrisma = cache((): PrismaClient => {
  const cf = workerContext();
  const hyperdrive = cf?.env.HYPERDRIVE?.connectionString;
  if (!cf || !hyperdrive) return localClient();

  // No explicit $disconnect: Next gives no "response finished" hook, and a
  // disconnect scheduled early could cut off in-flight queries. maxUses: 1
  // stops reuse, and the Workers runtime closes the request's sockets when
  // the request ends (OpenNext's documented pattern).
  return createClient(hyperdrive, true);
});
