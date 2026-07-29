import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export type LoadingSkeletonVariant = 'block' | 'circle' | 'text';

export interface LoadingSkeletonProps {
  /** Shape-matched to the content it replaces — size it via className (aspect-ratio, width, height). */
  variant?: LoadingSkeletonVariant;
  className?: string;
  /** For exact token-driven dimensions, e.g. { width: 'var(--size-icon-touch)' }. */
  style?: CSSProperties;
}

/** docs/3-components.md §6.1 — shape-matched to the content it replaces. */
export function LoadingSkeleton({ variant = 'block', className, style }: LoadingSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn(
        'skeleton',
        variant === 'circle' && 'skeleton-circle',
        variant === 'text' && 'skeleton-text',
        className,
      )}
    />
  );
}
