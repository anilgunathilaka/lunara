'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { deleteOfficeCustomerAction } from '@/lib/ops/office-actions';

/**
 * Deletes an office customer who has no sales, after the browser's own
 * confirmation (founder decision 2026-11-27). The server checks again.
 */
export function DeleteCustomerButton({
  id,
  locale,
  label,
  confirmText,
  ariaLabel,
  size = 'sm',
}: {
  id: string;
  locale: string;
  label: string;
  confirmText: string;
  ariaLabel?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <form
      action={deleteOfficeCustomerAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" size={size} aria-label={ariaLabel}>
        <Trash2 className="icon icon-inline" aria-hidden="true" />
        {label}
      </Button>
    </form>
  );
}
