import type { OrderStatus } from '@prisma/client';

/**
 * Customer-facing order progress (docs/1-ux.md §3.5; docs/4-architecture.md
 * §3.6), derived from ORDER_EVENT, the order's own history. Pure: the same
 * steps render on the guest order page and in the account.
 */

export const TRACKING_STEPS = ['placed', 'confirmed', 'packed', 'dispatched', 'delivered'] as const;
export type TrackingStepKey = (typeof TRACKING_STEPS)[number];

export interface TrackingStep {
  key: TrackingStepKey;
  /** done: reached · next: what happens next · upcoming: later · skipped: will not happen (cancelled). */
  state: 'done' | 'next' | 'upcoming' | 'skipped';
  at: Date | null;
}

const RANK: Partial<Record<OrderStatus, number>> = {
  placed: 0,
  payment_pending: 0,
  confirmed: 1,
  packed: 2,
  dispatched: 3,
  delivered: 4,
  // After delivery, every step was reached.
  return_requested: 4,
  refunded: 4,
  exchanged: 4,
};

export interface Tracking {
  steps: TrackingStep[];
  cancelledAt: Date | null;
}

export function trackingFor(status: OrderStatus, events: { status: OrderStatus; createdAt: Date }[]): Tracking {
  const reachedAt = new Map<number, Date>();
  let reached = 0;
  for (const event of events) {
    const rank = RANK[event.status];
    if (rank === undefined) continue;
    if (!reachedAt.has(rank)) reachedAt.set(rank, event.createdAt);
    reached = Math.max(reached, rank);
  }
  const current = RANK[status];
  if (current !== undefined) reached = Math.max(reached, current);
  const cancelled = status === 'cancelled';
  const cancelledAt = cancelled ? ([...events].reverse().find((e) => e.status === 'cancelled')?.createdAt ?? null) : null;

  const steps = TRACKING_STEPS.map((key, rank): TrackingStep => {
    let state: TrackingStep['state'];
    if (rank <= reached) state = 'done';
    else if (cancelled) state = 'skipped';
    else state = rank === reached + 1 ? 'next' : 'upcoming';
    return { key, state, at: state === 'done' ? (reachedAt.get(rank) ?? null) : null };
  });
  return { steps, cancelledAt };
}
