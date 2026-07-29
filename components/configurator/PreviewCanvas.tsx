'use client';

import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { RotationControl } from '@/components/configurator/RotationControl';

export interface PreviewCanvasProps {
  /** The already-composited frame for the current combination — server-rendered, never composited client-side. */
  frameUrl: string;
  frameAlt: string;
  frameCount: number;
  frameIndex: number;
  onRotate: (frameIndex: number) => void;
  /** Fires on image load failure — the caller swaps to FallbackNotice + static imagery (UX-C9). */
  onRenderFailure?: () => void;
  rotateLeftLabel: string;
  rotateRightLabel: string;
}

// One frame of rotation per this many pixels of drag — a UX feel constant,
// not a design token.
const DRAG_PIXELS_PER_FRAME = 12;

/**
 * docs/3-components.md §4.1. Pure --lun-surface, no border/shadow/motif —
 * this is the one place the brand's signature devices don't appear.
 * Assumes the frame image comes from a server-side compositor keyed on
 * design/material/colour/jacket/drape/frame (docs/4-architecture.md §5) —
 * this component only displays and rotates, it never composites.
 */
export function PreviewCanvas({
  frameUrl,
  frameAlt,
  frameCount,
  frameIndex,
  onRotate,
  onRenderFailure,
  rotateLeftLabel,
  rotateRightLabel,
}: PreviewCanvasProps) {
  const dragStartX = useRef<number | null>(null);
  const dragStartFrame = useRef(frameIndex);

  function step(delta: number) {
    onRotate((frameIndex + delta + frameCount) % frameCount);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    dragStartX.current = event.clientX;
    dragStartFrame.current = frameIndex;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return;
    const deltaX = event.clientX - dragStartX.current;
    const frameDelta = Math.trunc(deltaX / DRAG_PIXELS_PER_FRAME);
    const next = (dragStartFrame.current - frameDelta + frameCount * 100) % frameCount;
    if (next !== frameIndex) onRotate(next);
  }

  function handlePointerUp() {
    dragStartX.current = null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    }
  }

  return (
    <div
      className="preview-canvas"
      role="img"
      aria-label={frameAlt}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      {/* Dynamic, cache-keyed compositor output — not a static local asset,
          so next/image's remote-pattern config doesn't fit here. Remounting
          on frameUrl change retriggers the cross-fade animation below. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={frameUrl}
        src={frameUrl}
        alt=""
        className="preview-canvas-frame"
        onError={() => onRenderFailure?.()}
        draggable={false}
      />
      <RotationControl
        onRotateLeft={() => step(-1)}
        onRotateRight={() => step(1)}
        rotateLeftLabel={rotateLeftLabel}
        rotateRightLabel={rotateRightLabel}
      />
    </div>
  );
}
