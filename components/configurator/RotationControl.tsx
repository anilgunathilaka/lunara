import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Icon } from '@/components/primitives/Icon';

export interface RotationControlProps {
  onRotateLeft: () => void;
  onRotateRight: () => void;
  rotateLeftLabel: string;
  rotateRightLabel: string;
}

/**
 * docs/3-components.md §4.1 (UX-C8) — a discoverable fallback for drag,
 * not the primary interaction. PreviewCanvas composes this over the frame.
 */
export function RotationControl({
  onRotateLeft,
  onRotateRight,
  rotateLeftLabel,
  rotateRightLabel,
}: RotationControlProps) {
  return (
    <div className="rotation-control">
      <Button
        variant="secondary"
        size="sm"
        aria-label={rotateLeftLabel}
        onClick={onRotateLeft}
        className="rotation-control-button"
      >
        <Icon icon={ChevronLeft} size="inline" />
      </Button>
      <Button
        variant="secondary"
        size="sm"
        aria-label={rotateRightLabel}
        onClick={onRotateRight}
        className="rotation-control-button"
      >
        <Icon icon={ChevronRight} size="inline" />
      </Button>
    </div>
  );
}
