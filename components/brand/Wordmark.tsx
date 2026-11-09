import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface WordmarkProps {
  /** 'inverted' for use on the dark --lun-plum-deep footer ground. */
  tone?: 'plum' | 'inverted';
  className?: string;
}

// The brand name is an invariant proper noun — identical in all three
// locales in messages/*.json's common.brand — so it's fixed here rather
// than threaded through as a translated prop.
const BRAND = 'Lunara Sarees';

/**
 * The Lunara logo (public/brand, from the founder's artwork in
 * public/images). On light grounds: the full logo. On the dark footer the
 * logo's plum lettering would vanish, so the gold emblem sits beside the
 * name set in the surface colour.
 */
export function Wordmark({ tone = 'plum', className }: WordmarkProps) {
  if (tone === 'inverted') {
    return (
      <span className={cn('wordmark wordmark-inverted wordmark-lockup', className)}>
        <Image src="/brand/lunara-emblem.webp" alt="" width={128} height={128} className="wordmark-emblem" unoptimized />
        {BRAND}
      </span>
    );
  }
  return (
    <span className={cn('wordmark', className)}>
      <Image src="/brand/lunara-logo.webp" alt={BRAND} width={560} height={156} className="wordmark-logo" priority unoptimized />
    </span>
  );
}
