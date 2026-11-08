import 'server-only';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { normaliseSriLankanMobile, type PlaceOrderInput } from './cart-ref';
import { composeNotifications, siteUrl } from '@/lib/notifications/compose';
import { deliverSoon } from '@/lib/notifications/deliver';
import { buildQuote, demandBySku, type CartQuote, type ResolvedLine } from './quote';

/**
 * Order placement and guest lookup (docs/4-architecture.md §3.4, §7.2).
 */

export type PlaceOrderOutcome =
  | { ok: true; number: string; token: string }
  /** Price or fee moved since the customer's last quote: show it, ask again. */
  | { ok: false; reason: 'changed'; quote: CartQuote }
  /** A line is unavailable or short: show which, ask the customer to adjust. */
  | { ok: false; reason: 'unavailable'; quote: CartQuote };

// No 0/O, 1/I/L: order numbers get read aloud over the phone.
const ORDER_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

function newOrderNumber(): string {
  let suffix = '';
  for (let i = 0; i < 6; i += 1) suffix += ORDER_ALPHABET[randomInt(ORDER_ALPHABET.length)];
  return `LUN-${suffix}`;
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

class StockShortError extends Error {}

function lineData(resolved: ResolvedLine, quantity: number): Prisma.OrderLineCreateWithoutOrderInput {
  return {
    kind: resolved.kind,
    listingId: resolved.listingId,
    designId: resolved.designId,
    materialId: resolved.materialId,
    sareeColourwayId: resolved.sareeColourwayId,
    jacketColourwayId: resolved.jacketColourwayId,
    sareeSku: resolved.sareeSku,
    jacketSku: resolved.jacketSku,
    drape: resolved.drape,
    title: resolved.title,
    materialName: resolved.materialName,
    sareeColourName: resolved.sareeColourName,
    jacketMaterialName: resolved.jacketMaterialName,
    jacketColourName: resolved.jacketColourName,
    unitPrice: resolved.unitPrice,
    quantity,
  };
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderOutcome> {
  const prisma = getPrisma();
  const { details, paymentMethod } = input;

  // Price everything afresh on the server; never trust a client figure.
  const { quote, resolved } = await buildQuote(prisma, {
    lines: input.lines,
    district: details.district,
    paymentMethod,
  });
  if (!quote.orderable) return { ok: false, reason: 'unavailable', quote };
  if (quote.total !== input.expectedTotal) return { ok: false, reason: 'changed', quote };
  if (quote.deliveryFee === null || quote.estimate === null) return { ok: false, reason: 'changed', quote };

  const lines = input.lines.map((line, i) => ({ resolved: resolved[i]!, quantity: line.quantity }));
  const demand = demandBySku(lines);
  const token = randomBytes(24).toString('base64url');
  const phone = normaliseSriLankanMobile(details.phone)!;
  const status = paymentMethod === 'bank_transfer' ? 'payment_pending' : 'placed';

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const number = newOrderNumber();
    try {
      await prisma.$transaction(async (tx) => {
        // Deterministic stock (§3.2): decrement only if enough remains; any
        // shortfall rolls the whole order back. Sorted to keep lock order
        // stable across concurrent orders.
        for (const [sku, quantity] of [...demand].sort(([a], [b]) => a.localeCompare(b))) {
          const { count } = await tx.stockItem.updateMany({
            where: { sku, quantity: { gte: quantity } },
            data: { quantity: { decrement: quantity } },
          });
          if (count !== 1) throw new StockShortError(sku);
        }

        const order = await tx.order.create({
          data: {
            number,
            status,
            paymentMethod,
            customerName: details.name.trim(),
            phone,
            email: details.email ? details.email.trim() : null,
            addressLine: details.address.trim(),
            district: details.district,
            eventDate: details.eventDate ? new Date(`${details.eventDate}T00:00:00Z`) : null,
            unstitchedAcknowledgedAt: new Date(),
            subtotal: quote.subtotal,
            deliveryFee: quote.deliveryFee!,
            codFee: quote.codFee,
            total: quote.total,
            estimateMinDays: quote.estimate!.minDays,
            estimateMaxDays: quote.estimate!.maxDays,
            locale: input.locale,
            accessTokenHash: hashToken(token),
            lines: { create: lines.map((l) => lineData(l.resolved, l.quantity)) },
            events: { create: { status, actor: 'customer' } },
          },
        });

        // Outbox (docs/4-architecture.md §6.1): recorded with the order itself.
        const confirmationLink = `${siteUrl()}/${input.locale}/checkout/confirmed?order=${number}&t=${encodeURIComponent(token)}`;
        await tx.notification.createMany({ data: composeNotifications('placed', order, { confirmationLink }) });
      });
      deliverSoon();
      return { ok: true, number, token };
    } catch (error) {
      if (error instanceof StockShortError) {
        // Someone else took the last unit between quote and placement.
        const fresh = await buildQuote(prisma, { lines: input.lines, district: details.district, paymentMethod });
        return { ok: false, reason: 'unavailable', quote: fresh.quote };
      }
      const numberCollision =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
      if (!numberCollision) throw error;
    }
  }
  throw new Error('Could not allocate a unique order number');
}

const guestOrderInclude = {
  lines: { orderBy: { id: 'asc' } },
  events: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.OrderInclude;

export type GuestOrder = Prisma.OrderGetPayload<{ include: typeof guestOrderInclude }>;

/** Order number + the token from the confirmation link; null if either is wrong. */
export async function getGuestOrder(number: string, token: string): Promise<GuestOrder | null> {
  if (!/^LUN-[A-Z0-9]{6}$/.test(number) || token.length < 20 || token.length > 100) return null;
  const order = await getPrisma().order.findUnique({
    relationLoadStrategy: 'join',
    where: { number },
    include: guestOrderInclude,
  });
  if (!order || order.accessTokenHash !== hashToken(token)) return null;
  return order;
}
