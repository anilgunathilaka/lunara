import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Icon } from '@/components/primitives/Icon';

export interface CheckoutStepProps {
  /** Already formatted/translated, e.g. "Step 3 of 5". */
  stepIndicatorLabel: string;
  title: string;
  onBack?: () => void;
  backLabel?: string;
  children: ReactNode;
}

/** docs/1-ux.md §3.4 Flow D — the shared shell for each checkout step. */
export function CheckoutStep({
  stepIndicatorLabel,
  title,
  onBack,
  backLabel,
  children,
}: CheckoutStepProps) {
  return (
    <section className="checkout-step">
      <div className="checkout-step-header">
        {onBack && backLabel && (
          <Button variant="tertiary" size="sm" onClick={onBack} iconLeft={<Icon icon={ArrowLeft} size="inline" />}>
            {backLabel}
          </Button>
        )}
        <p className="checkout-step-indicator">{stepIndicatorLabel}</p>
        <h2 className="checkout-step-title">{title}</h2>
      </div>
      <div className="checkout-step-content">{children}</div>
    </section>
  );
}
