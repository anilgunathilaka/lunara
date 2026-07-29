'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Defaults to the first item — product detail secondary blocks open with panel one by default. */
  defaultOpenId?: string;
}

/** docs/3-components.md §6.2 — product detail secondary blocks on mobile. */
export function Accordion({ items, defaultOpenId }: AccordionProps) {
  const [openId, setOpenId] = useState(defaultOpenId ?? items[0]?.id);

  return (
    <div className="accordion">
      {items.map((item) => {
        const isOpen = item.id === openId;
        const panelId = `${item.id}-panel`;
        return (
          <div key={item.id} className="accordion-item">
            <button
              type="button"
              className="accordion-trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId(isOpen ? undefined : item.id)}
            >
              <span className="accordion-title">{item.title}</span>
              <Icon
                icon={ChevronDown}
                size="inline"
                className={cn('accordion-chevron', isOpen && 'accordion-chevron-open')}
              />
            </button>
            {isOpen && (
              <div id={panelId} className="accordion-panel">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
