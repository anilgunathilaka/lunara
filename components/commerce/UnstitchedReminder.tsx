import { Info } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';
import { Checkbox } from '@/components/primitives/Checkbox';

export interface UnstitchedReminderProps {
  variant: 'inline' | 'checkout';
  /** Already translated. The single most likely product misunderstanding — never soften this copy. */
  message: string;
  /**
   * checkout variant only. The caller must initialise this to `false` —
   * it can never be pre-checked, and the order-placement action must stay
   * disabled until it is `true` (that gate lives in the checkout flow,
   * not here).
   */
  acknowledged?: boolean;
  onAcknowledge?: (acknowledged: boolean) => void;
  /** checkout variant only — already translated. */
  acknowledgeLabel?: string;
}

/**
 * docs/3-components.md §5.2. `inline` is informational only (product page,
 * cart lines). `checkout` requires an explicit, never-pre-checked
 * acknowledgement before the order can be placed.
 */
export function UnstitchedReminder({
  variant,
  message,
  acknowledged,
  onAcknowledge,
  acknowledgeLabel,
}: UnstitchedReminderProps) {
  return (
    <div className="unstitched-reminder">
      <Icon icon={Info} className="unstitched-reminder-icon" />
      <div className="unstitched-reminder-body">
        <p className="unstitched-reminder-message">{message}</p>
        {variant === 'checkout' && acknowledgeLabel && (
          <Checkbox
            label={acknowledgeLabel}
            required
            checked={acknowledged ?? false}
            onChange={(event) => onAcknowledge?.(event.target.checked)}
          />
        )}
      </div>
    </div>
  );
}
