'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Toast } from '@/components/feedback/Toast';
import { InlineError } from '@/components/feedback/InlineError';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { Button } from '@/components/primitives/Button';

export interface FeedbackQaClientProps {
  toastAdded: string;
  toastRemoved: string;
  toastUndo: string;
  inlineErrorExample: string;
  emptyCartMessage: string;
  shopCuratedLabel: string;
  designYourOwnLabel: string;
}

export function FeedbackQaClient({
  toastAdded,
  toastRemoved,
  toastUndo,
  inlineErrorExample,
  emptyCartMessage,
  shopCuratedLabel,
  designYourOwnLabel,
}: FeedbackQaClientProps) {
  const [plainToast, setPlainToast] = useState(false);
  const [undoToast, setUndoToast] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="field-label">Toast</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setPlainToast(true)}>Show 4s auto-dismiss toast</Button>
          <Button variant="secondary" onClick={() => setUndoToast(true)}>
            Show undo toast (persists)
          </Button>
        </div>
        {plainToast && <Toast message={toastAdded} onDismiss={() => setPlainToast(false)} />}
        {undoToast && (
          <Toast
            message={toastRemoved}
            undoLabel={toastUndo}
            onUndo={() => setUndoToast(false)}
            onDismiss={() => setUndoToast(false)}
          />
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="field-label">InlineError</h2>
        <InlineError message={inlineErrorExample} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="field-label">EmptyState — cart, two equal doors</h2>
        <EmptyState
          icon={ShoppingCart}
          message={emptyCartMessage}
          actions={[
            { href: '/', label: shopCuratedLabel },
            { href: '/', label: designYourOwnLabel },
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="field-label">LoadingSkeleton</h2>
        <div className="flex items-center gap-4">
          <LoadingSkeleton
            variant="circle"
            style={{ width: 'var(--size-icon-touch)', height: 'var(--size-icon-touch)' }}
          />
          <div className="flex flex-1 flex-col gap-2">
            <LoadingSkeleton variant="text" className="w-3/4" />
            <LoadingSkeleton variant="text" className="w-1/2" />
          </div>
        </div>
        <LoadingSkeleton className="aspect-[4/5]" style={{ width: 'var(--size-swatch-lg)' }} />
      </section>
    </div>
  );
}
