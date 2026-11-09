'use client';

import { useId, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';
import { cn } from '@/lib/utils';

export interface HeaderMenuLink {
  href: string;
  label: string;
  /** Opens outside the site (WhatsApp). */
  external?: boolean;
}

export interface HeaderMenuImage {
  src: string;
  alt: string;
  /** Already sized and compressed (a founder image on R2): skip the optimiser. */
  unoptimized?: boolean;
}

/** One entry in the large list on the left of the panel. */
export interface HeaderMenuCategory {
  label: string;
  href: string;
  /** Small capitals above the description. */
  tag: string;
  description: string;
  links?: HeaderMenuLink[];
  /** Photographs for the right of the panel while this entry is active; else the menu's own. */
  media?: HeaderMenuImage[];
}

/** The panel that opens under a header item (docs/2-ui.md §7.2). */
export interface HeaderMegaMenu {
  /** Names the panel and its toggle for screen readers: "Shop menu". */
  label: string;
  categories: HeaderMenuCategory[];
  media: HeaderMenuImage[];
  foot?: { text: string; cta: HeaderMenuLink };
}

export interface NavItemProps {
  href: string;
  label: string;
  menu?: HeaderMegaMenu;
}

function MenuLink({ link, className, onClick }: { link: HeaderMenuLink; className: string; onClick: () => void }) {
  return link.external ? (
    <a href={link.href} className={className} target="_blank" rel="noopener noreferrer" onClick={onClick}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={className} onClick={onClick}>
      {link.label}
    </Link>
  );
}

/**
 * A header link, and — when it has a menu — the panel beneath the header
 * (after bedrock-one-nu.vercel.app): a rounded --lun-plum-deep panel with
 * large entries on the left; pointing at or focusing one shows its tag,
 * description and links in the middle and its photographs on the right,
 * with a hairline foot below.
 *
 * The pointer opens it on hover; the keyboard opens it with the chevron
 * button beside the link (a disclosure, so the link itself still just goes
 * to its page). Escape closes it and returns focus to the chevron.
 */
export function NavItem({ href, label, menu }: NavItemProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const panelId = useId();
  const toggle = useRef<HTMLButtonElement>(null);

  if (!menu) {
    return (
      <Link href={href} className="site-header-link">
        {label}
      </Link>
    );
  }

  const show = () => {
    setActive(0);
    setOpen(true);
  };
  const close = () => setOpen(false);
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) {
      close();
      toggle.current?.focus();
    }
  };

  const current = menu.categories[active] ?? menu.categories[0];
  const media = (current?.media ?? menu.media).slice(0, 4);
  // Two columns of photographs, as in the reference: odd ones left, even ones right.
  const columns = [media.filter((_, i) => i % 2 === 0), media.filter((_, i) => i % 2 === 1)].filter((c) => c.length > 0);

  return (
    <div
      className={cn('site-header-item', open && 'is-open')}
      onPointerEnter={(event) => event.pointerType === 'mouse' && !open && show()}
      onPointerLeave={(event) => event.pointerType === 'mouse' && close()}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <Link href={href} className="site-header-link" onClick={close}>
        {label}
      </Link>
      <button
        ref={toggle}
        type="button"
        className="site-header-toggle focus-ring"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={menu.label}
        onClick={() => (open ? close() : show())}
      >
        <Icon icon={ChevronDown} size="inline" />
      </button>

      {/* Rendered only while open, so the panel's entrance plays each time. */}
      <div id={panelId} className="site-mega" role="region" aria-label={menu.label} hidden={!open}>
        {open && current && (
          <>
            <div className={cn('site-mega-body', columns.length === 0 && 'site-mega-body-no-media')}>
              <ul className="site-mega-cats">
                {menu.categories.map((category, i) => (
                  <li key={category.href + category.label}>
                    <Link
                      href={category.href}
                      className={cn('site-mega-cat', i === active && 'is-active')}
                      aria-current={i === active ? 'true' : undefined}
                      onPointerEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={close}
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Keyed by the entry, so its rise plays again on every change. */}
              <div key={active} className="site-mega-pane">
                <p className="site-mega-tag">{current.tag}</p>
                <p className="site-mega-desc">{current.description}</p>
                {current.links && current.links.length > 0 && (
                  <ul className="site-mega-links">
                    {current.links.map((link) => (
                      <li key={link.label}>
                        <MenuLink link={link} className="site-mega-link" onClick={close} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {columns.length > 0 && (
                <div className="site-mega-media" aria-hidden="true">
                  {columns.map((column, c) => (
                    <div key={c} className="site-mega-media-col">
                      {column.map((image) => (
                        <div key={image.src + c} className="site-mega-media-frame">
                          <Image src={image.src} alt="" fill sizes="160px" unoptimized={image.unoptimized} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {menu.foot && (
              <div className="site-mega-foot">
                <p>{menu.foot.text}</p>
                <MenuLink link={menu.foot.cta} className="site-mega-foot-link" onClick={close} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
