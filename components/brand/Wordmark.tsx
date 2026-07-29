import { cn } from '@/lib/utils';

export interface WordmarkProps {
  /** 'inverted' for use on the dark --lun-plum-deep footer ground. */
  tone?: 'plum' | 'inverted';
  className?: string;
}

// The brand name is an invariant proper noun — identical in all three
// locales in messages/*.json's common.brand — so it's fixed here rather
// than threaded through as a translated prop.
export function Wordmark({ tone = 'plum', className }: WordmarkProps) {
  return (
    <span className={cn('wordmark', tone === 'inverted' && 'wordmark-inverted', className)}>
      Lunara Sarees
    </span>
  );
}
