import { Radio } from '@/components/primitives/Radio';

export type PaymentMethodValue = 'cod' | 'bank_transfer' | 'lankaqr' | 'card';

export interface PaymentMethodOption {
  value: PaymentMethodValue;
  label: string;
  /** e.g. the itemised COD fee and its prepayment waiver, already translated. */
  detail?: string;
}

export interface PaymentMethodProps {
  /**
   * All four options render with equal visual weight — docs/3-components.md
   * §5.3. Bank transfer is never hidden behind an "other methods" disclosure,
   * so the caller must not omit or de-prioritise it in this list.
   */
  options: PaymentMethodOption[];
  value: PaymentMethodValue;
  onChange: (value: PaymentMethodValue) => void;
  name: string;
}

export function PaymentMethod({ options, value, onChange, name }: PaymentMethodProps) {
  return (
    <div className="payment-method">
      {options.map((option) => (
        <Radio
          key={option.value}
          id={`${name}-${option.value}`}
          name={name}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          label={
            <span className="payment-option-label">
              <span className="payment-option-name">{option.label}</span>
              {option.detail && <span className="payment-option-detail">{option.detail}</span>}
            </span>
          }
        />
      ))}
    </div>
  );
}
