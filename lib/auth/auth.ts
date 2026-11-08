import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { PrismaClient } from '@prisma/client';
import { cache } from 'react';
import { getPrisma } from '@/lib/prisma';

/**
 * Guest checkout is the default and only required path (PRD FR-33,
 * docs/1-ux.md §3.4). Account creation is offered AFTER an order is
 * placed, pre-filled, as a convenience — never a gate in front of a
 * purchase. This config exists to support that optional account layer
 * (order history, saved designs, addresses), not to gate commerce.
 *
 * Built per request, not at module scope, because it captures a Prisma
 * client and on the Worker those are per-request (lib/prisma.ts).
 *
 * TODO(passwordless): docs/4-architecture.md §2.1 specifies passwordless
 * sign-in (email one-time code / magic link) — scrypt password hashing
 * cannot fit the Workers Free plan's 10 ms CPU budget. Email + password
 * stays enabled until the passwordless flow is built with Resend.
 */
function createAuth(prisma: PrismaClient) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

/** The Better Auth instance for the current request. */
export const getAuth = cache((): Auth => createAuth(getPrisma()));
