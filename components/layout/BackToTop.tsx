'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';

export interface BackToTopProps {
  label: string;
}

/** Fixed control matching the Jolie storefront “back to top” affordance. */
export function BackToTop({ label }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 480);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="back-to-top focus-ring"
      aria-label={label}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <Icon icon={ChevronUp} size="touch" />
    </button>
  );
}
