import { cn } from '@/lib/utils';

export interface SectionMarkerProps {
  className?: string;
}

/** 2px × 32px gold rule, placed directly above a heading. Decorative only. */
export function SectionMarker({ className }: SectionMarkerProps) {
  return <div className={cn('section-marker', className)} aria-hidden="true" />;
}
