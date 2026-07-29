'use client';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export type DrapeValue = 'saree' | 'osariya';

export interface DrapeToggleProps {
  value: DrapeValue;
  onChange: (value: DrapeValue) => void;
  sareeLabel: string;
  /** Translated primary label; the ඔසරිය script is appended by this component regardless of locale (docs/3-components.md §4.3). */
  osariyaLabel: string;
  explainerHref: string;
  explainerLabel: string;
}

/**
 * docs/3-components.md §4.3 (UX-C3). Switching never clears design,
 * material, colour or jacket — that state lives with the caller, this
 * component only reports the new value.
 */
export function DrapeToggle({
  value,
  onChange,
  sareeLabel,
  osariyaLabel,
  explainerHref,
  explainerLabel,
}: DrapeToggleProps) {
  return (
    <div className="drape-toggle">
      <div role="radiogroup" className="drape-toggle-options">
        <button
          type="button"
          role="radio"
          aria-checked={value === 'saree'}
          onClick={() => onChange('saree')}
          className={cn('drape-option', value === 'saree' && 'drape-option-active')}
        >
          {sareeLabel}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === 'osariya'}
          onClick={() => onChange('osariya')}
          className={cn('drape-option', value === 'osariya' && 'drape-option-active')}
        >
          {osariyaLabel} <span lang="si">ඔසරිය</span>
        </button>
      </div>
      <Link href={explainerHref} className="btn focus-ring btn-tertiary btn-sm">
        {explainerLabel}
      </Link>
    </div>
  );
}
