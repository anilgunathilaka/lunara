/** "8,900" — grouped digits with no currency prefix, e.g. for a "+900" price-attribution delta. */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(amount));
}

/** "LKR 8,900" — docs/3-components.md §4.2b / §4.5, docs/1-ux.md §4. */
export function formatPriceLKR(amount: number): string {
  return `LKR ${formatAmount(amount)}`;
}
