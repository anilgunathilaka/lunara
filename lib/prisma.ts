import 'server-only';
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
 *     requests with Hyperdrive hangs the Worker (prisma/orm#28193).
 *   - Local `next dev` / `next start`: DATABASE_URL, and one client per
 *     process so hot reloads don't exhaust Supabase pooler connections.
 *
 * Within one Server Component render, `cache` dedupes to a single client.
 * In Route Handlers each call creates one, so call it once per handler
 * and pass the client down.
 */

function createClient(connectionString: string, perRequest: boolean): PrismaClient {
  return new PrismaClient({
    // maxUses: 1 — on the Worker a pooled connection must not be reused
    // beyond its request; Hyperdrive does the real pooling.
    adapter: new PrismaPg(perRequest ? { connectionString, maxUses: 1 } : { connectionString }),
  });
}

/**
 * Hyperdrive connection string when running on the Worker, else undefined.
 * Wired up with the OpenNext adapter (getCloudflareContext().env.HYPERDRIVE)
 * in the Workers adapter step; until then, always the local path.
 */
function hyperdriveConnectionString(): string | undefined {
  return undefined;
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
  const hyperdrive = hyperdriveConnectionString();
  return hyperdrive ? createClient(hyperdrive, true) : localClient();
});
