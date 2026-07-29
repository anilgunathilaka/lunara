import type { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';

export interface EmptyStateAction {
  href: string;
  label: string;
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  /**
   * Always at least one. An empty cart offers BOTH doors — curated shop
   * and configurator — with equal visual weight, so two actions render
   * identically rather than one styled as primary (docs/3-components.md §6.1).
   */
  actions: [EmptyStateAction] | [EmptyStateAction, EmptyStateAction];
}

export function EmptyState({ icon, message, actions }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <Icon icon={icon} size="touch" className="empty-state-icon" />}
      <p className="empty-state-message">{message}</p>
      <div className="empty-state-actions">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="btn focus-ring btn-secondary btn-md"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
