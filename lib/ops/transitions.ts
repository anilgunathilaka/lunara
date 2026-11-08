import type { OrderStatus } from '@prisma/client';

/**
 * Order lifecycle (docs/4-architecture.md §7.2). The only transitions staff
 * can make; anything else is refused on the server.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  payment_pending: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['dispatched', 'cancelled'],
  dispatched: ['delivered'],
  delivered: ['return_requested'],
  return_requested: ['refunded', 'exchanged'],
  cancelled: [],
  refunded: [],
  exchanged: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Cancelling from these returns the units to stock (§3.5): nothing has left the building. */
export const RESTOCK_ON_CANCEL_FROM: ReadonlySet<OrderStatus> = new Set([
  'placed',
  'payment_pending',
  'confirmed',
  'packed',
]);

export const ORDER_STATUSES = Object.keys(ALLOWED_TRANSITIONS) as OrderStatus[];
