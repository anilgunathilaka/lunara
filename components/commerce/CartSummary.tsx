import { PriceDisplay } from '@/components/product/PriceDisplay';

export interface CartSummaryRow {
  label: string;
  amount: number;
  /** e.g. "Waived when you pay online" beside the COD fee row. */
  note?: string;
}

export interface CartSummaryProps {
  /** Caller decides which rows apply — Subtotal always, COD fee only when relevant, etc. */
  rows: CartSummaryRow[];
  totalLabel: string;
  total: number;
}

/** Itemised price breakdown — docs/1-ux.md §3.4 ("itemised summary"). */
export function CartSummary({ rows, totalLabel, total }: CartSummaryProps) {
  return (
    <div className="cart-summary">
      {rows.map((row) => (
        <div key={row.label} className="cart-summary-row">
          <span className="spec-row-term">
            {row.label}
            {row.note && <span className="cart-summary-note"> — {row.note}</span>}
          </span>
          <PriceDisplay amount={row.amount} />
        </div>
      ))}
      <div className="cart-summary-row cart-summary-total">
        <span>{totalLabel}</span>
        <PriceDisplay amount={total} />
      </div>
    </div>
  );
}
