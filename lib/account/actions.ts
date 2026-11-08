'use server';

import { z } from 'zod';
import { getGuestOrder } from '@/lib/commerce/orders';
import { getPrisma } from '@/lib/prisma';
import { getCustomer } from './customer';

/**
 * Link a guest order to the signed-in account (docs/4-architecture.md §3.6).
 * Proof of the order is the token from its confirmation link, the same
 * proof that opens the guest order page.
 */

const claimSchema = z.object({
  number: z.string().regex(/^LUN-[A-Z0-9]{6}$/),
  token: z.string().min(20).max(100),
});

export type ClaimOrderResult = { ok: true } | { ok: false; reason: 'invalid' | 'signedOut' | 'taken' };

export async function claimOrderAction(input: unknown): Promise<ClaimOrderResult> {
  const parsed = claimSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'invalid' };
  const customer = await getCustomer();
  if (!customer) return { ok: false, reason: 'signedOut' };

  const order = await getGuestOrder(parsed.data.number, parsed.data.token);
  if (!order) return { ok: false, reason: 'invalid' };
  if (order.userId === customer.id) return { ok: true };

  // Only an unlinked order can be claimed; never move one between accounts.
  const { count } = await getPrisma().order.updateMany({
    where: { id: order.id, userId: null },
    data: { userId: customer.id },
  });
  return count === 1 ? { ok: true } : { ok: false, reason: 'taken' };
}
