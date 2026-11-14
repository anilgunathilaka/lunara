import Image from 'next/image';
export interface JacketBlockProps {
  materialName: string;
  /** True sampled fabric colour — catalogue data, never a design token. */
  swatchHex: string;
  /** The jacket's photograph (founder decision 2026-11-14), shown in place of the colour block. */
  swatchUrl?: string | null;
  /** Already formatted, e.g. "2.2 m jacket material". */
  pieceLengthLabel: string;
  /** Already translated. MUST render at weight 600, never fine print. */
  shipsUnstitchedLabel: string;
}

/**
 * docs/3-components.md §3.5 — the product's most likely misunderstanding,
 * so the "ships unstitched" phrase is never optional and never small.
 */
export function JacketBlock({
  materialName,
  swatchHex,
  swatchUrl,
  pieceLengthLabel,
  shipsUnstitchedLabel,
}: JacketBlockProps) {
  return (
    <div className="jacket-block">
      <div className="spec-row">
        <span className={swatchUrl ? 'jacket-block-photo' : 'mini-swatch'} style={{ backgroundColor: swatchHex }} aria-hidden="true">
          {swatchUrl && <Image src={swatchUrl} alt="" fill sizes="64px" />}
        </span>
        <span>{materialName}</span>
      </div>
      <p className="spec-row-term">{pieceLengthLabel}</p>
      <p className="jacket-block-unstitched">{shipsUnstitchedLabel}</p>
    </div>
  );
}
