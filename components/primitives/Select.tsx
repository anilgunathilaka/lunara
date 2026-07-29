'use client';

import { useId, useState, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/primitives/Icon';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Always rendered above the field — never replaced by a placeholder. */
  label: string;
  /** Presence renders the danger border and the message below the field. */
  error?: string;
  options: SelectOption[];
  /** Rendered as a disabled, hidden first option, e.g. "Choose a design". */
  placeholder?: string;
}

export function Select({
  label,
  error,
  options,
  placeholder,
  id,
  className,
  onBlur,
  disabled,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const [touched, setTouched] = useState(false);
  // Same on-blur gating as Input (docs/3-components.md §2.2 Validation row
  // governs both fields together).
  const showError = touched && Boolean(error);

  return (
    <div className="field">
      <label htmlFor={selectId} className="field-label">
        {label}
      </label>
      <div className="select-wrap">
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? errorId : undefined}
          className={cn('select', showError && 'field-invalid', className)}
          onBlur={(event) => {
            setTouched(true);
            onBlur?.(event);
          }}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          icon={ChevronDown}
          className={cn('select-icon', disabled && 'select-icon-disabled')}
        />
      </div>
      {showError && (
        <p id={errorId} role="alert" className="field-message field-message-error">
          {error}
        </p>
      )}
    </div>
  );
}
