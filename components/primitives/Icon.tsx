import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconSize = 'inline' | 'default' | 'touch';

export interface IconProps {
  /** Any lucide-react icon component — line icons only (docs/2-ui.md §6.3). */
  icon: LucideIcon;
  /** inline=16px (with text), default=20px, touch=24px (touch targets). */
  size?: IconSize;
  className?: string;
  /** Provide only when the icon carries meaning on its own (no adjacent text label). */
  label?: string;
}

const SIZE_CLASS: Record<IconSize, string> = {
  inline: 'icon-inline',
  default: 'icon-default',
  touch: 'icon-touch',
};

export function Icon({ icon: IconComponent, size = 'default', className, label }: IconProps) {
  return (
    <IconComponent
      strokeWidth={1.5}
      className={cn('icon', SIZE_CLASS[size], className)}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    />
  );
}
