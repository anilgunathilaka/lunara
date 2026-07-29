import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';

/**
 * Guest checkout is the default and only required path (PRD FR-33,
 * docs/1-ux.md §3.4). Account creation is offered AFTER an order is
 * placed, pre-filled, as a convenience — never a gate in front of a
 * purchase. This config exists to support that optional account layer
 * (order history, saved designs, addresses), not to gate commerce.
 */
export const auth = betterAuth({
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
