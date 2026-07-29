'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** docs/3-components.md §2.1 — visual treatment. Gold is never a button background. */
  variant?: ButtonVariant;
  /** `sm` is desktop-only; a coarse pointer always gets the 44px control height. */
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Replaces the label with a spinner and preserves button width; implies disabled. */
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** Active verb naming what happens — 'Add to cart', never 'Submit' or 'OK'. */
  children: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  tertiary: 'btn-tertiary',
  danger: 'btn-danger',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'btn',
        'focus-ring',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        fullWidth && 'btn-full',
        className,
      )}
      {...rest}
    >
      <span className={cn('inline-flex items-center justify-center gap-2', loading && 'invisible')}>
        {iconLeft}
        {children}
        {iconRight}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="spinner" />
        </span>
      )}
    </button>
  );
}
