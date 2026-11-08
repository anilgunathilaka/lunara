import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import type { PrismaClient } from '@prisma/client';
import { cache } from 'react';
import { SIGN_IN_CODE_TTL_SECONDS, sendSignInCode } from '@/lib/email/sign-in-code';
import { getPrisma } from '@/lib/prisma';

/**
 * Guest checkout is the default and only required path (PRD FR-33,
 * docs/1-ux.md §3.4). Account creation is offered AFTER an order is
 * placed, pre-filled, as a convenience — never a gate in front of a
 * purchase. This config exists to support that optional account layer
 * (order history, saved designs, addresses), not to gate commerce.
 *
 * Passwordless (docs/4-architecture.md §2.1): sign-in is a 6-digit code
 * sent by email. No passwords, so no scrypt hashing — which cannot fit
 * the Workers Free plan's 10 ms CPU budget. A typed code is used rather
 * than a magic link because on mobile a link often opens in the email
 * app's in-app browser, signing in the wrong browser.
 *
 * Built per request, not at module scope, because it captures a Prisma
 * client and on the Worker those are per-request (lib/prisma.ts).
 */
function createAuth(prisma: PrismaClient) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: false,
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: SIGN_IN_CODE_TTL_SECONDS,
        allowedAttempts: 3,
        // Only a hash of the code is stored (SHA-256: cheap enough for the
        // Worker CPU budget, unlike password hashing).
        storeOTP: 'hashed',
        // Signing in with a new email creates the account — this is the
        // post-purchase "save your details" path.
        disableSignUp: false,
        sendVerificationOTP: ({ email, otp }, ctx) => sendSignInCode(email, otp, ctx?.request),
      }),
    ],
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
