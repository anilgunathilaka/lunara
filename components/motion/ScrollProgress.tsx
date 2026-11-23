'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ScrollProgressProps {
  children: ReactNode;
  className?: string;
  /**
   * 'stage': a tall block whose inside stays pinned (position: sticky);
   * --p runs 0 → 1 while it scrolls through. 'enter': a block passing by;
   * --p runs 0 → 1 from entering the bottom of the screen to reaching
   * its upper third.
   */
  mode?: 'stage' | 'enter';
  as?: 'div' | 'section';
  style?: CSSProperties;
  'aria-label'?: string;
}

/**
 * Scroll-linked motion (docs/2-ui.md §7.4, after ccopadel.com): writes how
 * far the block has scrolled as the CSS variable --p (0 to 1); the styles
 * do the rest. Under prefers-reduced-motion, or before JavaScript runs,
 * --p is 1: everything shows in its finished state.
 */
export function ScrollProgress({ children, className, mode = 'enter', as: Tag = 'div', style, ...rest }: ScrollProgressProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const view = window.innerHeight;
      const raw =
        mode === 'stage'
          ? -rect.top / Math.max(1, rect.height - view)
          : (view - rect.top) / Math.max(1, view * 0.65);
      el.style.setProperty('--p', String(Math.min(1, Math.max(0, raw))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [mode]);

  return (
    <Tag ref={ref} className={cn('scroll-progress', className)} style={style} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * A sentence whose words darken one after another as it scrolls into view
 * (inside a ScrollProgress). Screen readers get the sentence whole.
 */
export function ScrollWords({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="scroll-words" style={{ '--n': words.length } as CSSProperties}>
        {words.map((word, i) => (
          <span key={i} className="scroll-word" style={{ '--i': i } as CSSProperties}>
            {word}{' '}
          </span>
        ))}
      </span>
    </>
  );
}
