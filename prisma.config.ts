import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/**
 * Prisma CLI configuration (Prisma 7). Used only by the CLI — migrate,
 * generate, diff — never by the running app.
 *
 * DIRECT_URL is Supabase's session pooler (port 5432): migrations need a
 * session-mode connection, and the direct host is IPv6-only
 * (docs/4-architecture.md §2.2). The runtime connection is configured in
 * lib/prisma.ts.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
});
