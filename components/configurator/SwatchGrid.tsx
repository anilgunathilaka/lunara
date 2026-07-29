'use client';

import { useState, type CSSProperties, type KeyboardEvent } from 'react';
import { SwatchChip, type SwatchChipState } from '@/components/product/SwatchChip';

export interface SwatchGridItem {
  id: string;
  colourHex: string;
  textureUrl?: string;
  label: string;
  materialName: string;
  /** 'selected' is computed from `selectedId`, not set per-item. */
  availability: 'available' | 'disabled' | 'low-stock';
  /** Grouping key, e.g. a material name — used when `groupBy` is set. */
  group?: string;
}

export interface SwatchGridProps {
  items: SwatchGridItem[];
  selectedId?: string;
  columns: { mobile: number; tablet: number; desktop: number };
  groupBy?: 'material' | 'colourFamily';
  onSelect: (id: string) => void;
  /** Translated announcements appended for disabled/low-stock chips. */
  disabledAnnouncement: string;
  lowStockAnnouncement: string;
}

function resolveState(item: SwatchGridItem, selectedId: string | undefined): SwatchChipState {
  if (item.availability === 'disabled') return 'disabled';
  if (item.id === selectedId) return 'selected';
  if (item.availability === 'low-stock') return 'low-stock';
  return 'default';
}

/**
 * docs/3-components.md §3.2. Roving-tabindex radiogroup: arrow keys move
 * between chips (skipping disabled ones), Enter/Space selects (native
 * button behaviour). Out-of-stock chips stay in place — never removed,
 * so the grid never reflows as stock changes.
 */
export function SwatchGrid({
  items,
  selectedId,
  columns,
  groupBy,
  onSelect,
  disabledAnnouncement,
  lowStockAnnouncement,
}: SwatchGridProps) {
  const [focusedId, setFocusedId] = useState(selectedId ?? items.find((i) => i.availability !== 'disabled')?.id);

  function moveFocus(fromId: string | undefined, direction: 1 | -1) {
    const enabled = items.filter((i) => i.availability !== 'disabled');
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((i) => i.id === fromId);
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + direction + enabled.length) % enabled.length;
    const next = enabled[nextIndex];
    if (next) setFocusedId(next.id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(focusedId, 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(focusedId, -1);
    }
  }

  const groups = groupBy
    ? Array.from(new Set(items.map((item) => item.group).filter(Boolean))).map((group) => ({
        group,
        items: items.filter((item) => item.group === group),
      }))
    : [{ group: undefined, items }];

  const gridStyle = {
    '--grid-cols-mobile': columns.mobile,
    '--grid-cols-tablet': columns.tablet,
    '--grid-cols-desktop': columns.desktop,
  } as CSSProperties;

  return (
    <div className="flex flex-col gap-4">
      {groups.map(({ group, items: groupItems }) => (
        <div key={group ?? 'all'} className="flex flex-col gap-2">
          {group && <p className="swatch-grid-group-label">{group}</p>}
          <div
            role="radiogroup"
            className="swatch-grid"
            style={gridStyle}
            onKeyDown={handleKeyDown}
          >
            {groupItems.map((item) => {
              const state = resolveState(item, selectedId);
              const isFocusable = item.id === focusedId;
              return (
                <SwatchChip
                  key={item.id}
                  colourHex={item.colourHex}
                  textureUrl={item.textureUrl}
                  label={item.label}
                  materialName={item.materialName}
                  state={state}
                  onSelect={() => onSelect(item.id)}
                  tabIndex={isFocusable ? 0 : -1}
                  stateAnnouncement={
                    state === 'disabled'
                      ? disabledAnnouncement
                      : state === 'low-stock'
                        ? lowStockAnnouncement
                        : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
