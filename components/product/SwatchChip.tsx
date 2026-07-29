'use client';

import { cn } from '@/lib/utils';

export type SwatchChipState = 'default' | 'selected' | 'disabled' | 'low-stock';
export type SwatchChipSize = 'sm' | 'md' | 'lg';

export interface SwatchChipProps {
  /** True sampled fabric colour — catalogue data, never a design-system token. */
  colourHex: string;
  /** Texture tile, overlaid at low opacity for weave. */
  textureUrl?: string;
  /** Colour name, e.g. "Deep teal". */
  label: string;
  /** e.g. "Voile". */
  materialName: string;
  state?: SwatchChipState;
  size?: SwatchChipSize;
  onSelect?: () => void;
  /** For a parent SwatchGrid's roving-tabindex radiogroup; uncontrolled otherwise. */
  tabIndex?: number;
  /**
   * Translated announcement appended after the colour name for the
   * 'low-stock' or 'disabled' state (e.g. "Low stock", "Out of stock").
   * SwatchChip renders no copy of its own — the caller has locale context.
   */
  stateAnnouncement?: string;
}

const SIZE_CLASS: Record<SwatchChipSize, string> = {
  sm: 'swatch-chip-sm',
  md: 'swatch-chip-md',
  lg: 'swatch-chip-lg',
};

export function SwatchChip({
  colourHex,
  textureUrl,
  label,
  materialName,
  state = 'default',
  size = 'md',
  onSelect,
  tabIndex,
  stateAnnouncement,
}: SwatchChipProps) {
  const isDisabled = state === 'disabled';
  const isSelected = state === 'selected';
  const isLowStock = state === 'low-stock';

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : tabIndex}
      onClick={isDisabled ? undefined : onSelect}
      className={cn(
        'swatch-chip-hit',
        isSelected && 'swatch-chip-selected',
        isDisabled && 'swatch-chip-disabled',
      )}
    >
      <span className={cn('swatch-chip', SIZE_CLASS[size])} style={{ backgroundColor: colourHex }}>
        {textureUrl && (
          <span
            className="swatch-chip-texture"
            style={{ backgroundImage: `url(${textureUrl})` }}
            aria-hidden="true"
          />
        )}
        {isDisabled && <span className="swatch-chip-diagonal" aria-hidden="true" />}
        {isLowStock && <span className="swatch-chip-dot" aria-hidden="true" />}
      </span>
      <span className="sr-only">
        {materialName}, {label}
        {(isLowStock || isDisabled) && stateAnnouncement ? `, ${stateAnnouncement}` : ''}
      </span>
    </button>
  );
}
