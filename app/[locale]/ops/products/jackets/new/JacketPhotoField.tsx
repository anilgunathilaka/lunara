'use client';

import { useState } from 'react';

/**
 * The jacket's photograph, chosen in the add-jacket form (founder decision
 * 2026-11-14: jackets are shown by their photograph, not a colour). The
 * file is sent with the form, stored byte-for-byte (docs/4-architecture.md
 * §4). Its average colour is worked out here, in the browser, and sent as
 * the jacket's stand-in colour: the block shown while the photograph loads,
 * and the tint the 3D preview uses.
 */
export function JacketPhotoField({ label, hint }: { label: string; hint: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [colour, setColour] = useState('');

  function choose(file: File | undefined) {
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setPreview(null);
      setColour('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    const image = new Image();
    image.onload = () => {
      // Shrink to a few pixels and average them: enough for a stand-in colour.
      const size = 16;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(image, 0, 0, size, size);
      const data = context.getImageData(0, 0, size, size).data;
      let r = 0;
      let g = 0;
      let b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]!;
        g += data[i + 1]!;
        b += data[i + 2]!;
      }
      const n = data.length / 4;
      const part = (v: number) => Math.round(v / n).toString(16).padStart(2, '0');
      setColour(`#${part(r)}${part(g)}${part(b)}`);
    };
    image.src = url;
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="field-label" htmlFor="swatch">
        {label}
      </label>
      <input
        id="swatch"
        name="swatch"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="input"
        required
        onChange={(event) => choose(event.target.files?.[0])}
      />
      <input type="hidden" name="colourHex" value={colour} />
      <p className="field-message">{hint}</p>
      {preview && (
        // A local object URL: next/image cannot load it, a plain img can.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="ops-jacket-preview" />
      )}
    </div>
  );
}
