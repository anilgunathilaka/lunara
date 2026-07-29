import { cn } from '@/lib/utils';

export interface MotifDividerProps {
  className?: string;
}

/**
 * Hairline — ❋ — hairline. Limited to once per screen section by
 * convention (docs/3-components.md §2.3) — the component itself has no
 * way to enforce that, so callers must not reach for it twice on one
 * screen. Never rendered inside the configurator preview area.
 */
export function MotifDivider({ className }: MotifDividerProps) {
  return (
    <div className={cn('motif-divider', className)} aria-hidden="true">
      <span className="motif-divider-mark">❋</span>
    </div>
  );
}
