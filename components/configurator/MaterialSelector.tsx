import { cn } from '@/lib/utils';
import { formatAmount } from '@/lib/pricing/format';

export type MaterialValue = 'plain' | 'super';

export interface MaterialSelectorProps {
  value: MaterialValue;
  onChange: (value: MaterialValue) => void;
  plainLabel: string;
  superLabel: string;
  /** Price difference for the CURRENT design — shown BEFORE selection (UX-C10b). */
  priceDelta: number;
}

/** docs/3-components.md §4.2a. Two options only. */
export function MaterialSelector({
  value,
  onChange,
  plainLabel,
  superLabel,
  priceDelta,
}: MaterialSelectorProps) {
  return (
    <div className="material-selector" role="radiogroup">
      <button
        type="button"
        role="radio"
        aria-checked={value === 'plain'}
        onClick={() => onChange('plain')}
        className={cn('material-option', value === 'plain' && 'material-option-active')}
      >
        {plainLabel}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === 'super'}
        onClick={() => onChange('super')}
        className={cn('material-option', value === 'super' && 'material-option-active')}
      >
        <span>{superLabel}</span>
        <span className="material-option-delta">+{formatAmount(priceDelta)}</span>
      </button>
    </div>
  );
}
