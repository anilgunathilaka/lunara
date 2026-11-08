/**
 * Stock state is DERIVED from STOCK_ITEM quantity and threshold, never
 * stored (docs/4-architecture.md §3.2, §3.3), so it can never disagree
 * with the count.
 */
export type StockStateValue = 'in' | 'low' | 'out';

export interface Availability {
  state: StockStateValue;
  /** Only present when low, for the "N left" message. */
  quantity?: number;
}

export function availabilityOf(stock: { quantity: number; threshold: number }): Availability {
  if (stock.quantity <= 0) return { state: 'out' };
  if (stock.quantity <= stock.threshold) return { state: 'low', quantity: stock.quantity };
  return { state: 'in' };
}

const SEVERITY: Record<StockStateValue, number> = { in: 0, low: 1, out: 2 };

/**
 * A curated listing ships a saree colourway AND a jacket colourway: it is
 * only as available as the scarcer of the two (§3.3).
 */
export function combinedAvailability(a: Availability, b: Availability): Availability {
  if (SEVERITY[a.state] !== SEVERITY[b.state]) return SEVERITY[a.state] > SEVERITY[b.state] ? a : b;
  if (a.state === 'low') return { state: 'low', quantity: Math.min(a.quantity ?? 0, b.quantity ?? 0) };
  return a;
}
