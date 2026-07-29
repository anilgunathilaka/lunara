'use client';

import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode;
  /** Presence renders the message below the row, after blur (e.g. a required acknowledgement). */
  error?: string;
}

export function Checkbox({ label, error, id, className, onBlur, disabled, ...rest }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const [touched, setTouched] = useState(false);
  const showError = touched && Boolean(error);

  return (
    <div className="field">
      <label htmlFor={inputId} className={cn('option-row', disabled && 'option-row-disabled')}>
        <span className="option-hit">
          <input
            type="checkbox"
            id={inputId}
            disabled={disabled}
            aria-invalid={showError || undefined}
            aria-describedby={showError ? errorId : undefined}
            className={cn('option-input', className)}
            onBlur={(event) => {
              setTouched(true);
              onBlur?.(event);
            }}
            {...rest}
          />
          <span className="option-box checkbox-box" aria-hidden="true">
            <Check size={14} strokeWidth={3} className="checkbox-check" />
          </span>
        </span>
        <span className="option-label">{label}</span>
      </label>
      {showError && (
        <p id={errorId} role="alert" className="field-message field-message-error">
          {error}
        </p>
      )}
    </div>
  );
}
