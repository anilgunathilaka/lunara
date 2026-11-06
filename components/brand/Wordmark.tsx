import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface WordmarkProps {
  /** 'inverted' for use on the dark --lun-plum-deep footer ground. */
  tone?: 'plum' | 'inverted';
  /** Set on the header instance so the logo can participate in LCP. */
  priority?: boolean;
  className?: string;
}

/** Intrinsic asset size — public/images/lunara.webp */
const LOGO_WIDTH = 1950;
const LOGO_HEIGHT = 542;

/**
 * Brand lockup — gold medallion + plum wordmark from public/images/lunara.webp.
 * Served unoptimized so the transparent WebP is not flattened to a black JPEG
 * by the image optimizer (which made the plum lettering invisible).
 */
export function Wordmark({ tone = 'plum', priority = false, className }: WordmarkProps) {
  return (
    <span className={cn('wordmark', tone === 'inverted' && 'wordmark-inverted', className)}>
      <Image
        src="/images/lunara.webp"
        alt="Lunara Sarees"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={priority}
        unoptimized
        className="wordmark-image"
      />
    </span>
  );
}
