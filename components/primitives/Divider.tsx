import { cn } from '@/lib/utils';

export interface DividerProps {
  tone?: 'line' | 'gold';
  className?: string;
}

export function Divider({ tone = 'line', className }: DividerProps) {
  return <hr className={cn('divider', tone === 'gold' && 'divider-gold', className)} />;
}
