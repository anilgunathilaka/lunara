'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Icon } from '@/components/primitives/Icon';

export interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
}

/**
 * docs/3-components.md §6.2 — used for add-to-cart confirmation; confirms
 * without navigating away from the product (docs/1-ux.md Flow A step 3).
 */
export function SlideOver({ open, onClose, title, closeLabel, children }: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="slideover-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="slideover-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="slideover-header">
          <h2 className="slideover-title">{title}</h2>
          <Button variant="tertiary" size="sm" aria-label={closeLabel} onClick={onClose}>
            <Icon icon={X} size="inline" />
          </Button>
        </div>
        <div className="slideover-content">{children}</div>
      </div>
    </div>
  );
}
