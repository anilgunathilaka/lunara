import { cn } from '@/lib/utils';

export type OpacityLevel = 'opaque' | 'semi-sheer' | 'sheer';

const FILLED_SEGMENTS: Record<OpacityLevel, number> = {
  opaque: 3,
  'semi-sheer': 2,
  sheer: 1,
};

export interface OpacityRatingProps {
  value: OpacityLevel;
  /** Already-translated plain-language label, e.g. "Semi-sheer". Colour
   * alone never conveys the rating (docs/3-components.md §3.5). */
  label: string;
  className?: string;
}

export function OpacityRating({ value, label, className }: OpacityRatingProps) {
  const filled = FILLED_SEGMENTS[value];
  return (
    <span className={cn('opacity-rating', className)}>
      <span className="opacity-rating-segments" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={cn(
              'opacity-rating-segment',
              index < filled && 'opacity-rating-segment-filled',
            )}
          />
        ))}
      </span>
      <span className="opacity-rating-label">{label}</span>
    </span>
  );
}
