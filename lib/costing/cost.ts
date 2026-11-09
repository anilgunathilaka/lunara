import 'server-only';

/**
 * Unit cost and margin (docs/4-architecture.md §3.11). Staff-only figures:
 * nothing here ever feeds a customer price — that stays in lib/pricing.
 * All amounts are whole LKR.
 */

export const COST_PARTS = ['fabric', 'otherMaterials', 'sewing', 'transport', 'other'] as const;
export type CostPart = (typeof COST_PARTS)[number];
export type CostBreakdown = Record<CostPart, number>;

export function totalCost(cost: CostBreakdown): number {
  return COST_PARTS.reduce((sum, part) => sum + cost[part], 0);
}

/** Profit per unit and margin as a whole percent of the selling price. */
export function marginOf(price: number, cost: number): { profit: number; percent: number } {
  const profit = price - cost;
  return { profit, percent: price > 0 ? Math.round((profit / price) * 100) : 0 };
}
