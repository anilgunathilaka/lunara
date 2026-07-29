'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface DesignOption {
  id: string;
  name: string;
  /** Rendered in the CURRENTLY SELECTED colour — never a generic sample (UX-C1b). */
  thumbnailUrl: string;
  disabled?: boolean;
}

export interface DesignPickerProps {
  designs: DesignOption[];
  selectedDesignId: string;
  onSelect: (id: string) => void;
  disabledAnnouncement: string;
}

/**
 * docs/3-components.md §4.2a (UX-C1a, UX-C1b). Selecting a design
 * preserves the current colour where available — that's the caller's
 * responsibility (it owns colour state), not this component's.
 */
export function DesignPicker({ designs, selectedDesignId, onSelect, disabledAnnouncement }: DesignPickerProps) {
  return (
    <div className="design-picker" role="radiogroup">
      {designs.map((design) => {
        const isSelected = design.id === selectedDesignId;
        return (
          <button
            key={design.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-disabled={design.disabled || undefined}
            disabled={design.disabled}
            onClick={() => onSelect(design.id)}
            className={cn(
              'design-picker-tile',
              isSelected && 'design-picker-tile-selected',
              design.disabled && 'design-picker-tile-disabled',
            )}
          >
            <span className="design-picker-thumb">
              <Image src={design.thumbnailUrl} alt="" fill sizes="120px" />
            </span>
            <span className="design-picker-name">{design.name}</span>
            {design.disabled && <span className="sr-only">, {disabledAnnouncement}</span>}
          </button>
        );
      })}
    </div>
  );
}
