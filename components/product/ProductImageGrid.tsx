'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';
import type { GalleryAsset } from '@/components/product/ProductGallery';

export interface ProductImageGridProps {
  assets: GalleryAsset[];
  /** Already translated, e.g. "Colour reference". */
  referenceFrameLabel: string;
  /** Names the larger view for screen readers, e.g. the saree's name. */
  viewerLabel: string;
  closeLabel: string;
}

/**
 * Product photographs as a grid, wide screens only (docs/2-ui.md §7.5;
 * founder decision 2026-11-13, after secchiariboots.com): every photograph at
 * once, two to a row, each in a square tile with the whole photograph inside
 * it. Choosing one opens it larger in the middle of the screen, full height,
 * over the page; the page behind is dimmed, the photograph never is (§7.1).
 * Escape, the close button or a click outside the photograph closes it.
 * Below 1024px the page shows ProductGallery instead.
 */
export function ProductImageGrid({ assets, referenceFrameLabel, viewerLabel, closeLabel }: ProductImageGridProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const shown = open === null ? undefined : assets[open];

  function view(index: number) {
    setOpen(index);
    dialog.current?.showModal();
  }
  function close() {
    dialog.current?.close();
  }

  return (
    <>
      <ul className="pdp-grid">
        {assets.map((asset, index) => (
          <li key={index} className="pdp-grid-tile">
            <button type="button" className="pdp-grid-button focus-ring" onClick={() => view(index)} aria-label={asset.alt}>
              {asset.type === 'video' ? (
                <video src={asset.src} muted playsInline aria-hidden="true" />
              ) : (
                <Image src={asset.src} alt="" fill sizes="(min-width: 1024px) 35vw, 1px" priority={index < 2} />
              )}
            </button>
            {asset.isReferenceFrame && <span className="gallery-reference-label pdp-grid-label">{referenceFrameLabel}</span>}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="pdp-viewer"
        aria-label={viewerLabel}
        onClose={() => setOpen(null)}
        // A click on the backdrop lands on the dialog itself, not on the panel inside it.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="pdp-viewer-panel">
          {shown &&
            (shown.type === 'video' ? (
              <video src={shown.src} muted loop playsInline controls aria-label={shown.alt} />
            ) : (
              <Image src={shown.src} alt={shown.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" />
            ))}
          <button type="button" className="pdp-viewer-close focus-ring" onClick={close} aria-label={closeLabel}>
            <Icon icon={X} size="inline" />
          </button>
        </div>
      </dialog>
    </>
  );
}
