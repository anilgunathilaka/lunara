'use server';

import { getPrisma } from '@/lib/prisma';
import { placeOrderSchema, quoteRequestSchema } from './cart-ref';
import { placeOrder, type PlaceOrderOutcome } from './orders';
import { buildQuote, type CartQuote } from './quote';

/**
 * Server Actions for the cart and checkout (docs/4-architecture.md §3.4).
 * Inputs arrive as `unknown` and are validated here: nothing from the
 * client is trusted, and prices only ever flow server → client.
 */

export type QuoteActionResult = { ok: true; quote: CartQuote } | { ok: false; reason: 'invalid' };

export async function quoteCartAction(input: unknown): Promise<QuoteActionResult> {
  const parsed = quoteRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'invalid' };
  const { quote } = await buildQuote(getPrisma(), parsed.data);
  return { ok: true, quote };
}

export type PlaceOrderActionResult = PlaceOrderOutcome | { ok: false; reason: 'invalid' };

export async function placeOrderAction(input: unknown): Promise<PlaceOrderActionResult> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'invalid' };
  return placeOrder(parsed.data);
}
