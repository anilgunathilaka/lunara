'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section';
}

/**
 * Words rise softly into place as they scroll into view (docs/2-ui.md §7.4).
 * Text only — never wrap a product photograph in this (§7.1).
 *
 * The content is visible by default: only once this has mounted, and only
 * if the block is still below the fold, is it held back until it arrives.
 * Without JavaScript, or under prefers-reduced-motion, nothing is hidden.
 */
export function Reveal({ children, className, as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.reveal = 'pending';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.dataset.reveal = 'in';
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={cn('reveal', className)}>
      {children}
    </Tag>
  );
}
