'use client';

import { useId, useState, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Always rendered above the field — never replaced by a placeholder. */
  label: string;
  /** Presence renders the danger border and the message below the field. */
  error?: string;
}

export function Input({ label, error, id, className, onBlur, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const [touched, setTouched] = useState(false);
  // Errors appear on blur, never on every keystroke (docs/3-components.md §2.2),
  // enforced here so the primitive is correct even if a caller sets `error` eagerly.
  const showError = touched && Boolean(error);

  return (
    <div className="field">
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={showError || undefined}
        aria-describedby={showError ? errorId : undefined}
        className={cn('input', showError && 'field-invalid', className)}
        onBlur={(event) => {
          setTouched(true);
          onBlur?.(event);
        }}
        {...rest}
      />
      {showError && (
        <p id={errorId} role="alert" className="field-message field-message-error">
          {error}
        </p>
      )}
    </div>
  );
}
