'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'id'> {
  label: ReactNode;
  /** Required — Radio is used in groups, so each option needs a distinct id/label pairing. */
  id: string;
}

export function Radio({ label, id, className, disabled, ...rest }: RadioProps) {
  return (
    <label
      htmlFor={id}
      className={cn('option-row', disabled && 'option-row-disabled')}
    >
      <span className="option-hit">
        <input
          type="radio"
          id={id}
          disabled={disabled}
          className={cn('option-input', className)}
          {...rest}
        />
        <span className="option-box radio-box" aria-hidden="true">
          <span className="radio-dot" />
        </span>
      </span>
      <span className="option-label">{label}</span>
    </label>
  );
}
