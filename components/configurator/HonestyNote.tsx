import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';

export interface HonestyNoteProps {
  /**
   * The caller composes the translated sentence with embedded links to
   * sareeReferenceHref/jacketReferenceHref (e.g. via next-intl's `t.rich`)
   * — sentence word order differs across Sinhala/Tamil/English, so this
   * component never assembles the sentence itself.
   */
  content: ReactNode;
}

/**
 * docs/3-components.md §4.2 (UX-C6). Always visible adjacent to the
 * preview — never dismissible, never a tooltip, never a footnote.
 */
export function HonestyNote({ content }: HonestyNoteProps) {
  return (
    <div className="honesty-note" role="note">
      <Icon icon={Info} size="inline" className="honesty-note-icon" />
      <div className="honesty-note-text">{content}</div>
    </div>
  );
}
