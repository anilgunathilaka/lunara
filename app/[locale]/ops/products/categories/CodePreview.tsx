'use client';

import { useState } from 'react';
import { codePrefixFor, formatProductCode } from '@/lib/catalogue/product-code';

/**
 * The category name field, with the product code its first saree will get,
 * shown as the name is typed (PRD v4.0). The server forms the prefix again
 * on save, by the same rule, so this is a preview only.
 */
export function CategoryNameWithCode({
  taken,
  label,
  hint,
  previewLabel,
}: {
  taken: string[];
  label: string;
  hint: string;
  /** "First code: {code}", with {code} replaced here. */
  previewLabel: string;
}) {
  const [name, setName] = useState('');
  const prefix = codePrefixFor(name, taken);

  return (
    <div className="flex flex-col gap-1">
      <label className="field-label" htmlFor="name">
        {label}
      </label>
      <input
        id="name"
        name="name"
        className="input"
        required
        minLength={2}
        maxLength={60}
        placeholder={hint}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <p className="field-message" aria-live="polite">
        {prefix ? previewLabel.replace('{code}', formatProductCode(prefix, 1)) : ' '}
      </p>
    </div>
  );
}
