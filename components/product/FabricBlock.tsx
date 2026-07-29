import { OpacityRating, type OpacityLevel } from '@/components/product/OpacityRating';

export interface FabricBlockProps {
  materialLabel: string;
  materialValue: string;
  weightLabel: string;
  weightValue: string;
  lengthLabel: string;
  lengthValue: string;
  opacityLabel: string;
  opacity: OpacityLevel;
  opacityValueLabel: string;
}

/**
 * Renders material, GSM, length and opacity as a labelled list — every
 * field mandatory, none omitted for missing data (docs/3-components.md §3.5).
 */
export function FabricBlock({
  materialLabel,
  materialValue,
  weightLabel,
  weightValue,
  lengthLabel,
  lengthValue,
  opacityLabel,
  opacity,
  opacityValueLabel,
}: FabricBlockProps) {
  return (
    <dl className="spec-list">
      <div className="spec-row">
        <dt className="spec-row-term">{materialLabel}</dt>
        <dd>{materialValue}</dd>
      </div>
      <div className="spec-row">
        <dt className="spec-row-term">{weightLabel}</dt>
        <dd>{weightValue}</dd>
      </div>
      <div className="spec-row">
        <dt className="spec-row-term">{lengthLabel}</dt>
        <dd>{lengthValue}</dd>
      </div>
      <div className="spec-row">
        <dt className="spec-row-term">{opacityLabel}</dt>
        <dd>
          <OpacityRating value={opacity} label={opacityValueLabel} />
        </dd>
      </div>
    </dl>
  );
}
