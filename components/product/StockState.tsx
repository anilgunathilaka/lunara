import { cn } from '@/lib/utils';

export type StockLevel = 'in' | 'low' | 'out';

export interface StockStateProps {
  state: StockLevel;
  /**
   * Exact remaining units. Shown verbatim only when truly low — never
   * invented (docs/1-ux.md: "Stock scarcity is stated only when true").
   */
  quantity?: number;
  /** Translated labels — this component renders no copy of its own. */
  outOfStockLabel: string;
  lowStockLabel: string;
  /** e.g. (count) => `${count} left` in the active language. */
  formatLeft?: (count: number) => string;
  className?: string;
}

export function StockState({
  state,
  quantity,
  outOfStockLabel,
  lowStockLabel,
  formatLeft,
  className,
}: StockStateProps) {
  // In-stock is the silent default — a badge here would be noise.
  if (state === 'in') return null;

  const label =
    state === 'out'
      ? outOfStockLabel
      : quantity != null && formatLeft
        ? formatLeft(quantity)
        : lowStockLabel;

  return (
    <span className={cn('stock-badge', state === 'out' && 'stock-badge-out', className)}>
      {label}
    </span>
  );
}
