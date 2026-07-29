'use client';

import Image from 'next/image';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Icon } from '@/components/primitives/Icon';

export interface SuggestedItem {
  id: string;
  name: string;
  thumbnailUrl: string;
}

export interface SuggestedStripProps {
  heading: string;
  items: SuggestedItem[];
  onSelect: (id: string) => void;
  onRefresh?: () => void;
  refreshLabel?: string;
}

/**
 * docs/3-components.md §4.4 (UX-C11). Selecting an item loads it as the
 * working design — everything stays changeable from there. Refreshable
 * without losing the current design (the caller decides what "current"
 * means; this strip never mutates it on its own).
 */
export function SuggestedStrip({ heading, items, onSelect, onRefresh, refreshLabel }: SuggestedStripProps) {
  return (
    <div className="suggested-strip">
      <div className="suggested-strip-header">
        <h3 className="field-label">{heading}</h3>
        {onRefresh && refreshLabel && (
          <Button
            variant="tertiary"
            size="sm"
            onClick={onRefresh}
            iconLeft={<Icon icon={RefreshCw} size="inline" />}
          >
            {refreshLabel}
          </Button>
        )}
      </div>
      <div className="suggested-strip-track">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="suggested-strip-item"
            onClick={() => onSelect(item.id)}
          >
            <span className="suggested-strip-thumb">
              <Image src={item.thumbnailUrl} alt={item.name} fill sizes="140px" />
            </span>
            <span className="suggested-strip-name">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
