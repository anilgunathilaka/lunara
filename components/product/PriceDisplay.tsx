import { cn } from '@/lib/utils';
import { formatPriceLKR } from '@/lib/pricing/format';

export interface PriceDisplayProps {
  /** All-in price for saree plus jacket material, in LKR. */
  amount: number;
  className?: string;
}

export function PriceDisplay({ amount, className }: PriceDisplayProps) {
  return <span className={cn('price-display', className)}>{formatPriceLKR(amount)}</span>;
}
