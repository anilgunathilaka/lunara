/**
 * "8,900.00" — grouped digits and two decimal places (founder decision
 * 2026-11-22, docs/3-components.md money format), no currency prefix, e.g.
 * for a "+900.00" price-attribution delta.
 */
const AMOUNT = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatAmount(amount: number): string {
  return AMOUNT.format(amount);
}

/** "LKR 8,900.00" — docs/3-components.md §4.2b / §4.5, docs/1-ux.md §4. */
export function formatPriceLKR(amount: number): string {
  return `LKR ${formatAmount(amount)}`;
}
