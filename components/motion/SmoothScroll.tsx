'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Smooth wheel scrolling with Lenis (founder decision 2026-11-23, after
 * ccopadel.com). The page still scrolls natively underneath: sticky blocks,
 * ScrollProgress and the header's scroll listener read the real scroll
 * position. Touch keeps the phone's own scrolling (syncTouch off): the
 * reference device is a mid-range Android. Nothing runs under
 * prefers-reduced-motion. Scrollable panels inside the page (menus, the
 * slide-over, the cart) scroll on their own (allowNestedScroll).
 */
export function SmoothScroll() {
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;
    const start = () => {
      lenis?.destroy();
      lenis = query.matches
        ? null
        : new Lenis({
            autoRaf: true,
            allowNestedScroll: true,
            anchors: true,
            // An open dialog (the photo viewer) keeps the wheel to itself.
            prevent: (node) => !!node.closest('dialog[open]'),
          });
    };
    start();
    query.addEventListener('change', start);
    return () => {
      query.removeEventListener('change', start);
      lenis?.destroy();
    };
  }, []);

  return null;
}
