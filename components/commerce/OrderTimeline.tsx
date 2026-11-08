import type { TrackingStep } from '@/lib/commerce/tracking';

export interface OrderTimelineProps {
  steps: (TrackingStep & { label: string; time: string | null })[];
  /** Read by screen readers before the list, e.g. "Order progress". */
  label: string;
  /** Shown after the steps when the order was cancelled. */
  cancelledNote?: string;
}

/**
 * Order progress for customers (docs/1-ux.md §3.5). State is carried by
 * text and position as well as the marker, never by colour alone.
 */
export function OrderTimeline({ steps, label, cancelledNote }: OrderTimelineProps) {
  const lastDone = steps.map((s) => s.state).lastIndexOf('done');
  return (
    <div className="flex flex-col gap-3">
      <ol className="order-timeline" aria-label={label}>
        {steps.map((step, i) => (
          <li key={step.key} className="order-timeline-step" data-state={step.state} aria-current={i === lastDone ? 'step' : undefined}>
            <span className="order-timeline-marker" aria-hidden="true" />
            <span className="flex flex-col">
              <span className="order-timeline-label">{step.label}</span>
              {step.time && <span className="order-timeline-time">{step.time}</span>}
            </span>
          </li>
        ))}
      </ol>
      {cancelledNote && (
        <p className="field-message-error" role="status">
          {cancelledNote}
        </p>
      )}
    </div>
  );
}
