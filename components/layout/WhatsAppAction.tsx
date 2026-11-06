import { MessageCircle } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';
import { cn } from '@/lib/utils';

export interface WhatsAppActionProps {
  /** e.g. https://wa.me/94XXXXXXXXX */
  href: string;
  label: string;
  /**
   * 'floating': fixed FAB, bottom-right on every viewport.
   * 'inline': text+icon for surfaces like the footer brand column.
   */
  variant: 'floating' | 'inline';
}

/** docs/3-components.md §6.2 — reachable from every page without scrolling. */
export function WhatsAppAction({ href, label, variant }: WhatsAppActionProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'whatsapp-action',
        variant === 'floating' ? 'whatsapp-action-floating' : 'whatsapp-action-inline',
      )}
    >
      <Icon icon={MessageCircle} size={variant === 'floating' ? 'touch' : 'default'} />
      <span className={variant === 'floating' ? 'sr-only' : undefined}>{label}</span>
    </a>
  );
}
