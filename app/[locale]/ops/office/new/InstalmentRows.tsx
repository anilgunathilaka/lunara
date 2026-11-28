'use client';

import { useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { addMonths } from '@/lib/office/plan';

interface InstalmentRowsProps {
  /** Most instalments a plan can have (MAX_INSTALMENTS). */
  max: number;
  /** Rows shown at first. */
  initial: number;
  /** Today in Sri Lanka, YYYY-MM-DD: the first due date and the base for the rest. */
  today: string;
  labels: {
    due: string; // "Instalment {n} due"
    amount: string; // "Instalment {n} amount"
    auto: string;
    add: string;
    remove: string; // "Remove instalment {n}"
  };
}

/**
 * The instalment plan of a new office sale (founder decision 2026-11-27):
 * two rows to start, "Add instalment" up to `max`, any row removable while
 * more than one is left. The number of rows IS the number of instalments
 * (the hidden `instalments` field), and fields are named by position
 * (due_1, amount_1 …) as the server's readPlan expects.
 */
export function InstalmentRows({ max, initial, today, labels }: InstalmentRowsProps) {
  const nextId = useRef(initial);
  const [rows, setRows] = useState(() => Array.from({ length: Math.min(initial, max) }, (_, i) => ({ id: i, due: addMonths(today, i) })));
  const listRef = useRef<HTMLDivElement>(null);
  const fill = (pattern: string, n: number) => pattern.replace('{n}', String(n));

  const add = () => {
    if (rows.length >= max) return;
    // A month after the last row's date as it is now (it may have been changed).
    const last = listRef.current?.querySelector(`#due_${rows.length}`) as HTMLInputElement | null;
    const base = last?.value || rows[rows.length - 1]?.due || today;
    const id = nextId.current++;
    setRows([...rows, { id, due: addMonths(base, 1) }]);
    requestAnimationFrame(() => (listRef.current?.querySelector(`#due_${rows.length + 1}`) as HTMLElement | null)?.focus());
  };
  const remove = (id: number) => setRows(rows.filter((r) => r.id !== id));

  return (
    <div ref={listRef} className="flex flex-col gap-3">
      <input type="hidden" name="instalments" value={rows.length} />
      {rows.map((row, position) => {
        const n = position + 1;
        return (
          <div key={row.id} className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor={`due_${n}`}>
                {fill(labels.due, n)}
              </label>
              <input id={`due_${n}`} name={`due_${n}`} type="date" className="input" required defaultValue={row.due} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor={`amount_${n}`}>
                {fill(labels.amount, n)}
              </label>
              <input id={`amount_${n}`} name={`amount_${n}`} type="number" min={1} step={1} className="input ops-number-input" placeholder={labels.auto} />
            </div>
            {/* A fixed slot on every row, so every row's fields are the same width. */}
            <div className="ops-item-remove">
              {rows.length > 1 && (
                <Button type="button" variant="tertiary" onClick={() => remove(row.id)} aria-label={fill(labels.remove, n)}>
                  <X className="icon icon-inline" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
      {rows.length < max && (
        <div>
          <Button type="button" variant="secondary" size="sm" onClick={add}>
            <Plus className="icon icon-inline" aria-hidden="true" />
            {labels.add}
          </Button>
        </div>
      )}
    </div>
  );
}
