export interface JacketBlockProps {
  materialName: string;
  /** True sampled fabric colour — catalogue data, never a design token. */
  swatchHex: string;
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
  pieceLengthLabel,
  shipsUnstitchedLabel,
}: JacketBlockProps) {
  return (
    <div className="jacket-block">
      <div className="spec-row">
        <span className="mini-swatch" style={{ backgroundColor: swatchHex }} aria-hidden="true" />
        <span>{materialName}</span>
      </div>
      <p className="spec-row-term">{pieceLengthLabel}</p>
      <p className="jacket-block-unstitched">{shipsUnstitchedLabel}</p>
    </div>
  );
}
