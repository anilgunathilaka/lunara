'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface GalleryAsset {
  type: 'image' | 'video';
  src: string;
  alt: string;
  /** Marks the one unedited daylight frame published as the colour reference. */
  isReferenceFrame?: boolean;
}

export interface ProductGalleryProps {
  /** Full drape → pallu detail → border close-up → texture macro → reference frame → video. */
  assets: GalleryAsset[];
  /** Already translated, e.g. "Colour reference". */
  referenceFrameLabel: string;
}

/**
 * docs/3-components.md §3.4. No filter, overlay, gradient, watermark or
 * animated transition on any product image — the active asset just swaps.
 */
export function ProductGallery({ assets, referenceFrameLabel }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = assets[activeIndex];
  if (!active) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="gallery-main">
        {active.type === 'video' ? (
          <video src={active.src} muted loop playsInline controls aria-label={active.alt} />
        ) : (
          <Image src={active.src} alt={active.alt} fill sizes="(min-width: 768px) 50vw, 100vw" />
        )}
        {active.isReferenceFrame && (
          <span className="gallery-reference-label absolute left-2 top-2">
            {referenceFrameLabel}
          </span>
        )}
      </div>

      {/* Desktop (≥768px): thumbnail strip, click-to-zoom (zoom handled by the caller / a future lightbox). */}
      <div className="gallery-thumbs hidden md:flex" role="tablist" aria-label={referenceFrameLabel}>
        {assets.map((asset, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            className={cn('gallery-thumb', index === activeIndex && 'gallery-thumb-active')}
            onClick={() => setActiveIndex(index)}
          >
            {asset.type === 'video' ? (
              <video src={asset.src} muted aria-hidden="true" />
            ) : (
              <Image src={asset.src} alt="" fill sizes="64px" />
            )}
          </button>
        ))}
      </div>

      {/* Mobile (<768px): dot indicators for the swipeable full-bleed view. */}
      <div className="gallery-dots flex md:hidden" role="tablist" aria-label={referenceFrameLabel}>
        {assets.map((asset, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={asset.alt}
            className={cn('gallery-dot', index === activeIndex && 'gallery-dot-active')}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
