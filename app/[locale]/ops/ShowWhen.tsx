'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Shows its fields only while a choice in the same form has a given value,
 * e.g. the new-design name only after "+ New design" is chosen
 * (docs/2-ui.md §7.7). Without JavaScript the fields stay visible, so the
 * form still works.
 */
export function ShowWhen({ field, value, children }: { field: string; value: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const form = ref.current?.closest('form');
    if (!form) return;
    const read = () => {
      const el = form.elements.namedItem(field);
      setShown(el instanceof HTMLSelectElement || el instanceof HTMLInputElement ? el.value === value : true);
    };
    read();
    form.addEventListener('change', read);
    return () => form.removeEventListener('change', read);
  }, [field, value]);

  return (
    <div ref={ref} hidden={!shown} className="ops-show-when">
      {children}
    </div>
  );
}
