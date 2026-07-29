import { PriceDisplay } from '@/components/product/PriceDisplay';

export interface DeliveryEstimateProps {
  /** Honest range derived from district, e.g. "3–5 working days" — never a single optimistic figure. */
  estimateRangeLabel: string;
  /** e.g. "Order before 2pm for same-day dispatch". */
  dispatchCutoffLabel: string;
  feeLabel: string;
  fee: number;
}

/** docs/3-components.md §5.3. Belongs in cart AND checkout, never only at the final step. */
export function DeliveryEstimate({
  estimateRangeLabel,
  dispatchCutoffLabel,
  feeLabel,
  fee,
}: DeliveryEstimateProps) {
  return (
    <div className="delivery-estimate">
      <p className="delivery-estimate-range">{estimateRangeLabel}</p>
      <p className="spec-row-term">{dispatchCutoffLabel}</p>
      <div className="cart-summary-row">
        <span className="spec-row-term">{feeLabel}</span>
        <PriceDisplay amount={fee} />
      </div>
    </div>
  );
}
