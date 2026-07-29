'use client';

import { useEffect } from 'react';
import { Button } from '@/components/primitives/Button';

// docs/3-components.md §6.1 — auto-dismiss delay. A JS timer value, not a
// CSS transition duration, so it's a plain constant rather than a
// lib/tokens.css entry (that file is for values consumed via CSS var()).
const AUTO_DISMISS_MS = 4000;

export interface ToastProps {
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
  onDismiss: () => void;
}

/**
 * docs/3-components.md §6.1. Bottom-centre on mobile, bottom-right on
 * desktop (positioning in globals.css). Auto-dismisses after 4s EXCEPT
 * when it carries an undo action — that needs to stay until acted on.
 */
export function Toast({ message, undoLabel, onUndo, onDismiss }: ToastProps) {
  useEffect(() => {
    if (onUndo) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onUndo, onDismiss]);

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-message">{message}</span>
      {undoLabel && onUndo && (
        <Button variant="tertiary" size="sm" onClick={onUndo} className="toast-undo">
          {undoLabel}
        </Button>
      )}
    </div>
  );
}
