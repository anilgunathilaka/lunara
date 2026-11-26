'use client';

import { useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/primitives/Button';

export interface ItemOption {
  value: string;
  label: string;
  disabled: boolean;
}

interface ItemRowsProps {
  /** Most rows a sale can have; the server reads item_0 … item_{max-1}. */
  max: number;
  sarees: ItemOption[];
  jackets: ItemOption[];
  labels: {
    item: string; // "Item {n}" with {n} already replaced by the caller's pattern below
    quantity: string;
    choose: string;
    sarees: string;
    jacketsAlone: string;
    addItem: string;
    removeItem: string; // "Remove item {n}" pattern
  };
}

/**
 * The items of a new office sale (founder decision 2026-11-25): one row to
 * start, "Add another item" opens the next, up to `max`. Each row keeps its
 * own slot number for its field names, so removing a row never renames the
 * others; the server skips empty slots.
 */
export function ItemRows({ max, sarees, jackets, labels }: ItemRowsProps) {
  const [slots, setSlots] = useState<number[]>([0]);
  const listRef = useRef<HTMLDivElement>(null);
  const fill = (pattern: string, n: number) => pattern.replace('{n}', String(n));

  const add = () => {
    const next = Array.from({ length: max }, (_, i) => i).find((i) => !slots.includes(i));
    if (next === undefined) return;
    setSlots([...slots, next]);
    // Move focus to the new row's item picker once it renders.
    requestAnimationFrame(() => (listRef.current?.querySelector(`#item_${next}`) as HTMLElement | null)?.focus());
  };
  const remove = (slot: number) => setSlots(slots.filter((s) => s !== slot));
  const option = (o: ItemOption) => (
    <option key={o.value} value={o.value} disabled={o.disabled}>
      {o.label}
    </option>
  );

  return (
    <div ref={listRef} className="flex flex-col gap-3">
      {slots.map((slot, position) => {
        const n = position + 1;
        return (
          <div key={slot} className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor={`item_${slot}`}>
                {fill(labels.item, n)}
              </label>
              <select id={`item_${slot}`} name={`item_${slot}`} className="input" defaultValue="" required>
                <option value="">{labels.choose}</option>
                <optgroup label={labels.sarees}>{sarees.map(option)}</optgroup>
                {jackets.length > 0 && <optgroup label={labels.jacketsAlone}>{jackets.map(option)}</optgroup>}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor={`qty_${slot}`}>
                {labels.quantity}
              </label>
              <input id={`qty_${slot}`} name={`qty_${slot}`} type="number" min={1} max={20} step={1} defaultValue={1} className="input ops-number-input" />
            </div>
            {/* A fixed slot on every row (empty on the first), so every row's fields are the same width. */}
            <div className="ops-item-remove">
              {position > 0 && (
                <Button type="button" variant="tertiary" onClick={() => remove(slot)} aria-label={fill(labels.removeItem, n)}>
                  <X className="icon icon-inline" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
      {slots.length < max && (
        <div>
          <Button type="button" variant="secondary" size="sm" onClick={add}>
            <Plus className="icon icon-inline" aria-hidden="true" />
            {labels.addItem}
          </Button>
        </div>
      )}
    </div>
  );
}
