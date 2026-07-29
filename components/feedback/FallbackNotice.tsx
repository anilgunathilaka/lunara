import { AlertTriangle } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';

export interface FallbackNoticeProps {
  /** States plainly that rotation is unavailable and photography is shown instead — never pretends nothing is wrong. */
  message: string;
}

/** docs/3-components.md §6.1, docs/4-architecture.md §5.4 (Degradation Ladder). */
export function FallbackNotice({ message }: FallbackNoticeProps) {
  return (
    <div className="fallback-notice" role="status">
      <Icon icon={AlertTriangle} size="inline" className="fallback-notice-icon" />
      <p className="fallback-notice-message">{message}</p>
    </div>
  );
}
